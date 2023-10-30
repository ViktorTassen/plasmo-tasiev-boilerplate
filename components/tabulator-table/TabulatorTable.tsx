import React, { useRef, useEffect, useState } from "react";
import { DateTime } from "luxon";
// import { TabulatorFull as Tabulator } from 'tabulator-tables';
import "tabulator-tables/dist/css/tabulator.min.css"; // Import Tabulator stylesheet
import { ReactTabulator } from 'react-tabulator';

import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"



function TabulatorTable() {
    let tableRef = useRef(null);

    const [tableData, setTableData] = useStorage({
          key: "vehicles",
          instance: new Storage({
              area: "local",
          })
      }) // get vehicles from local storage

    const columnsData = [
          { title: "ID", field: "id", width: 50 },
          { title: "City", field: "address", width: 90 },
          { title: "Type", field: "type", width: 50 },
          { title: "Make", field: "make", width: 90 },
          { title: "Model", field: "model", width: 90 },
          { title: "Year", field: "year" },
          { title: "Color", field: "color" },
          { title: "Trim", field: "trim", width: 90 },
          // { title: "CreatedAt", field: "createdAt", sorter: "date" },
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
          // { title: "URL", field: "vehicleURL", width: 200, formatter: "link", formatterParams: { labelField: "vehicleURL", target: "_blank" } },
          { title: "Features", field: "features", width: 300 },

          { title: "Avg Market $*", field: "marketValue" },
          { title: "Depreciation Y1*", field: "ownershipCost1" },
          { title: "Insurance Y*", field: "insurance" },
          { title: "Maintenance Y*", field: "maintenance" },
          { title: "Avg Repairs Y*", field: "repairs" },
    ]


    const [download, setDownload] = useStorage("download")
    const [isEnriching, setIsEnriching] = useStorage("isEnriching") 
    const [isProcess, setIsProcess] = useStorage("isProcess")


      useEffect(() => {
        if (tableRef.current) {
            if (download === true) {
                tableRef.current.download("csv", "Turrex-Data.csv");
                setDownload(false)
            };  
        }
    }, [download]); 


      useEffect(() => {
        if (tableRef.current) {
          // Assuming formatVehiclesData and tableData are defined elsewhere
          const data = formatVehiclesData(tableData);
          tableRef.current.replaceData(data);
        }
      }, [tableData]); // Empty dependency array to run this effect only once after initial render

      useEffect(() => {
        if (tableRef.current && isEnriching && !isProcess) {
          (async () => {
  
            try {
              console.log('trying to enrich, setIsProcess becomes True')
              setIsProcess(true);
              const storage = new Storage({ area: 'local' });
              const vehicles = await storage.get('vehicles');

              await processVehicles(vehicles);

            } catch (error) {
              console.error('Error in useEffect:', error);
              setIsProcess(false);

            } finally {
              console.log('Finally');
              setIsProcess(false);
            }
          })();
        } else if (tableRef.current && !isEnriching) {
          // if isErinching turns false and isProcess is true, then stop processing
          console.log('gere')
          setIsProcess(false);
        };

      }, [isEnriching]);




      return (
          <ReactTabulator 
            columns={columnsData}
            layout={"fitDataFill"}
            onRef={(r) => (tableRef.current = r.current)}
            renderVerticalBuffer="500"
            height="75vh"
          />
        )

}
export default TabulatorTable;


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


async function processVehicles(vehicles) {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  let count = 0;
  for (const vehicle of vehicles) {
      if (vehicle.createdAt === undefined) {

          if (!(await getIsProcess())) {
              break;
          } // stop processing if user clicked on "Stop enriching" button

          console.log('this vehicle will be enriched: ', vehicle);
          // fetching Turo for raw data
          const vehicleDetails = await fetchVehicle(vehicle.id); // Turo API
          await delay(500);
          const vehicleDailyPricing = await fetchDailyPricing(vehicle.id); // Turo API
          await delay(500);


          // adding Turo raw data to vehicle object
          // too much data for localStorage, need to redo
          // vehicle.vehicleDetails = vehicleDetails;
          // vehicle.vehicleDailyPricing = vehicleDailyPricing.dailyPricingResponses;



          // await fetchMarketValue(); // VIN API
          // await fetchOwnershipCost(); // VIN API

          // final step to process raw data and add it to vehicle object for display it table
          await addProcessedDataToVehicle(vehicle, vehicleDetails, vehicleDailyPricing.dailyPricingResponses);

          const storage = new Storage({ area: 'local' })
          await storage.set('vehicles', vehicles)

          // count++;
          // if (count === 5) {
          //     break;
          // }
      }
  };
  
};


const addProcessedDataToVehicle = async (vehicle, vehicleDetails, vehicleDailyPricing) => {

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

  vehicle.averagePrice = (vehicle.totalEarned365 / vehicle.busy365).toFixed(0)
  if (vehicle.averagePrice === 'NaN') {
      vehicle.averagePrice = '';
  };

  vehicle.tripDayRatio = ((vehicle.completedTrips / vehicle.daysOn).toFixed(2));
  if (vehicle.tripDayRatio === 'NaN') {
      vehicle.tripDayRatio = '';
  };

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
          console.log('fetchDailyPricing', data);
          return data;
      } else {
          console.error("Response is not OK. Status: " + response.status);
      }
  } catch (error) {
      console.error(error);
  };
};
function convertArrayToString(arr: any[]) {
  const labels = arr.map(item => item.label);
  return labels.join(", ");
}

async function getIsProcess() {
  const storage = new Storage()
  const isProcess = await storage.get('isProcess')
  console.log('getIsProcess in loop: ', isProcess);
  return isProcess;
}







