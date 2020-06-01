const { callApi, allowedOrigins } = require("./apiutils");

const headers = {
  "Access-Control-Allow-Origin": "*"
};

exports.handler = async event => {
  // Parse the body contents into an object.
  let { uri, params } = JSON.parse(event.body);
  uri = new URL(uri);
  Object.keys(params).forEach(key => uri.searchParams.append(key, params[key]));
  let responseString = await callApi(uri);
  return {
    statusCode: 200,
    headers,
    body: responseString
  };
};
