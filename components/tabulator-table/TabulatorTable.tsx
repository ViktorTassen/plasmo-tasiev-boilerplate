import React from 'react';
import 'react-tabulator/lib/styles.css';
import 'react-tabulator/lib/css/tabulator.min.css'; // theme
import { ReactTabulator  } from 'react-tabulator'



import { myData } from './data';

function TabulatorTable() {
    console.log(myData);
    return (
        <ReactTabulator
            data={myData.data}
            columns={[
                { title: "ID", field: "id", width: 50 },
                { title: "City", field: "address", width: 90 },
                { title: "Type", field: "type", width: 50 },
                { title: "Make", field: "make", width: 90 },
                { title: "Model", field: "model", width: 90 },
                { title: "Year", field: "year" },
                { title: "Color", field: "color" },
                { title: "Trim", field: "trim" },
                { title: "CreatedAt", field: "createdAt", sorter: "date" },
                { title: "Days", field: "daysOn" },
                { title: "Trips", field: "tripsTaken" },
                { title: "T/D", field: "tripDayRatio" },
                { title: "$day", field: "averageDailyPriceWithCurrency" },

                { title: "Busy30", field: "unavailableDays" },

                { title: "Gross30", field: "totalEarned" },
                { title: "Gross365", field: "totalEarned365" },
                { title: "Plan", field: "plan" },

                { title: "Favs", field: "numberOfFavorites" },
                { title: "Reviews", field: "numberOfReviews" },
                { title: "StarHost", field: "allStarHost" },

                { title: "URL", field: "vehicleURL", width: 200, formatter: "link", formatterParams: { labelField: "vehicleURL", target: "_blank" } },
                { title: "Features", field: "features", width: 300 },

                { title: "Avg Market $*", field: "marketValue" },
                { title: "Depreciation Y1*", field: "ownershipCost1" },
                { title: "Insurance Y*", field: "insurance" },
                { title: "Maintenance Y*", field: "maintenance" },
                { title: "Avg Repairs Y*", field: "repairs" },
            ]}
            
            
            
        />
    );
}

export default TabulatorTable;