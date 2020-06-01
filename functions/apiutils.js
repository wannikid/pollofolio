const fetch = require("node-fetch");

exports.callApi = function(uri) {
  return new Promise(async function(resolve) {
    let responseText = null;
    try {
      const res = await fetch(uri);
      //responseText = await res.text();
      //resolve(responseText);
      resolve(res);
    } catch (e) {
      // if the API call fails, e.g. because of an unknown stock symbol
      res.body = e.message;
      resolve(res);
    }
  });
};

exports.allowedOrigins = [
  "https://h6kbw.csb.app",
  "https://pollofolio.netlify.app"
];
