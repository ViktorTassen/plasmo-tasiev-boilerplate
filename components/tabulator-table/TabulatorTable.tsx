import React, { useRef, useEffect, useState } from "react";
import { DateTime } from "luxon";
import { ReactTabulator } from 'react-tabulator';
import "tabulator-tables/dist/css/tabulator.min.css";
import XLSX from 'xlsx/dist/xlsx.full.min.js';
import { useStorage } from "@plasmohq/storage/hook";
import { Storage } from "@plasmohq/storage";
import columns from "./columnsData";
import { sendToBackground } from "@plasmohq/messaging"
import { updateApiCounter } from "~firebase";

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
  });
  const [license, setLicense] = useStorage("license");
  const [uid] = useStorage("firebaseUid");
  const [loading, setLoading] = useState(true);
  const [download, setDownload] = useStorage("download");
  const [isEnriching, setIsEnriching] = useStorage("isEnriching");
  const [col, setCol] = useState(columns);
  const [filters, setFilters] = useStorage("filters");
  const [filtersListener, setFiltersListener] = useState(false);
  const [dateRange1] = useStorage("1");
  const [dateRange2] = useStorage("2");

  useEffect(() => {
    if (tableRef.current) {
      // Handle download logic
      if (download === true) {
        if (dateRange1) {
          columns.find(column => column.title === '1').titleDownload = getDateRangeString(dateRange1);
        }
        if (dateRange2) {
          columns.find(column => column.title === '2').titleDownload = getDateRangeString(dateRange2);
        }
        tableRef.current.setColumns(columns);
        tableRef.current.download('xlsx', "Raptor-Turrex-Data.xlsx");
        setDownload(false);
      }

      // Update table data
      if (tableData && license) {
        const data = modifyData(tableData, dateRange1, dateRange2).slice(0, license.license ? undefined : 5);
        tableRef.current.replaceData(data);
        setLoading(false);
      }

      // Set filters if they exist
      if (!filtersListener) {
        setFiltersListener(true);
        tableRef.current.on("dataFiltered", (headerFilters, rows) => {
          if (JSON.stringify(headerFilters) !== JSON.stringify(filters)) {
            setFilters(headerFilters);
          }
        });
      }

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
  }, [tableData, license, download, dateRange1, dateRange2, filters, filtersListener]);

  useEffect(() => {
    const enrichTableData = async () => {
      if (isEnriching) {
        try {
          const result = await processVehicles(tableData.slice(0, license.license ? undefined : 5), uid);
          if (!result) {
            setIsEnriching(false);
          } else {
            setIsEnriching(false);
          }
        } catch (error) {
          console.error('Error processing vehicles:', error);
          setIsEnriching(false);
        }
      }
    };

    enrichTableData();
  }, [tableData, isEnriching, license]);

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
  }, [dateRange1, dateRange2]);

  const options = {
    downloadDataFormatter: (data) => data,
    downloadReady: (fileContents, blob) => blob,
  };

  const downloadConfig = {
    columnGroups: true,
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
      />
    </React.Fragment>
  );
}


export default TabulatorTable;




const processVehicles = async (vehicles ,uid) => {
  const vehiclesToProcess = vehicles.filter(vehicle => vehicle.createdAt === undefined);
  if (vehiclesToProcess.length === 0) {
    console.log('No vehicles to process');
    return false;
  }

  console.log('Vehicles to process:', vehiclesToProcess);

  let enrichedCount = 0;

  
  await updateApiCounter(uid, vehiclesToProcess.length);

  // Helper function to introduce a delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Processing vehicles in batches
  const batchSize = 100; // Number of vehicles to process concurrently in each batch
  for (let i = 0; i < vehiclesToProcess.length; i += batchSize) {
    const batch = vehiclesToProcess.slice(i, i + batchSize);

    // Create promises for the current batch
    const promises = batch.map(async (vehicleToProcess) => {
      try {
        const resp = await sendToBackground({
          name: "brightData",
          body: {
            targetVehicleUrl: "https://turo.com/api/vehicle/detail?vehicleId=" + vehicleToProcess.id,
            targetDailyPricingUrl: createDailyPricingUrl(vehicleToProcess.id)
          }
        });

        if (resp !== false) {
          // Update the vehicle with the new data
          const vehicle = resp;
          const existingVehicle = vehicles.find(v => v.id === vehicle.id);

          if (existingVehicle) {
            console.log('existingVehicle', existingVehicle);
            // Update the existing vehicle by copying properties from the new vehicle
            Object.assign(existingVehicle, vehicle);
          } else {
            // Add a new vehicle
            vehicles.push(vehicle);
          }

          // Increment enriched count
          enrichedCount++;
        } else {
          console.error('Failed to fetch data for vehicle:', vehicleToProcess.id);
        }

        // Update progress after each vehicle is processed
        const qtyTotal = vehicles.length;
        storage.set("qtyAll", `${enrichedCount}/${qtyTotal}`);

      } catch (error) {
        console.error('Error processing vehicle:', vehicleToProcess.id, error);
      }
    });

    // Wait for all promises in the batch to complete
    await Promise.all(promises);

    // Introduce a delay between batches
    if (i + batchSize < vehiclesToProcess.length) {
      await delay(1000); // 1-second delay between batches
    }
  }

  // Save the updated vehicles list back to storage
  await storageLocal.set("vehicles", vehicles);

  // Final count and update
  const qtyEnriched = vehicles.reduce((acc, v) => (v.createdAt !== undefined ? acc + 1 : acc), 0);
  const qtyTotal = vehicles.length;
  storage.set("qtyAll", `${qtyEnriched}/${qtyTotal}`);

  return true;
};






const createDailyPricingUrl = (vehicleId) => {
  let endDate = DateTime.now().plus({ month: 1 }).toFormat('MM/dd/yyyy');
  let startDate = DateTime.now().minus({ year: 1 }).toFormat('MM/dd/yyyy');
  let endDateEncoded = encodeURIComponent(endDate.toString());
  let startDateEncoded = encodeURIComponent(startDate.toString());
  return `https://turo.com/api/vehicle/daily_pricing?end=${endDateEncoded}&start=${startDateEncoded}&vehicleId=${vehicleId}`;
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


function replaceSpacesWithHyp(string) {
  if (!string) return;
  return string.replace(/\s/g, '-');
}
