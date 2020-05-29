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

export const resources = {
  history: {
    2: {
      provider: providers.iex.provider,
      getUri: function({ asset }) {
        if (!asset || !asset.ticker) return {};
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
        asset.buyPrice = json[0]["close"];
        asset.currency = "USD";
        asset.lastChecked = new Date().toISOString().substring(0, 10);
      }
    },
    1: {
      provider: providers.finnhub.provider,
      getUri: function({ asset }) {
        if (!asset || !asset.ticker) return {};
        const uri = providers.finnhub.baseUrl + "stock/candle";
        const timestamp = date => {
          date = date ? new Date(date) : new Date();
          return (date.getTime() / 1000) | 0;
        };
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
        if (json.t) {
          for (let i = 0; i < json.t.length - 1; i++) {
            let date = new Date(json.t[i] * 1000)
              .toISOString()
              .substring(0, 10);
            timeseries[date] = json.c[i];
          }
          asset.timeseries = timeseries;
          asset.buyPrice = json.c[0];
        }
        asset.lastChecked = new Date().toISOString().substring(0, 10);
      }
    }
  },
  quote: {
    2: {
      provider: providers.finnhub.provider,
      getUri: function({ asset }) {
        if (!asset || !asset.ticker) return {};
        const uri = providers.finnhub.baseUrl + "quote";
        const params = {
          symbol: asset.ticker,
          adjusted: true
        };
        return { uri, params };
      },
      handleResponse: function(json, { asset }) {
        if (json[0]) {
          asset.buyPrice = json[0]["close"];
          asset.currency = "USD";
          asset.lastChecked = new Date().toISOString().substring(0, 10);
        }
      }
    },
    1: {
      provider: providers.iex.provider,
      getUri: function({ asset }) {
        if (!asset || !asset.ticker) return {};
        const uri = providers.iex.baseUrl + "stock/" + asset.ticker + "/quote";
        const params = {};
        return { uri, params };
      },
      handleResponse: function(json, { asset }) {
        if (!asset.name) asset.name = json.companyName;
        asset.lastPrice = json.latestPrice;
        asset.currency = "USD";
        asset.lastChecked = new Date().toISOString().substring(0, 10);
      }
    }
  },
  company: {
    1: {
      provider: providers.iex.provider,
      getUri: function({ asset }) {
        if (!asset || !asset.ticker) return {};
        const uri =
          providers.iex.baseUrl + "stock/" + asset.ticker + "/company";
        const params = {};
        return { uri, params };
      },
      handleResponse: function(json, asset) {
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
    }
  },
  signal: {
    1: {
      provider: providers.finnhub.provider,
      getUri: function({ asset }) {
        if (!asset || !asset.ticker) return {};
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
        if (!asset.ticker) return {};
        const uri = providers.finnhub.baseUrl + "major-development";
        const params = {
          symbol: asset.ticker,
          from: from,
          to: to
        };
        return { uri, params };
      },
      handleResponse: function(json, { asset }) {
        asset.news = json.majorDevelopment;
      }
    }
  },
  forexByDate: {
    1: {
      provider: providers.exchangeratesapi.provider,
      getUri: function({ base, currency, date }) {
        const uri = providers.forex.baseUrl + date;
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
        const uri = providers.forex.baseUrl + "latest";
        const params = {};
        return { uri, params };
      },
      handleResponse: function(json, { currencyList }) {
        currencyList.push(...Object.keys(json.rates));
      }
    }
  }
};
