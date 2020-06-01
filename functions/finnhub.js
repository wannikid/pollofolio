const { callApi } = require("./apiutils");

exports.handler = async event => {
  const token = process.env.VUE_APP_FINNHUB_SECRET_KEY;
  // Parse the body contents into an object.
  let { uri, params } = JSON.parse(event.body);
  uri = new URL(uri);
  params.token = token;
  Object.keys(params).forEach(key => uri.searchParams.append(key, params[key]));
  let response = await callApi(uri);
  //response.headers = headers;
  /*return {
    statusCode: 200,
    headers,
    body: responseString
  };*/
  return response;
};
