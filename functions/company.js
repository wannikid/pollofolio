const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  let responseText = null;
  try {
    // Parse the body contents into an object.
    const asset = JSON.parse(event.body);

    if (!asset._ticker)
      return {
        statusCode: 404,
        body: "Insufficent information"
      };
    const params = {
      token: process.env.VUE_APP_IEXCLOUD_SECRET_KEY
    };

    const uri = new URL(
      "https://cloud.iexapis.com/stable/stock/" + asset._ticker + "/company"
    );
    Object.keys(params).forEach(key =>
      uri.searchParams.append(key, params[key])
    );

    const res = await fetch(uri);
    responseText = await res.text();
    return {
      statusCode: 200,
      body: responseText
    };
  } catch (e) {
    // if the API call fails, e.g. because of an unknown stock symbol
    return {
      statusCode: 404,
      body: e.message
    };
  }
};
