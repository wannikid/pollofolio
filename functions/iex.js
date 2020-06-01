const { callApi } = require("./apiutils");

exports.handler = async event => {
  const token = process.env.VUE_APP_IEXCLOUD_SECRET_KEY;
  // Parse the body contents into an object.
  const origin = event.headers.origin;
  let { uri, params } = JSON.parse(event.body);
  //const responseString = await callApi(uri);
  let response = await callApi(uri, params, token, origin);
  //response.setHeader("Access-Control-Allow-Origin", "*");

  return response;
};
