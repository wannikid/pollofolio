import dotenv from "dotenv";

// sets the keys for the codesandbox environment
if (process.env.NODE_ENV !== "production") dotenv.config();
// sets the keys on Netlify
const IEXCLOUD_SECRET_KEY = process.env.VUE_APP_IEXCLOUD_SECRET_KEY;
const FINNHUB_SECRET_KEY = process.env.VUE_APP_FINNHUB_SECRET_KEY;

export async function handleApiResponse(url, params) {
  url = new URL(url);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return new Promise(async function(resolve, reject) {
    let text = null;
    try {
      const res = await fetch(url);
      // by reading the response as text we can retrieve API error messages
      text = await res.text();
      // this will cause an error when the response is not a JSON string
      let json = JSON.parse(text);
      // returns the JSON object to the function that will handle the response
      resolve(json);
    } catch (e) {
      // if the API call fails, e.g. because of an unknown stock symbol
      reject(text);
    }
  });
}

export async function getIEXcompany(asset) {
  if (!asset.ticker) return Promise.resolve();
  const url =
    "https://cloud.iexapis.com/stable/stock/" + asset.ticker + "/company";
  let params = {
    token: IEXCLOUD_SECRET_KEY
  };
  return new Promise(async function(resolve, reject) {
    handleApiResponse(url, params)
      .then(json => {
        // prevent overwriting user's naming
        if (!asset.name) asset.name = json.companyName;
        asset.address = [
          json.address,
          json.zip,
          json.city,
          json.state,
          json.country
        ].join();
        asset.industry = json.industry;
        asset.description = json.description;
        resolve();
      })
      .catch(err => reject(err));
  });
}

export async function getIEXchart(asset) {
  if (!asset.ticker) return Promise.resolve();
  const url =
    "https://cloud.iexapis.com/stable/stock/" +
    asset.ticker +
    "/chart/date/" +
    asset.dateBuy.replace(/-/g, "");
  let params = {
    chartByDay: true,
    token: IEXCLOUD_SECRET_KEY
  };
  return new Promise(async function(resolve, reject) {
    handleApiResponse(url, params)
      .then(json => {
        asset.buyPrice = json[0]["close"];
        asset.currency = "USD";
        resolve();
      })
      .catch(err => reject(err));
  });
}

export function getFINNHUBcandle(asset) {
  if (!asset.ticker) return Promise.resolve();
  let timeseries = {};
  const url = "https://finnhub.io/api/v1/stock/candle";
  const timestamp = date => (new Date(date).getTime() / 1000) | 0;
  const startDate = timestamp(asset.dateBuy);
  const endDate = asset.isSold()
    ? timestamp(asset.dateSell)
    : timestamp(new Date());
  let params = {
    symbol: asset.ticker,
    resolution: "D",
    from: startDate,
    to: endDate,
    token: FINNHUB_SECRET_KEY
  };
  return new Promise((resolve, reject) => {
    handleApiResponse(url, params)
      .then(json => {
        for (let i = 0; i < json.t.length - 1; i++) {
          let date = new Date(json.t[i] * 1000).toISOString().substring(0, 10);
          timeseries[date] = json.c[i];
        }
        asset.timeseries = timeseries;
        asset.buyPrice = json.c[0];
        resolve();
      })
      .catch(err => reject(err));
  });
}

export function getFINNHUBnews(asset, from, to) {
  if (!asset.ticker) return Promise.resolve();
  const url = "https://finnhub.io/api/v1/major-development";
  let params = {
    symbol: asset.ticker,
    from: from,
    to: to,
    token: FINNHUB_SECRET_KEY
  };
  return new Promise((resolve, reject) => {
    handleApiResponse(url, params)
      .then(json => {
        asset.news = json.majorDevelopment;
        resolve();
      })
      .catch(err => reject(err));
  });
}

