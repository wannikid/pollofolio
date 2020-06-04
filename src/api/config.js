export const netlifyFuncBaseUrl =
  "https://pollofolio.netlify.app/.netlify/functions/";

const providers = {
  finnhub: {
    provider: "finnhub",
    baseUrl: "https://finnhub.io/api/v1/"
  },
  iex: {
    provider: "iex",
    baseUrl: "https://cloud.iexapis.com/stable/"
  },
  exchangeratesapi: {
    provider: "exchangeratesapi",
    baseUrl: "https://api.exchangeratesapi.io/"
  }
};

// helper functions
const timestamp = date => {
  date = date ? new Date(date) : new Date();
  return (date.getTime() / 1000) | 0;
};

const checkTicker = asset => {
  if (!asset || !asset.ticker) throw Error("Insufficent information.");
};

const today = new Date().toISOString().substring(0, 10);

export const resources = {
  history: {
    2: {
      provider: providers.iex.provider,
      getUri: function({ asset }) {
        checkTicker(asset);
        const uri =
          providers.iex.baseUrl +
          "stock/" +
          asset.ticker +
          "/chart/date/" +
          asset.dateBuy.replace(/-/g, "");
        const params = {
          chartByDay: true
        };
        return { uri, params };
      },
      handleResponse: function(json, { asset }) {
        if (!json[0]) throw Error("No data");
        asset.buyPrice = json[0]["close"];
        asset.lastChecked = today;
      }
    },
    1: {
      provider: providers.finnhub.provider,
      getUri: function({ asset }) {
        checkTicker(asset);
        const uri = providers.finnhub.baseUrl + "stock/candle";
        const endDate = asset.isSold() ? asset.dateSell : new Date();
        let params = {
          symbol: asset.ticker,
          resolution: "D",
          from: timestamp(asset.dateBuy),
          to: timestamp(endDate)
        };
        return { uri, params };
      },
      handleResponse: function(json, { asset }) {
        let timeseries = {};
        if (!json.t) throw Error("No data");
        for (let i = 0; i < json.t.length - 1; i++) {
          let date = new Date(json.t[i] * 1000).toISOString().substring(0, 10);
          timeseries[date] = json.c[i];
        }
        asset.timeseries = timeseries;
        asset.buyPrice = json.c[0];
        asset.lastChecked = today;
      }
    }
  },
  quote: {
    2: {
      provider: providers.finnhub.provider,
      getUri: function({ asset }) {
        checkTicker(asset);
        const uri = providers.finnhub.baseUrl + "quote";
        const params = {
          symbol: asset.ticker,
          adjusted: true
        };
        return { uri, params };
      },
      handleResponse: function(json, { asset }) {
        if (!json.c) throw Error("No data");
        asset.lastPrice = json.c;
        asset.timeseries[today] = asset.lastPrice;
        asset.lastChecked = today;
      }
    },
    1: {
      provider: providers.iex.provider,
      getUri: function({ asset }) {
        checkTicker(asset);
        const uri = providers.iex.baseUrl + "stock/" + asset.ticker + "/quote";
        const params = {};
        return { uri, params };
      },
      handleResponse: function(json, { asset }) {
        if (!asset.name) asset.name = json.companyName;
        asset.lastPrice = json.latestPrice;
        asset.timeseries[today] = asset.lastPrice;
        asset.lastChecked = today;
      }
    }
  },
  company: {
    1: {
      provider: providers.iex.provider,
      getUri: function({ asset }) {
        checkTicker(asset);
        const uri =
          providers.iex.baseUrl + "stock/" + asset.ticker + "/company";
        const params = {};
        return { uri, params };
      },
      handleResponse: function(json, { asset }) {
        // prevent overwriting user's naming
        if (!asset || !asset.name) asset.name = json.companyName;
        asset.address = [
          json.address,
          json.zip,
          json.city,
          json.state,
          json.country
        ].join();
        asset.industry = json.industry;
        asset.description = json.description;
      }
    },
    2: {
      provider: providers.finnhub.provider,
      getUri: function({ asset }) {
        checkTicker(asset);
        const uri = providers.finnhub.baseUrl + "stock/profile2";
        const params = {
          symbol: asset.ticker
        };
        return { uri, params };
      },
      handleResponse: function(json, { asset }) {
        // prevent overwriting user's naming
        if (!asset || !asset.name) asset.name = json.name;
        asset.currency = json.currency;
        asset.industry = json.finnhubIndustry;
      }
    }
  },
  signal: {
    1: {
      provider: providers.finnhub.provider,
      getUri: function({ asset }) {
        checkTicker(asset);
        const uri = providers.finnhub.baseUrl + "scan/technical-indicator";
        const params = {
          symbol: asset.ticker,
          resolution: "M"
        };
        return { uri, params };
      },
      handleResponse: function(json, { asset }) {
        if (json.technicalAnalysis)
          asset.signal = json.technicalAnalysis.signal;
        if (json.trend) asset.trending = json.trend.trending;
      }
    }
  },
  news: {
    1: {
      provider: providers.finnhub.provider,
      getUri: function({ asset, from, to }) {
        checkTicker(asset);
        const uri = providers.finnhub.baseUrl + "company-news";
        const params = {
          symbol: asset.ticker,
          from: from,
          to: to
        };
        return { uri, params };
      },
      handleResponse: function(json, { asset }) {
        asset.news = json;
      }
    }
  },
  forexByDate: {
    1: {
      provider: providers.exchangeratesapi.provider,
      getUri: function({ base, currency, date }) {
        const uri = providers.exchangeratesapi.baseUrl + date;
        const params = {
          base: base,
          symbols: currency
        };
        return { uri, params };
      },
      handleResponse: function(json, { exchangeRates, base, currency, date }) {
        exchangeRates[base][currency][date] = json.rates[currency];
      }
    }
  },
  forexLatest: {
    1: {
      provider: providers.exchangeratesapi.provider,
      getUri: function() {
        const uri = providers.exchangeratesapi.baseUrl + "latest";
        const params = {};
        return { uri, params };
      },
      handleResponse: function(json, { exchangeRates }) {
        //currencyList.push(...Object.keys(json.rates));
        Object.keys(json.rates).forEach(rate => {
          exchangeRates[rate] = {};
        });
      }
    }
  }
};
