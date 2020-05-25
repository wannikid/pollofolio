import dotenv from "dotenv";

// in the test environment get the variables from the .env file
if (process.env.NODE_ENV !== "production") dotenv.config();

const providers = {
  finnhub: {
    baseUrl: "https://finnhub.io/api/v1/",
    skey: process.env.VUE_APP_FINNHUB_SECRET_KEY
  },
  iex: {
    baseUrl: "https://cloud.iexapis.com/stable/",
    skey: process.env.VUE_APP_IEXCLOUD_SECRET_KEY
  },
  forex: {
    baseUrl: "https://api.exchangeratesapi.io/"
  }
};

export const resources = {
  history: {
    secondaryUri: function({ asset }) {
      if (!asset || !asset.ticker) return {};
      const uri =
        providers.iex.baseUrl +
        "stock/" +
        asset.ticker +
        "/chart/date/" +
        asset.dateBuy.replace(/-/g, "");
      const params = {
        chartByDay: true,
        token: providers.iex.skey
      };
      return { uri, params };
    },
    secondaryUriHandler: function(json, { asset }) {
      asset.buyPrice = json[0]["close"];
      asset.currency = "USD";
      asset.lastChecked = new Date().toISOString().substring(0, 10);
    },
    primaryUri: function({ asset }) {
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
        to: timestamp(endDate),
        token: providers.finnhub.skey
      };
      return { uri, params };
    },
    primaryUriHandler: function(json, { asset }) {
      let timeseries = {};
      if (json.t) {
        for (let i = 0; i < json.t.length - 1; i++) {
          let date = new Date(json.t[i] * 1000).toISOString().substring(0, 10);
          timeseries[date] = json.c[i];
        }
        asset.timeseries = timeseries;
        asset.buyPrice = json.c[0];
      }
      asset.lastChecked = new Date().toISOString().substring(0, 10);
    }
  },
  quote: {
    secondaryUri: function({ asset }) {
      if (!asset || !asset.ticker) return {};
      const uri = providers.finnhub.baseUrl + "quote";
      const params = {
        symbol: asset.ticker,
        adjusted: true,
        token: providers.finnhub.skey
      };
      return { uri, params };
    },
    secondaryUriHandler: function(json, { asset }) {
      if (json[0]) {
        asset.buyPrice = json[0]["close"];
        asset.currency = "USD";
        asset.lastChecked = new Date().toISOString().substring(0, 10);
      }
    },
    primaryUri: function({ asset }) {
      if (!asset || !asset.ticker) return {};
      const uri = providers.iex.baseUrl + "stock/" + asset.ticker + "/quote";
      const params = {
        token: providers.iex.skey
      };
      return { uri, params };
    },
    primaryUriHandler: function(json, { asset }) {
      asset.lastPrice = json.c;
      asset.lastChecked = new Date().toISOString().substring(0, 10);
    }
  },
  company: {
    primaryAPI: "company",
    primaryAPIHandler: function(json, { asset }) {
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
    }
  },
  signal: {
    primaryUri: function({ asset }) {
      if (!asset || !asset.ticker) return {};
      const uri = providers.finnhub.baseUrl + "scan/technical-indicator";
      const params = {
        symbol: asset.ticker,
        resolution: "M",
        token: providers.finnhub.skey
      };
      return { uri, params };
    },
    primaryUriHandler: function(json, { asset }) {
      if (json.technicalAnalysis) asset.signal = json.technicalAnalysis.signal;
      if (json.trend) asset.trending = json.trend.trending;
    }
  },
  news: {
    primaryUri: function({ asset, from, to }) {
      if (!asset.ticker) return {};
      const uri = providers.finnhub.baseUrl + "major-development";
      const params = {
        symbol: asset.ticker,
        from: from,
        to: to,
        token: providers.finnhub.skey
      };
      return { uri, params };
    },
    primaryUriHandler: function(json, { asset }) {
      asset.news = json.majorDevelopment;
    }
  },
  forexByDate: {
    primaryUri: function({ base, currency, date }) {
      const uri = providers.forex.baseUrl + date;
      const params = {
        base: base,
        symbols: currency
      };
      return { uri, params };
    },
    primaryUriHandler: function(json, { exchangeRates, base, currency, date }) {
      exchangeRates[base][currency][date] = json.rates[currency];
    }
  },
  forexLatest: {
    primaryUri: function() {
      const uri = providers.forex.baseUrl + "latest";
      const params = {};
      return { uri, params };
    },
    primaryUriHandler: function(json, { currencyList }) {
      currencyList.push(...Object.keys(json.rates));
    }
  }
};
