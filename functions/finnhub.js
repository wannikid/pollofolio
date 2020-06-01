const { callApi } = require("./apiutils");

exports.handler = async event => {
  const token = process.env.VUE_APP_FINNHUB_SECRET_KEY;
  const origin = event.headers.origin;
  let { uri, params } = JSON.parse(event.body);
  params.token = token;
  let response = await callApi(uri, params, origin);
  return response;
};
