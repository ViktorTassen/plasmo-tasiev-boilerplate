import React, { useRef, useEffect, useState } from "react";
import { DateTime } from "luxon";
import { ReactTabulator } from 'react-tabulator';
import "tabulator-tables/dist/css/tabulator.min.css";
import XLSX from 'xlsx/dist/xlsx.full.min.js';
import { useStorage } from "@plasmohq/storage/hook";
import { Storage } from "@plasmohq/storage";
import columns from "./columnsData";

declare global {
  interface Window {
    XLSX: any;
  }
}

window.XLSX = XLSX;
const storage = new Storage();
const storageLocal = new Storage({ area: 'local' });




function TabulatorTable() {
  let tableRef = useRef(null);
  const [tableData, setTableData] = useStorage({
    key: "vehicles", instance: storageLocal
  }) // get vehicles from local storage

  const [license, setLicense] = useStorage("license")
  const [loading, setLoading] = useState(true)
  const [download, setDownload] = useStorage("download")
  const [isEnriching, setIsEnriching] = useStorage("isEnriching")
  const [col, setCol] = useState(columns)
  const [filters, setFilters] = useStorage("filters")
  const [filtersListener, setFiltersListener] = useState(false)

  const [dateRange1] = useStorage("1")
  const [dateRange2] = useStorage("2")

  // // next update
  // const [selectedCar, setSelectedCar] = useStorage("selectedCar")

  useEffect(() => {
    if (tableRef.current && download === true) {
      if (dateRange1) {
        columns.find(column => column.title === '1').titleDownload = getDateRangeString(dateRange1);
      }
      if (dateRange2) {
        columns.find(column => column.title === '2').titleDownload = getDateRangeString(dateRange2);
      }
      tableRef.current.setColumns(columns);
      tableRef.current.download('xlsx', "Turrex-Data.xlsx");
      setDownload(false);
    }
  }, [download, dateRange1, dateRange2]);


 useEffect(() => {
    if (tableRef.current && tableData && license) {
      const data = modifyData(tableData, dateRange1, dateRange2).slice(0, license.license ? undefined : 5);
      tableRef.current.replaceData(data);
      setLoading(false);
    }
  }, [tableData, license, dateRange1, dateRange2]);


  useEffect(() => {
    const enrichTableData = async () => {
      if (isEnriching) {
        try {
          const result = await processVehicle(tableData.slice(0, license.license ? undefined : 5));
          if (!result) {
            setIsEnriching(false);
          }
        } catch (error) {
          console.error('Error processing vehicle:', error);
          setIsEnriching(false);
        }
      }
    };

    enrichTableData();
  }, [tableData, isEnriching, license]);


  useEffect(() => {
    if (tableRef.current) {

      if (!filtersListener) {
      setFiltersListener(true);
        tableRef.current.on("dataFiltered", (headerFilters, rows) => {
          if (JSON.stringify(headerFilters) != JSON.stringify(filters)) {
          setFilters(headerFilters);
          }
        });
      };

      filters?.forEach(filter => {
        if (filter.type === "like") {
          tableRef.current.setHeaderFilterValue(filter.field, filter.value);
        } else {
          const { start, end } = filter.value || {};
          const filterInputs = document.querySelectorAll(`[tabulator-field="${filter.field}"] input`) as NodeListOf<HTMLInputElement>;
          if (filterInputs.length === 2) {
            filterInputs[0].value = start;
            filterInputs[1].value = end;
            filterInputs[0].dispatchEvent(new Event('change'));
          }
        }
      });
    }
  }, [filters]);


  useEffect(() => {
    const dateRanges = [
      { id: "1", range: dateRange1 },
      { id: "2", range: dateRange2 },
    ];
    if (tableRef.current) {
      dateRanges.forEach(({ id, range }) => {
        const dateRangeElement = document.querySelector(`[date-range-id="${id}"]`) as HTMLElement;
        if (dateRangeElement) {
          updateDateRangeElement(range, dateRangeElement);
        }
      });
    }
  }, [download, dateRange1, dateRange2]);


  // // next update
  // const rowClick = (e, row) => {
  //   setSelectedCar(row.getData().id);
  // };

  const options = {
    downloadDataFormatter: (data) => data,
    downloadReady: (fileContents, blob) => blob,
  };

  const downloadConfig = {
    columnGroups: true
  };

  return (
    <React.Fragment>
      <ReactTabulator
        columns={col}
        layout={"fitDataFill"}
        onRef={(r) => (tableRef.current = r.current)}
        renderVerticalBuffer="500"
        height="75vh"
        downloadConfig={downloadConfig}
        options={options}

      // // next update
      // selectable="1"
      // events={{
      //   rowClick: rowClick
      // }}
      />
    </React.Fragment>
  )
}

