import React, { useRef, useEffect, useState } from "react";
import { DateTime } from "luxon";
import "tabulator-tables/dist/css/tabulator.min.css"; // Import Tabulator stylesheet
import { ReactTabulator, type ColumnDefinition } from 'react-tabulator';

import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"
import { table } from "console";

const storage = new Storage();
const storageLocal = new Storage({ area: 'local' });

function TabulatorTable() {
  let tableRef = useRef(null);

  const [tableData, setTableData] = useStorage({
    key: "vehicles",
    instance: new Storage({
      area: "local",
    })
  }) // get vehicles from local storage

  const [license, setLicense] = useStorage("license")
  const [loading, setLoading] = useState(true)
  const [download, setDownload] = useStorage("download")
  const [isEnriching, setIsEnriching] = useStorage("isEnriching")

  useEffect(() => {
    if (tableRef.current) {
      if (download === true) {
        tableRef.current.download("csv", "Turrex-Data.csv");
        setDownload(false)
      };
    }
  }, [download]);

  useEffect(() => {
    if (tableRef.current && tableData && license) {
      let data;
      if (license.license == false) {
        data = formatVehiclesData(tableData.slice(0, 5));
      } else {
        data = formatVehiclesData(tableData);
      }
      tableRef.current.replaceData(data);
      setLoading(false);
    }
  }, [tableData, license]); // Empty dependency array to run this effect only once after initial render

  useEffect(() => {
    const enrichTableData = async () => {
      if (isEnriching) {
        try {
          let result;
          if (license.license == false) {
          result = await processVehicle(tableData.slice(0, 5));
          } else {
          result = await processVehicle(tableData);
          }

          if (!result) {
            setIsEnriching(false);
          };

        } catch (error) {
          console.error('Error processing vehicle:', error);
          setIsEnriching(false);
        }
      }
    };
  
    enrichTableData();
  }, [tableData, isEnriching]);

  const columnsData: ColumnDefinition[] = [
    { title: "ID", field: "id", width: 50 },
    { title: "City", field: "address", width: 90 },
    { title: "Type", field: "type", width: 50 },
    { title: "Make", field: "make", width: 90 },
    { title: "Model", field: "model", width: 90 },
    { title: "Year", field: "year" },
    { title: "Color", field: "color" },
    { title: "Trim", field: "trim", width: 90 },
    { title: "CreatedAt", field: "createdAt", sorter: "date" },
    { title: "Days", field: "daysOn" },
    { title: "Trips", field: "tripsTaken" },
    { title: "T/D", field: "tripDayRatio" },
    { title: "$day", field: "averagePrice" },

    { title: "Busy30", field: "busy30" },
    { title: "Busy90", field: "busy90" },
    { title: "Busy365", field: "busy365" },

    { title: "Gross30", field: "totalEarned30" },
    { title: "Gross90", field: "totalEarned90" },
    { title: "Gross365", field: "totalEarned365" },

    { title: "Plan", field: "plan" },

    { title: "Favs", field: "numberOfFavorites" },
    { title: "Reviews", field: "numberOfReviews" },
    { title: "StarHost", field: "allStarHost" },
    { title: "HostId", field: "hostId" },
    { title: "URL", field: "vehicleURL", width: 200, formatter: "link", formatterParams: { labelField: "vehicleURL", target: "_blank" } },
    { title: "Features", field: "features", width: 300 },

    { title: "Avg Market $*", field: "marketValue" },
    // { title: "Depreciation Y1*", field: "ownershipCost1" },
    // { title: "Insurance Y*", field: "insurance" },
    // { title: "Maintenance Y*", field: "maintenance" },
    // { title: "Avg Repairs Y*", field: "repairs" },
  ]

  return (
    <ReactTabulator
      columns={columnsData}
      layout={"fitDataFill"}
      onRef={(r) => (tableRef.current = r.current)}
      renderVerticalBuffer="500"
      height="73vh"
      // movableColumns="true"
    />
  )
}

export default TabulatorTable;


