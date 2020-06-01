const { callApi } = require("./apiutils");

exports.handler = async event => {
  const origin = event.headers.origin;
  let { uri, params } = JSON.parse(event.body);
  let response = await callApi(uri, params, origin);
  return response;
};
