import React from "react";
import type { PlasmoCSConfig } from "plasmo";
import { waitForElm } from "./utils";
import { DrawTurrexButton } from "../components/turrex-button/Root";

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
  DrawTurrexButton(elm);
});




