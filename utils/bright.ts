const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchDataBright = async function (targetUrl: string) {
  const maxRetries = 3; // Define the maximum number of retries
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log("trying targetUrl", targetUrl);
      // Make the POST request using fetch
      const response = await fetch('https://raptor-nodejs-serverless-function.vercel.app/api/get', {
        method: 'POST', // Specify the HTTP method
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(targetUrl) // Convert the data object to a JSON string
      });

      if (!response.ok) { // Check if the response status is OK (status code 200-299)
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json(); // Parse the JSON response
      return responseData; // Return the parsed JSON data

    } catch (error) {
      console.error(`Attempt ${retries + 1} failed. Error:`, error); // Log each failure

      if (retries < maxRetries - 1) {
        await sleep(1000); // Pause for 2 seconds before retrying
      }

      retries++;
    }
  }

  throw new Error(`Failed to fetch data after ${maxRetries} attempts`);
};
