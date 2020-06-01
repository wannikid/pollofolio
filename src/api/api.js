import { resources } from "./config";

function getApiResponse(option, requestObj) {
  return new Promise(async function(resolve) {
    // generate the the address to call the API with
    let { uri, params } = option.getUri(requestObj);
    // uri will be falsy if key information is missing in the request object
    if (!uri) resolve("Insufficent information.");

    const res = await fetch(
      "https://pollofolio.netlify.app/.netlify/functions/" + option.provider,
      {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ uri, params })
      }
    );
    const json = await res.json();
    const result = option.handleResponse(json, requestObj);
    resolve(result);
  });
}

// handles requests that have a fallback API provider, e.g. when request limit is reached or when symbol is unknown
export function requestHandler(type, requestObj) {
  return new Promise(async function(resolve) {
    let options = Object.keys(resources[type]).length;
    let i = 1;

    while (i <= options) {
      try {
        // call the netlify function/backend to trigger the API call
        await getApiResponse(resources[type][i], requestObj);
        i = options + 1;
        resolve();
      } catch (e) {
        // return the error if there is no other option left to try
        if (options === i) resolve(e.message);
        else i++;
      }
    }
  });
}
