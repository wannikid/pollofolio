import { resources } from "./config";

function getApiResponse(uri, params) {
  if (!uri) return Promise.reject("Insufficent information.");
  uri = new URL(uri);
  Object.keys(params).forEach(key => uri.searchParams.append(key, params[key]));
  return new Promise(async function(resolve, reject) {
    let text = null;
    try {
      const res = await fetch(uri);
      // by reading the response as text we can retrieve API error messages
      text = await res.text();
      // this will cause an error when the response is not a JSON string
      let json = JSON.parse(text);
      // returns the JSON object to the function that will handle the response
      resolve(json);
    } catch (e) {
      // if the API call fails, e.g. because of an unknown stock symbol
      reject(text);
    }
  });
}

// handles requests that have a fallback API provider, e.g. when request limit is reached or when symbol is unknown
export function requestHandler(type, requestObj) {
  return new Promise(function(resolve) {
    let { uri, params } = resources[type].primaryUri(requestObj);
    getApiResponse(uri, params)
      .then(json => {
        resources[type].primaryUriHandler(json, requestObj);
        resolve();
      })
      .catch(err => {
        // try secondary API in case there was an error
        if (resources[type].secondaryUri) {
          let { uri, params } = resources[type].secondaryUri(requestObj);
          getApiResponse(uri, params)
            .then(json => {
              resources[type].secondaryUriHandler(json, requestObj);
              resolve();
            })
            .catch(err => {
              resolve(err);
            });
        } else resolve(err);
      });
  });
}
