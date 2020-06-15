const fetch = require("node-fetch");

const allowedOrigins = [
  "https://h6kbw.csb.app",
  "https://h6kbw.codesandbox.io",
  "https://pollofolio.netlify.app"
];

exports.callApi = function(uri, params, origin) {
  return new Promise(async function(resolve) {
    let responseText = null;
    let headers = {};
    let res = null;

    if (allowedOrigins.indexOf(origin) > -1) {
      headers["Access-Control-Allow-Origin"] = origin;
    }

    try {
      uri = new URL(uri);
      Object.keys(params).forEach(key =>
        uri.searchParams.append(key, params[key])
      );
      res = await fetch(uri);
      responseText = await res.text();
      if (responseText === "{}") responseText = "No data found.";
      resolve({
        statusCode: 200,
        headers,
        body: responseText
      });
    } catch (e) {
      // if the API call fails, e.g. because of an unknown stock symbol
      resolve({
        statusCode: 404,
        headers,
        body: e.message
      });
    }
  });
};
