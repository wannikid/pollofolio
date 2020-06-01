const callApi = require("./utils/callApi");
const allowedOrigins = require("./utils/allowedOrigins");

exports.handler = async event => {
  const origin = event.headers.origin;
  const token = process.env.VUE_APP_IEXCLOUD_SECRET_KEY;
  // Parse the body contents into an object.
  let body = JSON.parse(event.body);
  let uri = new URL(body.uri);
  body.params.token = token;
  Object.keys(body.params).forEach(key =>
    uri.searchParams.append(key, body.params[key])
  );
  //const responseString = await callApi(uri);
  response = await callApi(uri);

  if (allowedOrigins().indexOf(origin) > -1) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }

  return response;

  /*  return {
    statusCode: 200,
    headers,
    body: responseString
  };*/
};
