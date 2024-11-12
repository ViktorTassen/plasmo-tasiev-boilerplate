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

  const [enrichedCount, setEnrichedCount] = useState(0);



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
          await processVehiclesInBatches();
        } catch (error) {
          console.error('Error processing vehicles:', error);
        } finally {
          setIsEnriching(false);
        }
      }
    };

    enrichTableData();
  }, [isEnriching]);


  const processVehiclesInBatches = async () => {
    const batchSize = 100;
    let vehiclesToProcess = tableData.filter(vehicle => vehicle.createdAt === undefined);
    await updateApiCounter(uid, vehiclesToProcess.length);
  
    let enrichedCountLocal = enrichedCount;
  
    // Update qtyAll initially and then set an interval to update it every 3 seconds
    storage.set("qtyAll", `${enrichedCountLocal}/${tableData.length}`);
    const updateInterval = setInterval(() => {
      storage.set("qtyAll", `${enrichedCountLocal}/${tableData.length}`);
    }, 3000);
  
    const retryQueue = [];
  
    // Process initial batches
    while (vehiclesToProcess.length > 0 && isEnriching) {
      if (!isEnriching) {
        clearInterval(updateInterval);
        console.log('Enrichment process stopped by user.');
        break;
      }
  
      const batch = vehiclesToProcess.slice(0, batchSize);
      vehiclesToProcess = vehiclesToProcess.slice(batchSize);
  
      await Promise.all(batch.map(async (vehicle) => {
        try {
          await enrichVehicle(vehicle);
          enrichedCountLocal++;
          setEnrichedCount(enrichedCountLocal);
        } catch (error) {
          console.error(`Error enriching vehicle ${vehicle.id}, adding to retry queue`, error);
          retryQueue.push(vehicle);
        }
      }));
    }
  
    // Retry failed vehicles after initial batches are complete
    let retryAttempts = 0;
    const maxRetryAttempts = 3;
  
    while (retryQueue.length > 0 && retryAttempts < maxRetryAttempts && isEnriching) {
      if (!isEnriching) {
        clearInterval(updateInterval);
        console.log('Enrichment process stopped by user.');
        break;
      }
  
      console.log(`Retry attempt ${retryAttempts + 1} for ${retryQueue.length} vehicles.`);
      const currentRetryQueue = [...retryQueue];
      retryQueue.length = 0;
  
      await Promise.all(currentRetryQueue.map(async (vehicle) => {
        try {
          await enrichVehicle(vehicle);
          enrichedCountLocal++;
          setEnrichedCount(enrichedCountLocal);
        } catch (error) {
          console.error(`Error enriching vehicle ${vehicle.id} on retry attempt ${retryAttempts + 1}`, error);
          retryQueue.push(vehicle);
        }
      }));
  
      retryAttempts++;
    }
  
    // Stop the interval and save the final qtyAll value
    clearInterval(updateInterval);
    storage.set("qtyAll", `${enrichedCountLocal}/${tableData.length}`);
  
    if (retryQueue.length === 0) {
      console.log('All vehicles enriched successfully.');
    } else {
      console.log(`${retryQueue.length} vehicles could not be enriched after ${maxRetryAttempts} retries.`);
    }
  
    // Save the final state of the vehicles to local storage
    await storageLocal.set("vehicles", tableData);
  };
  
  const enrichVehicle = async (vehicle) => {
    const maxRetries = 1; // Only one attempt during the initial batch processing
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const resp = await sendToBackground({
          name: "brightData",
          body: {
            targetVehicleUrl: "https://turo.com/api/vehicle/detail?vehicleId=" + vehicle.id,
            targetDailyPricingUrl: createDailyPricingUrl(vehicle.id)
          }
        });
  
        if (resp !== false) {
          Object.assign(vehicle, resp);
          return;
        } else {
          throw new Error(`Failed to fetch data for vehicle: ${vehicle.id}`);
        }
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          throw error;
        }
        console.warn(`Retrying vehicle ${vehicle.id}, attempt ${attempt}`);
      }
    }
  };
  

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
    const result = filterArrayUsingDateRange(vehicle.vehicleDailyPricing, range, vehicle.weeklyDiscountPercentage, vehicle.monthlyDiscountPercentage);

    // Modify the original vehicle object
    if (result) {
      vehicle['busy' + id] = result.days;
      vehicle['income' + id] = result.income;
    }

  });
}
function filterArrayUsingDateRange(data, range, weeklyDiscountPercentage, monthlyDiscountPercentage) {

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
  const totalEarned = filteredDates.reduce((sum, item) => sum + item.price, 0).toFixed(0);
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

