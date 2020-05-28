import callApi from "./utils";

exports.handler = async (event, context) => {
  // Parse the body contents into an object.
  let { uri, params } = JSON.parse(event.body);
  uri = new URL(uri);
  Object.keys(params).forEach(key => uri.searchParams.append(key, params[key]));
  let response = await callApi(uri);
  return {
    statusCode: 200,
    body: response
  };
};
