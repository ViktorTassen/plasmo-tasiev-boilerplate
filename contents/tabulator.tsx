import React, { useEffect, useRef } from "react";
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"


import { ReactTabulator, type ColumnDefinition } from 'react-tabulator';



import "tabulator-tables/dist/css/tabulator.min.css"; // Import Tabulator stylesheet

import styleText from "data-text:tabulator-tables/dist/css/tabulator.min.css";

import type { PlasmoGetStyle } from "plasmo"

export const getStyle: PlasmoGetStyle = () => {
    const style = document.createElement("style")
    style.textContent = styleText
    return style
}

export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*/search*"],
    run_at: "document_start",
}


export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
    document.querySelector(`#turrex-table`)




function TabulatorTable() {
    console.log('TabulatorTable');

    let tableRef = useRef(null);
    

    const storage = new Storage(); // for watching changes in storage
    storage.watch({
        "downloadTrigger": (c) => {
          console.log('downloadTrigger:', c.newValue)
          if (c.newValue === true) {
            tableRef.current.download("csv", "Turrex-Data.csv");
            storage.set("downloadTrigger", false);
          }
        }
      });




    const [tableData, setTableData] = useStorage({
        key: "vehicles",
        instance: new Storage({
            area: "local"
        })
    }) // get vehicles from local storage

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
        { title: "Depreciation Y1*", field: "ownershipCost1" },
        { title: "Insurance Y*", field: "insurance" },
        { title: "Maintenance Y*", field: "maintenance" },
        { title: "Avg Repairs Y*", field: "repairs" },
    ]


    useEffect(() => {
        if (tableRef.current) {
            const data = formatVehiclesData(tableData);
            tableRef.current.replaceData(data);
        }
    }, [tableData]); // Empty dependency array to run this effect only once after initial render

    
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



