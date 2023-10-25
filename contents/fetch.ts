import type { PlasmoCSConfig } from "plasmo";
export const config: PlasmoCSConfig = {
  matches: ["https://turo.com/*"],
  world: "MAIN",
  run_at: "document_start",
};

const originalFetch = window.fetch;
window.fetch = async function (...args) {
  try {
    const request = args[0];
    const url = request instanceof Request ? request.url : request instanceof URL ? request.href : request;
    const response = await originalFetch(...args);
    if ((response && url?.includes('api/v2/search')) || (response && url?.includes('api/search?country'))) {
      const json = await response.clone().json();

      if (json.vehicles) {
        // send message to content script
        const listEvent = new CustomEvent('ListToContentPost', { detail: json.vehicles });
        document.dispatchEvent(listEvent);
      }

      if (json.list) {
        const listEvent = new CustomEvent('ListToContentPost', { detail: json.list });
        document.dispatchEvent(listEvent);
      }

      return response;
    } else {
      // Handle other cases or simply return the response
      return response;
    }
  } catch (error) {
    // Handle and log the error
    // console.error("Error in fetch:", error);

    // You can also throw the error to propagate it further if needed
    // throw error;
  }
};
