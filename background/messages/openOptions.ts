import type { PlasmoMessaging } from "@plasmohq/messaging"
import { browser } from "webextension-polyfill-ts";


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    browser.runtime.openOptionsPage();
}

export default handler