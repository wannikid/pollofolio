const fetch = require("node-fetch");

const allowedOrigins = [
  "https://h6kbw.csb.app",
  "https://pollofolio.netlify.app"
];

exports.callApi = function(uri, params, origin) {
  return new Promise(async function(resolve) {
    let responseText = null;
    let headers = {};

    try {
      uri = new URL(uri);
      Object.keys(params).forEach(key =>
        uri.searchParams.append(key, params[key])
      );
      if (allowedOrigins.indexOf(origin) > -1) {
        headers["Access-Control-Allow-Origin"] = origin;
      }
      let res = await fetch(uri);
      responseText = await res.text();
      resolve({
        statusCode: 200,
        headers,
        body: responseText
      });
    } catch (e) {
      // if the API call fails, e.g. because of an unknown stock symbol
      resolve({
        statusCode: 200,
        headers,
        body: e.message
      });
    }
  });
};
