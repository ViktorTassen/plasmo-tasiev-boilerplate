import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://turo.com/*"],
  world: "MAIN",
  run_at: "document_start",
}


const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const request = args[0];
  const url = request instanceof Request ? request.url : request instanceof URL ? request.href : request;
  const response = await originalFetch(...args);

  if ((response && url.includes('api/v2/search')) || (response && url.includes('api/search?country'))) {
    const json = await response.clone().json();

    if (json.vehicles) {
      const listEvent = new CustomEvent('ListToContentPost', { detail: json.vehicles });
      window.dispatchEvent(listEvent);
    }

    if (json.list) {
      const listEvent = new CustomEvent('ListToContentPost', { detail: json.list });
      window.dispatchEvent(listEvent);
    }
    // }
  }

  return response;
};



