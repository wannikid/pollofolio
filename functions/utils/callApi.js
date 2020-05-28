const fetch = require("node-fetch");

module.exports = function callApi(uri) {
  return new Promise(async function(resolve) {
    let responseText = null;
    try {
      const res = await fetch(uri);
      responseText = await res.text();
      return responseText;
    } catch (e) {
      // if the API call fails, e.g. because of an unknown stock symbol
      return e.message;
    }
  });
};
