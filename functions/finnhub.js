import callApi from "./utils";

exports.handler = async (event, context) => {
  const token = process.env.VUE_APP_FINNHUB_SECRET_KEY;
  // Parse the body contents into an object.
  let { uri, params } = JSON.parse(event.body);
  uri = new URL(uri);
  params.token = token;
  Object.keys(params).forEach(key => uri.searchParams.append(key, params[key]));
  let response = await callApi(uri);
  return {
    statusCode: 200,
    body: response
  };
};
