import { DateTime } from "luxon";
import { Storage } from "@plasmohq/storage"
const storageLocal = new Storage({ area: 'local' });


interface Vehicle {
    id: string;
    address: string;
    color: string;
    trim: string;
    vin: string;
    features: string;
    numberOfFavorites: number;
    numberOfReviews: number;
    ratings: number;
    url: string;
    createdAt: string;
    daysOn: number; // Change to number for arithmetic operations
    plan: string;
    dailyDistance: number;
    weeklyDiscountPercentage: number;
    monthlyDiscountPercentage: number;
    vehicleDailyPricing: any; // Define more specifically if possible
    busy365: number;
    totalEarned365: number;
    marketValue: any; // Define more specifically if needed
    averagePrice: string;
    tripDayRatio: string;
    completedTrips: number; // Added completedTrips as number
}



export const removeUnusedDataFromDailyPricing = async (data) => {
    data = data.filter(item => item.wholeDayUnavailable);
    data = data.map(item => {
        const filteredItem = {
            date: item.date,
            price: item.price,
        }
        return filteredItem;
    });
    return data;
}




export const formatVehicleData = async (vehicleDetails: any, vehicleDailyPricing: any): Promise<Vehicle> => {
    let vehicle: Vehicle = {} as Vehicle; // Initialize as an empty object with Vehicle type
    const result365 = calculateBusyDaysAndIncome(vehicleDailyPricing, 365, 'past');
     // Add vehicleDetails data
    vehicle.id = vehicleDetails.vehicle.id;
    vehicle.address = vehicleDetails.location.city + ', ' + vehicleDetails.location.state;
    vehicle.color = vehicleDetails.color;
    vehicle.trim = vehicleDetails.vehicle.trim;
    vehicle.vin = vehicleDetails.vehicle.vin;
    vehicle.features = convertArrayToString(vehicleDetails.badges);
    vehicle.numberOfFavorites = vehicleDetails.numberOfFavorites;
    vehicle.numberOfReviews = vehicleDetails.numberOfReviews;
    vehicle.ratings = vehicleDetails.ratings.ratingToHundredth;
    vehicle.url = vehicleDetails.vehicle.url;
    vehicle.createdAt = new Date(vehicleDetails.vehicle.listingCreatedTime).toLocaleDateString();
    vehicle.daysOn = Math.floor((Date.now() - vehicleDetails.vehicle.listingCreatedTime) / (1000 * 3600 * 24));
    vehicle.plan = vehicleDetails.currentVehicleProtection.displayName;
    vehicle.completedTrips = vehicleDetails.numberOfRentals || 0; // Default to 0 if not provided

    vehicle.dailyDistance = vehicleDetails.rate.dailyDistance.scalar || 999;
    vehicle.weeklyDiscountPercentage = vehicleDetails.rate.weeklyDiscountPercentage;
    vehicle.monthlyDiscountPercentage = vehicleDetails.rate.monthlyDiscountPercentage;

    // Add vehicleDailyPricing data to vehicle object
    vehicle.vehicleDailyPricing = await removeUnusedDataFromDailyPricing(vehicleDailyPricing);
    vehicle.vehicleDailyPricing = applyDiscountsToBookings(vehicle.vehicleDailyPricing, vehicle.weeklyDiscountPercentage, vehicle.monthlyDiscountPercentage);

    vehicle.busy365 = result365.days;
    vehicle.totalEarned365 = result365.income;
    vehicle.marketValue = null;

    // Calculate additional fields
    vehicle.averagePrice = (vehicle.totalEarned365 / vehicle.busy365).toFixed(0);
    if (vehicle.averagePrice === 'NaN') {
        vehicle.averagePrice = '';
    }

    vehicle.tripDayRatio = (vehicle.completedTrips / vehicle.daysOn).toFixed(2);
    if (vehicle.tripDayRatio === 'NaN') {
        vehicle.tripDayRatio = '';
    }

    return vehicle;
};



// Function to get all vehicles from storage
const getVehicles = async () => {
    let vehicles = [];
    vehicles = await storageLocal.get("vehicles") || [];
    return vehicles;
};


export const addOrUpdateVehicleInLocalStorage = async (vehicle) => {
    // Fetch the existing vehicles
    const vehicles = await getVehicles();
    console.log('vehicles', vehicles);

    // Find the existing vehicle by id
    const existingVehicle = vehicles.find(v => v.id === vehicle.id);

    if (existingVehicle) {
        console.log('existingVehicle', existingVehicle);
        // Update the existing vehicle by copying properties from the new vehicle
        Object.assign(existingVehicle, vehicle);
    } else {
        // Add a new vehicle
        vehicles.push(vehicle);
    }

    console.log('updated vehicles', vehicles);

    // Save the updated vehicles list back to storage
    await storageLocal.set("vehicles", vehicles);
};





// functions

function calculateBusyDaysAndIncome(data, days, direction) {
    // console.log('calculateBusyDaysAndIncome', data)
    let endDate;
    let startDate;

    if (direction == 'future') {
        endDate = DateTime.now().plus({ days: days }).toFormat('MM/dd/yyyy');
        startDate = DateTime.now().toFormat('MM/dd/yyyy');
    } else {
        endDate = DateTime.now().toFormat('MM/dd/yyyy');
        startDate = DateTime.now().minus({ days: days }).toFormat('MM/dd/yyyy');
    }
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter the objects based on the date range
    const filteredDates = data.filter(obj => {
        const objDate = new Date(obj.date);
        return objDate >= start && objDate <= end;
    });

    let daysUnavailable = 0;
    let totalEarned = 0;

    filteredDates.forEach(day => {
        daysUnavailable++;
        totalEarned += day.price;
        // calculate average price
    });

    return { days: daysUnavailable, income: totalEarned };
};

function convertArrayToString(arr: any[]) {
    const labels = arr.map(item => item.label);
    return labels.join(", ");
}


const applyDiscountsToBookings = (bookings, weeklyDiscount, monthlyDiscount) => {
    const DISCOUNT_THRESHOLD_WEEKLY = 6;
    const DISCOUNT_THRESHOLD_MONTHLY = 30;
    weeklyDiscount = weeklyDiscount / 100;
    monthlyDiscount = monthlyDiscount / 100;
  
    let currentStreak = [];
    let allStreaks = [];
  
    // Helper function to determine if two dates are consecutive
    const areDatesConsecutive = (date1, date2) => {
      const oneDay = 24 * 60 * 60 * 1000;
      return new Date(date2).getTime() - new Date(date1).getTime() === oneDay;
    };
  
    // Sort the bookings by date in ascending order
    bookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
    // Loop through bookings to find consecutive ranges
    for (let i = 0; i < bookings.length; i++) {
      if (i === 0 || areDatesConsecutive(bookings[i - 1].date, bookings[i].date)) {
        currentStreak.push(bookings[i]);
      } else {
        allStreaks.push(currentStreak);
        currentStreak = [bookings[i]];
      }
    }
    allStreaks.push(currentStreak);
  
    // Apply discounts to identified streaks
    allStreaks.forEach((streak) => {
      if (streak.length > DISCOUNT_THRESHOLD_MONTHLY) {
        streak.forEach((booking) => {
          booking.price *= 1 - monthlyDiscount;
        });
      } else if (streak.length > DISCOUNT_THRESHOLD_WEEKLY) {
        streak.forEach((booking) => {
          booking.price *= 1 - weeklyDiscount;
        });
      }
    });
  
    return bookings;
  };