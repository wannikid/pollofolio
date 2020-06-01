const fetch = require("node-fetch");

module.exports = function callApi(uri) {
  return new Promise(async function(resolve) {
    let responseText = null;
    try {
      const res = await fetch(uri);
      //responseText = await res.text();
      //resolve(responseText);
      resolve(res);
    } catch (e) {
      // if the API call fails, e.g. because of an unknown stock symbol
      resolve(e.message);
    }
  });
};

module.exports = allowedOrigins = [
  "https://h6kbw.csb.app",
  "https://pollofolio.netlify.app"
];