export function getFINNHUBsignal(asset) {
  if (!asset.ticker) return Promise.resolve();
  const url = "https://finnhub.io/api/v1/scan/technical-indicator";
  let params = {
    symbol: asset.ticker,
    resolution: "M",
    token: FINNHUB_SECRET_KEY
  };
  return new Promise((resolve, reject) => {
    handleApiResponse(url, params)
      .then(json => {
        if (json.technicalAnalysis)
          asset.signal = json.technicalAnalysis.signal;
        if (json.trend) asset.trending = json.trend.trending;
        asset.error = null;
        resolve();
      })
      .catch(err => {
        asset.error = err;
        reject();
      });
  });
}

export async function getIEXquote(asset) {
  if (!asset.ticker) return Promise.resolve();
  const url =
    "https://cloud.iexapis.com/stable/stock/" + asset.ticker + "/quote";
  let params = {
    token: IEXCLOUD_SECRET_KEY
  };
  return new Promise(async function(resolve, reject) {
    handleApiResponse(url, params)
      .then(res => {
        asset.yearlyHigh = res.week52High;
        asset.yearlyLow = res.week52Low;
        asset.peRatio = res.peRatio;
        asset.lastPrice = res.latestPrice;
        asset.lastChecked = new Date().toISOString().substring(0, 10);
        //asset.lastChange = res.change;
        //asset.lastChangePct = res.changePercent * 100;
        resolve();
      })
      .catch(err => reject(err));
  });
}

export async function getFINNHUBquote(asset) {
  if (!asset.ticker) return Promise.resolve();
  const url = new URL("https://finnhub.io/api/v1/quote");
  let params = {
    symbol: asset.ticker,
    token: FINNHUB_SECRET_KEY,
    adjusted: true
  };
  return new Promise(async function(resolve, reject) {
    handleApiResponse(url, params)
      .then(res => {
        asset.lastPrice = res.c;
        asset.lastChecked = new Date().toISOString().substring(0, 10);
        //asset.lastChange = res.c - res.pc;
        //asset.lastChangePct = (asset.lastChange / asset.lastPrice) * 100;
        resolve();
      })
      .catch(err => reject(err));
  });
}

export async function getEXCHANGERATESdate({
  exchangeRates,
  base,
  currency,
  date
}) {
  const url = new URL("https://api.exchangeratesapi.io/" + date);
  let params = {
    base: base,
    symbols: currency
  };

  return new Promise(async function(resolve, reject) {
    handleApiResponse(url, params)
      .then(json => {
        exchangeRates[base][currency][date] = json.rates[currency];
        resolve();
      })
      .catch(err => reject(err));
  });
}

export async function getEXCHANGERATESlatest(currencyList) {
  const url = new URL("https://api.exchangeratesapi.io/latest");
  let params = {};
  return new Promise(async function(resolve, reject) {
    handleApiResponse(url, params)
      .then(json => {
        currencyList.push(...Object.keys(json.rates));
        resolve();
      })
      .catch(err => reject(err));
  });
}

export async function getCompanyInfo(asset) {
  await getIEXcompany(asset)
    .then(() => (asset.error = null))
    .catch(err => (asset.error = err));
}

export async function getQuote(asset) {
  await getIEXquote(asset)
    .then(() => (asset.error = null))
    .catch(
      async err =>
        // in case of error try alternative API
        await getFINNHUBquote(asset)
          .then(() => (asset.error = null))
          .catch(err => (asset.error = err))
    );
}

export async function getNews(asset, from, to) {
  await getFINNHUBnews(asset, from, to)
    .then(() => (asset.error = null))
    .catch(err => (asset.error = err));
}

export async function getChart(asset) {
  await getFINNHUBcandle(asset)
    .then(res => (asset.error = null))
    .catch(
      async err =>
        // try alternative API
        await getIEXchart(asset)
          .then(res => (asset.error = null))
          .catch(err => (asset.error = err))
    );
  // used to prevent the app from checking an asset more than once a day
  asset.lastChecked = new Date().toISOString().substring(0, 10);
}
