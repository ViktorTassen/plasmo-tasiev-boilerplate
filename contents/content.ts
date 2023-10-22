import type { PlasmoCSConfig } from "plasmo";
import { waitForElm, extractVehicles  } from "./utils";
import { DrawTurrexUI } from "../components/turrex-ui/Root";

import { myData } from "~components/tabulator-table/data";


export const config: PlasmoCSConfig = {
  matches: ["https://turo.com/*/search*"],
  run_at: "document_end",
}

import styleText from "data-text:./style.css"
// Add style to the web page instead of the shadow dom
const styleElement = document.createElement("style")
styleElement.textContent = styleText
document.head.appendChild(styleElement);


waitForElm(".searchFilterBar").then((elm) => {
  DrawTurrexUI(elm);
});

window.addEventListener(
  'ListToContentPost',
  function (evt: any) {
    console.log('ListToContentPost', evt.detail);
    const vehiclesData = extractVehicles(evt.detail);
    myData.setData(vehiclesData);

  },
  false,
);