// functions
function formatVehiclesData(vehicles) {
  if (!vehicles) return;

  const vehiclesData = vehicles.map(vehicle => {
    const vehicleData = {
      // these are available from the search page
      id: vehicle.id,
      address: vehicle.location.city + ', ' + vehicle.location.state,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      hostId: vehicle.hostId,
      allStarHost: vehicle.isAllStarHost, // +

      // these are available from the vehicle page
      color: vehicle.color,
      trim: vehicle.trim,
      createdAt: vehicle.createdAt, // +
      daysOn: vehicle.daysOn, // +
      tripsTaken: vehicle.completedTrips, // +
      tripDayRatio: vehicle.tripDayRatio, // +
      averagePrice: vehicle.averagePrice,

      // calculated from the vehicle page
      busy30: vehicle.busy30,
      busy90: vehicle.busy90,
      busy365: vehicle.busy365,
      totalEarned30: vehicle.totalEarned30,
      totalEarned90: vehicle.totalEarned90,
      totalEarned365: vehicle.totalEarned365,

      vehicleURL: vehicle.url,
      plan: vehicle.plan,
      insuranceCompany: vehicle.insuranceProvider,
      numberOfFavorites: vehicle.numberOfFavorites,
      numberOfReviews: vehicle.numberOfReviews,
      features: vehicle.features,

      // from API
      marketValue: vehicle.marketValue,
      ownershipCost1: vehicle.ownershipCost1,
      insurance: vehicle.insurance,
      maintenance: vehicle.maintenance,
      repairs: vehicle.repairs,
    }
    return vehicleData;
  })
  return vehiclesData;

};
function calculateBusyDaysAndIncome(data, days) {
  let endDate = DateTime.now().toFormat('MM/dd/yyyy');
  let startDate = DateTime.now().minus({ days: days }).toFormat('MM/dd/yyyy');
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
    if (day.wholeDayUnavailable) {
      daysUnavailable++;
      totalEarned += day.price;
      // calculate average price
    }

  });

  return { days: daysUnavailable, income: totalEarned };
};
function convertArrayToString(arr: any[]) {
  const labels = arr.map(item => item.label);
  return labels.join(", ");
}
// async functions
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const processVehicle = async (vehicles) => {
  const vehicleToProcess = vehicles?.find(vehicle => vehicle.createdAt === undefined);
  if (!vehicleToProcess) {
    console.log('No vehicles to process');
    return false;
  }
  // fetching Turo for raw data
  const vehicleDetails = await fetchVehicle(vehicleToProcess.id); // Turo API
  const vehicleDailyPricing = await fetchDailyPricing(vehicleToProcess.id); // Turo API
  const marketValue = await fetchMarketValue(vehicleDetails.vehicle.vin); // VIN API
  // await fetchOwnershipCost(); // VIN API

  // final step to process raw data and add it to vehicle object for display it table
  await addProcessedDataToVehicle(vehicleToProcess, vehicleDetails, vehicleDailyPricing.dailyPricingResponses, marketValue);
  
  const qtyEnriched = vehicles.reduce((acc, v) => (v.createdAt !== undefined ? acc + 1 : acc), 0);
  const qtyTotal = vehicles.length;

  await storage.set("qtyAll", (qtyEnriched + "/" + qtyTotal))
  await delay(600);
  await storageLocal.set('vehicles', vehicles);

  return true;
};
const addProcessedDataToVehicle = async (vehicle, vehicleDetails, vehicleDailyPricing, marketValue) => {

  const result30 = calculateBusyDaysAndIncome(vehicleDailyPricing, 30);
  const result90 = calculateBusyDaysAndIncome(vehicleDailyPricing, 90);
  const result365 = calculateBusyDaysAndIncome(vehicleDailyPricing, 365);

  // vehicleDetails
  vehicle.color = vehicleDetails.color;
  vehicle.trim = vehicleDetails.vehicle.trim;
  vehicle.vin = vehicleDetails.vehicle.vin;
  vehicle.features = convertArrayToString(vehicleDetails.badges);
  vehicle.numberOfFavorites = vehicleDetails.numberOfFavorites;
  vehicle.numberOfReviews = vehicleDetails.numberOfReviews;
  vehicle.url = vehicleDetails.vehicle.url;

  vehicle.createdAt = new Date(vehicleDetails.vehicle.listingCreatedTime).toLocaleDateString();
  vehicle.daysOn = ((Date.now() - vehicleDetails.vehicle.listingCreatedTime) / (1000 * 3600 * 24)).toFixed(0);

  vehicle.plan = vehicleDetails.currentVehicleProtection.displayName;


  // vehicleDailyPricing

  vehicle.busy30 = result30.days;
  vehicle.busy90 = result90.days;
  vehicle.busy365 = result365.days;

  vehicle.totalEarned30 = result30.income;
  vehicle.totalEarned90 = result90.income;
  vehicle.totalEarned365 = result365.income;


  if (marketValue?.prices?.below && marketValue?.prices?.average) {
    vehicle.marketValue = ((4 * marketValue?.prices.below + marketValue?.prices.average)/5).toFixed(0);
  };

  if (vehicle.marketValue === 'NaN') {
    vehicle.marketValue = '';
  }

  vehicle.averagePrice = (vehicle.totalEarned365 / vehicle.busy365).toFixed(0)
  if (vehicle.averagePrice === 'NaN') {
    vehicle.averagePrice = '';
  };

  vehicle.tripDayRatio = ((vehicle.completedTrips / vehicle.daysOn).toFixed(2));
  if (vehicle.tripDayRatio === 'NaN') {
    vehicle.tripDayRatio = '';
  };

};

const fetchVehicle = async (vehicleId: any) => {
  try {
    const response = await fetch("https://turo.com/api/vehicle/detail?vehicleId=" + vehicleId, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      console.log('fetchVehicle', data);
      return data;
    } else {
      console.error("Response is not OK. Status: " + response.status);
    }
  } catch (error) {
    console.error(error);
  }
};
const fetchDailyPricing = async (vehicleId: any) => {
  let endDate = DateTime.now().plus({ year: 1 }).toFormat('MM/dd/yyyy');
  let startDate = DateTime.now().minus({ year: 1 }).toFormat('MM/dd/yyyy');
  let endDateEncoded = encodeURIComponent(endDate.toString());
  let startDateEncoded = encodeURIComponent(startDate.toString());

  try {
    const response = await fetch(`https://turo.com/api/vehicle/daily_pricing?end=${endDateEncoded}&start=${startDateEncoded}&vehicleId=${vehicleId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      // console.log('fetchDailyPricing', data);
      return data;
    } else {
      console.error("Response is not OK. Status: " + response.status);
    }
  } catch (error) {
    console.error(error);
  };
};
const fetchMarketValue = async (vehicleVIN: any) => {
  try {
    const response = await fetch(`https://marketvalue.vinaudit.com/getmarketvalue.php?key=1HB7ICF9L0GVH5Q&vin=${vehicleVIN}&period=182&mileage=null&country=USA`, {
      signal: AbortSignal.timeout(1000),
      method: "GET",
    });
    if (response.ok) {
      const data = await response.json();
      // console.log('fetchMarketValue', data);
      return data;
    } else {
      console.error("Response is not OK. Status: " + response.status);
    }
  } catch (error) {
    console.error(error);
  };

};

