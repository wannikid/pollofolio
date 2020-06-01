const fetch = require("node-fetch");

const allowedOrigins = [
  "https://h6kbw.csb.app",
  "https://pollofolio.netlify.app"
];

const headers = {
  "Access-Control-Allow-Origin": "*"
};

exports.callApi = function(uri, params, token, origin) {
  return new Promise(async function(resolve) {
    let responseText = null;
    uri = new URL(uri);
    params.token = token;
    Object.keys(params).forEach(key =>
      uri.searchParams.append(key, params[key])
    );
    /*if (allowedOrigins.indexOf(origin) > -1) {
      response.setHeader("Access-Control-Allow-Origin", origin);
    }*/
    try {
      let res = await fetch(uri);
      responseText = await res.text();
      resolve({
        statusCode: 200,
        headers,
        body: responseText
      });
      //resolve(res);
    } catch (e) {
      // if the API call fails, e.g. because of an unknown stock symbol
      //res.body = e.message;
      resolve({
        statusCode: 200,
        headers,
        body: e.message
      });
      //resolve(res);
    }
  });
};
