const callApi = require("./utils/callApi");

exports.handler = async event => {
  const token = process.env.VUE_APP_IEXCLOUD_SECRET_KEY;
  // Parse the body contents into an object.
  let body = JSON.parse(event.body);
  let uri = new URL(body.uri);
  body.params.token = token;
  Object.keys(body.params).forEach(key =>
    uri.searchParams.append(key, body.params[key])
  );
  const responseString = await callApi(uri);
  return {
    statusCode: 200,
    body: responseString
  };
};
