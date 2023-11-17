import { useStorage } from "@plasmohq/storage/hook";
import { browser } from "webextension-polyfill-ts";
browser.action.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});


