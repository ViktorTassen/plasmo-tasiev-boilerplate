import { type ColumnDefinition } from 'react-tabulator';
import { Storage } from "@plasmohq/storage"
const storage = new Storage();


function minMaxFilterEditor(cell, onRendered, success, cancel, editorParams) {
  const container = document.createElement("span");
  const start = createInput("Min");
  const end = createInput("Max");

  function buildValues() {
    success({
      start: start.value,
      end: end.value,
    });
  }

  [start, end].forEach(input => {
    input.addEventListener("change", buildValues);
    input.addEventListener("blur", buildValues);
    input.addEventListener("keyup", buildValues);
  });

  container.appendChild(start);
  container.appendChild(end);

  return container;
} // Custom max-min header filter
function minMaxFilterFunction(headerValue, rowValue, rowData, filterParams) {
  const start = parseFloat(headerValue.start);
  const end = parseFloat(headerValue.end);
  const value = parseFloat(rowValue);

  if (headerValue.start !== "") {
    if (headerValue.end !== "") {
      return value >= start && value <= end;
    } else {
      return value >= start;
    }
  } else {
    return headerValue.end === "" || value <= end;
  }
} // Custom max-min filter function
function createInput(placeholder) {
  const input = document.createElement("input");
  input.setAttribute("placeholder", placeholder);
  input.style.padding = "4px";
  // input.style.marginLeft = "1px";
  input.style.marginRight = "1px";
  input.style.width = "49%";
  input.style.boxSizing = "border-box";
  return input;
}


const menuTitleFormatter = function(cell, formatterParams, onRendered){
var title = document.createElement("span");
title.classList.add("group-title-date-range");
title.setAttribute("date-range-id", cell.getValue());
title.innerHTML = "Custom Date Range (Edit)"
return title;
}

const columnsData: ColumnDefinition[] = [
  {
    title: "Vehicle Information",
    columns: [
      { title: "Location", field: "address", width: 70, headerFilter: "input", headerSort: false },
      { title: "Type", field: "type", width: 70, headerFilter: "select", headerSort: false, editorParams: { values: { "SUV": "SUV", "Car": "Car", "Truck": "Truck", "Van": "Passenger Van", "Cargo Van": "Cargo Van", clearable: true } }, headerFilterParams: { values: { "SUV": "SUV", "Car": "Car", "Truck": "Truck", "Van": "Passenger Van", "Cargo Van": "Cargo Van" } } },
      { title: "Make", field: "make", width: 70, headerFilter: "input" },
      { title: "Model", field: "model", width: 90, headerFilter: "input" },
      { title: "Year", field: "year", width: 100, headerFilter: minMaxFilterEditor, headerFilterFunc: minMaxFilterFunction, headerFilterLiveFilter: false },
      { title: "Color", field: "color", width: 70, headerFilter: "input", headerSort: false },
      { title: "Trim", field: "trim", width: 70, headerFilter: "input", headerSort: false },
      { title: "Features", field: "features", width: 80, headerFilter: "input", headerSort: false },
    ],
  },
  {
    title: "Vehicle Utilization and Earnings",
    columns: [
      { title: "CreatedAt", field: "createdAt", sorter: "date", headerSort: false },
      { title: "Days", field: "daysOn", width: 80, headerFilter: minMaxFilterEditor, headerFilterFunc: minMaxFilterFunction, headerFilterLiveFilter: false },
      { title: "Trips", field: "completedTrips", width: 80, headerFilter: minMaxFilterEditor, headerFilterFunc: minMaxFilterFunction, headerFilterLiveFilter: false },
      { title: "T/D", field: "tripDayRatio", width: 80, headerFilter: minMaxFilterEditor, headerFilterFunc: minMaxFilterFunction, headerFilterLiveFilter: false },
      { title: "$day", field: "averagePrice", width: 80, headerFilter: minMaxFilterEditor, headerFilterFunc: minMaxFilterFunction, headerFilterLiveFilter: false },
    ]
  },
  {
    title: "1",
    titleFormatter: menuTitleFormatter,
    headerClick: function (e, column) {
      storage.set("selectedDateRangeId", column.getDefinition().title);
    }, 
    columns: [
      { title: "BusyDays", field: "busy1", width: 110, headerFilter: minMaxFilterEditor, headerFilterFunc: minMaxFilterFunction, headerFilterLiveFilter: false },
      { title: "Income", field: "income1", width: 110, headerFilter: minMaxFilterEditor, headerFilterFunc: minMaxFilterFunction, headerFilterLiveFilter: false },
    ]
  },
  {
    title: "2",
    titleFormatter: menuTitleFormatter,
    headerClick: function (e, column) {
      storage.set("selectedDateRangeId", column.getDefinition().title);
    }, 
    columns: [
      { title: "BusyDays", field: "busy2", width: 110, headerFilter: minMaxFilterEditor, headerFilterFunc: minMaxFilterFunction, headerFilterLiveFilter: false },
      { title: "Income", field: "income2", width: 110, headerFilter: minMaxFilterEditor, headerFilterFunc: minMaxFilterFunction, headerFilterLiveFilter: false },
    ]
  },

  {
    title: "Host info",
    columns: [
      { title: "Plan", field: "plan", headerFilter: "select", headerSort: false, editorParams: { values: { "60": "60", "75": "75", "80": "80", "85": "85", "90": "90", clearable: true } }, headerFilterParams: { values: { "60": "60", "75": "75", "80": "80", "85": "85", "90": "90" } } },
      { title: "StarHost", field: "isAllStarHost", headerFilter: "select", headerSort: false, editorParams: { values: { "true": "true", "false": "false", clearable: true } }, headerFilterParams: { values: { "true": "true", "false": "false" } } },
      { title: "HostId", field: "hostId", headerFilter: "input", headerSort: false },
    ]
  },
  {
    title: "User Interaction",
    columns: [
      { title: "Favs", field: "numberOfFavorites" },
      { title: "Reviews", field: "numberOfReviews", width: 100, headerFilter: minMaxFilterEditor, headerFilterFunc: minMaxFilterFunction, headerFilterLiveFilter: false },
      { title: "Ratings", field: "ratings", width: 100, headerFilter: minMaxFilterEditor, headerFilterFunc: minMaxFilterFunction, headerFilterLiveFilter: false },
    ]
  },
  {
    title: "Other",
    columns: [
      { title: "Avg Market $*", field: "marketValue", width: 130, headerFilter: minMaxFilterEditor, headerFilterFunc: minMaxFilterFunction, headerFilterLiveFilter: false },
      { title: "URL", field: "url", width: 150, formatter: "link", formatterParams: { labelField: "url", target: "_blank" }, headerSort: false },
      { title: "ID", field: "id", width: 50, headerFilter: "input", headerSort: false },
    ]
  },
]

export default columnsData;

