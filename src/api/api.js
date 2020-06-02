import { resources, netlifyFuncBaseUrl } from "./config";

function getApiResponse(option, requestObj) {
  return new Promise(async function(resolve, reject) {
    let resString = null;

    try {
      // generate the the address to call the API with
      let { uri, params } = option.getUri(requestObj);
      const res = await fetch(netlifyFuncBaseUrl + option.provider, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ uri, params })
      });
      resString = await res.text();
      const json = JSON.parse(resString);
      option.handleResponse(json, requestObj);
      resolve();
    } catch (e) {
      // show any information the API returned instead of error message
      if (resString) e.message = resString;
      reject(new Error(e.message));
    }
  });
}

// handles requests that have a fallback API provider, e.g. when request limit is reached or when symbol is unknown
export function requestHandler(type, requestObj) {
  return new Promise(async function(resolve) {
    let options = Object.keys(resources[type]).length;
    let i = 1;
    let res = null;

    while (i <= options) {
      try {
        // call the netlify function/backend to trigger the API call
        res = await getApiResponse(resources[type][i], requestObj);
        i = options;
      } catch (e) {
        // catch any API error and return the error message if there is no other option left to try
        if (i === options) {
          i = options;
          res = e.message;
        }
      } finally {
        // try next option for this resource type
        i++;
      }
    }
    resolve(res);
  });
}
