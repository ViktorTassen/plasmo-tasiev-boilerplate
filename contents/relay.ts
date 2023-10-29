import type { PlasmoCSConfig } from "plasmo"
 
import { relayMessage } from "@plasmohq/messaging"
 
export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*"],
}
 
relayMessage({
  name: "vehiclesCache",
})