export default TabulatorTable;


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


const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const processVehicle = async (vehicles) => {
  const vehicleToProcess = vehicles?.find(vehicle => vehicle.createdAt === undefined);
  if (!vehicleToProcess) {
    console.log('No vehicles to process');
    return false;
  }
  // fetching Turo for raw data
  const vehicleDetails = await fetchVehicle(vehicleToProcess.id);
  let vehicleDailyPricing = await fetchDailyPricing(vehicleToProcess.id);
  vehicleDailyPricing = await removeUnusedDataFromDailyPricing(vehicleDailyPricing);
  // fetching 3d party
  const marketValue = await fetchMarketValue(vehicleDetails.vehicle.vin);
  // final step to process raw data and add it to vehicle object for display it table
  await addProcessedDataToVehicle(vehicleToProcess, vehicleDetails, vehicleDailyPricing, marketValue);
  // count quantities to show in progress bar
  const qtyEnriched = vehicles.reduce((acc, v) => (v.createdAt !== undefined ? acc + 1 : acc), 0);
  const qtyTotal = vehicles.length;
  await delay(300 + Math.random() * 1000);
  // save data to storage
  await storage.set("qtyAll", (qtyEnriched + "/" + qtyTotal))
  await storageLocal.set('vehicles', vehicles);
  
  return true;
};
const addProcessedDataToVehicle = async (vehicle, vehicleDetails, vehicleDailyPricing, marketValue) => {
  // const result30 = calculateBusyDaysAndIncome(vehicleDailyPricing, 30, 'past');
  // const result90 = calculateBusyDaysAndIncome(vehicleDailyPricing, 90, 'past');
  const result365 = calculateBusyDaysAndIncome(vehicleDailyPricing, 365, 'past');
  // const resultFuture30 = calculateBusyDaysAndIncome(vehicleDailyPricing, 30, 'future');

  // Add vehicleDetails data
  vehicle.address = vehicle.location.city + ', ' + vehicle.location.state;
  vehicle.color = vehicleDetails.color;
  vehicle.trim = vehicleDetails.vehicle.trim;
  vehicle.vin = vehicleDetails.vehicle.vin;
  vehicle.features = convertArrayToString(vehicleDetails.badges);
  vehicle.numberOfFavorites = vehicleDetails.numberOfFavorites;
  vehicle.numberOfReviews = vehicleDetails.numberOfReviews;
  vehicle.ratings = vehicleDetails.ratings.ratingToHundredth;
  vehicle.url = vehicleDetails.vehicle.url;
  vehicle.createdAt = new Date(vehicleDetails.vehicle.listingCreatedTime).toLocaleDateString();
  vehicle.daysOn = ((Date.now() - vehicleDetails.vehicle.listingCreatedTime) / (1000 * 3600 * 24)).toFixed(0);
  vehicle.plan = vehicleDetails.currentVehicleProtection.displayName;

  if (vehicleDetails.rate.dailyDistance.scalar) {
    vehicle.dailyDistance = vehicleDetails.rate.dailyDistance.scalar;
  } else {
    vehicle.dailyDistance = 999;
  }
  
  vehicle.weeklyDiscountPercentage = vehicleDetails.rate.weeklyDiscountPercentage;
  vehicle.monthlyDiscountPercentage = vehicleDetails.rate.monthlyDiscountPercentage;

  
  // add vehicleDailyPricing data to vehicle object
  vehicle.vehicleDailyPricing = vehicleDailyPricing;
  // Add vehicleDailyPricing data
  // vehicle.busy30 = result30.days;
  // vehicle.busy90 = result90.days;
  vehicle.busy365 = result365.days;
  // vehicle.busyFuture30 = resultFuture30.days;
  // vehicle.totalEarned30 = result30.income;
  // vehicle.totalEarned90 = result90.income;
  vehicle.totalEarned365 = result365.income;
  // vehicle.totalEarnedFuture30 = resultFuture30.income;

  // Add marketValue data
  if (marketValue?.prices?.below && marketValue?.prices?.average) {
    vehicle.marketValue = ((4 * marketValue?.prices.below + marketValue?.prices.average) / 5).toFixed(0);
  }

  if (vehicle.marketValue === 'NaN') {
    vehicle.marketValue = '';
  }

  // Calculate additional fields
  vehicle.averagePrice = (vehicle.totalEarned365 / vehicle.busy365).toFixed(0);
  if (vehicle.averagePrice === 'NaN') {
    vehicle.averagePrice = '';
  }

  vehicle.tripDayRatio = ((vehicle.completedTrips / vehicle.daysOn).toFixed(2));
  if (vehicle.tripDayRatio === 'NaN') {
    vehicle.tripDayRatio = '';
  }
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
      // console.log('fetchVehicle', data);
      return data;
    } else {
      console.error("Response is not OK. Status: " + response.status);
    }
  } catch (error) {
    console.error(error);
  }
};
const fetchDailyPricing = async (vehicleId: any) => {
  let endDate = DateTime.now().plus({ month: 1 }).toFormat('MM/dd/yyyy');
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
      return data.dailyPricingResponses;
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

const removeUnusedDataFromDailyPricing = async (data) => {
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
const updateDateRangeElement = (dateRange, dateRangeElement) => {
  if (dateRange) {
    const startDate = DateTime.fromISO(dateRange[0].startDate).toFormat('MMM d, yyyy');
    const endDate = DateTime.fromISO(dateRange[0].endDate).toFormat('MMM d, yyyy');
    dateRangeElement.innerHTML = `${startDate} - ${endDate}`;
  }
};
const getDateRangeString = (dateRange) => {
  if (dateRange) {
    const startDate = DateTime.fromISO(dateRange[0].startDate).toFormat('MMM d, yyyy');
    const endDate = DateTime.fromISO(dateRange[0].endDate).toFormat('MMM d, yyyy');
    return `${startDate} - ${endDate}`;
  }
};




function modifyData(data, dateRange1, dateRange2) {
  if (dateRange1) {
    loopVehiclesApplyDateRange(data, dateRange1, '1')
  }
  if (dateRange2) {
    loopVehiclesApplyDateRange(data, dateRange2, '2')
  }
  return data
}
function loopVehiclesApplyDateRange(data, range, id) {
  if (!data) return;
  data.forEach(vehicle => {
    const result = filterArrayUsingDateRange(vehicle.vehicleDailyPricing, range);
    // Modify the original vehicle object
    if (result) {
      vehicle['busy' + id] = result.days;
      vehicle['income' + id] = result.income;
    }

  });
}
function filterArrayUsingDateRange(data, range) {

  if (!data) return;
  if (!range) return;

  let startDate = new Date(range[0].startDate).getTime(); // in ms
  let endDate = new Date(range[0].endDate).getTime() + 86400000;  // in ms

  // Filter the objects based on the date range
  const filteredDates = data.filter(obj => {
    const objDate = dateStringConversion(obj.date).getTime();
    return objDate >= startDate && objDate <= endDate;
  });
  const daysUnavailable = filteredDates.length;
  const totalEarned = filteredDates.reduce((sum, item) => sum + item.price, 0);
  return { days: daysUnavailable, income: totalEarned };
}
function dateStringConversion(dateString) {
  // Parse the string manually to create a Date object
  var parts = dateString.split('-');
  var year = parseInt(parts[0]);
  var month = parseInt(parts[1]) - 1; // Months are zero-based, so subtract 1
  var day = parseInt(parts[2]);

  // Create a Date object with the specified date
  var dateObject = new Date(year, month, day);

  // Set the time to 10 AM
  dateObject.setHours(10, 0, 0, 0);

  return dateObject
}