import Vue from "vue";
import Vuex from "vuex";
import VuexPersist from "vuex-persist";
import * as API from "./api/api";

const vuexPersist = new VuexPersist({
  key: "pollofolio",
  storage: window.localStorage
});

Vue.use(Vuex);

let kpis = [
  {
    name: "Change",
    icon: "📈",
    subtitle: "Your assets' change in value.",
    info: "https://www.investopedia.com/terms/c/change.asp",
    key: "change",
    method: "sum",
    unit: "appCurrency"
  },
  {
    name: "Current balance",
    icon: "🏦",
    subtitle: "Your assets' current value.",
    info: "https://www.investopedia.com/terms/m/marketvalue.asp",
    method: "sum",
    key: "value",
    unit: "appCurrency"
  } /*
  {
    name: "Last change",
    subtitle: "How much you are up or down today.",
    info: null,
    method: "Object.values(timeseries",
    key: "lastChange",
    value: null,
    unit: "appCurrency"
  },
    {
    name: "Forex effects",
    subtitle: "How much you are up or down today.",
    info: null,
    method: "Object.values(timeseries",
    key: "lastChange",
    value: null,
    unit: "appCurrency"
  },*/,

  {
    name: "Invested",
    icon: "🧾",
    subtitle: "Purchase value of your assets.",
    info: "https://www.investopedia.com/terms/i/investment.asp",
    method: "sum",
    key: "invested",
    unit: "appCurrency"
  },
  {
    name: "Returns",
    icon: "💰",

    subtitle: "Gain/Loss from sold assets & dividends.",
    info: "https://www.investopedia.com/terms/r/return.asp",
    method: "sum",
    key: "return",
    unit: "appCurrency"
  },
  {
    name: "Income",
    icon: "🗓️",
    subtitle: "Income from receiving dividends.",
    info: "https://www.investopedia.com/terms/d/dividend.asp",
    method: "sum",
    key: "income",
    unit: "appCurrency"
  },
  {
    name: "Forex effects",
    icon: "😢",
    subtitle: "Effect of currency exchange rate changes.",
    info: null,
    method: "sum",
    key: "forexChange",
    unit: "appCurrency"
  },
  /*
  {
    name: "Avg. monthly income",
    subtitle: "Average monthly change of your portfolio's valuation.",
    info: null,
    method: "monthlyMean",
    value: null,
    key: "avgPayout",
    unit: "appCurrency"
  },
  {
    name: "Avg. monthly change",
    subtitle: "Average monthly change of your portfolio's valuation.",
    info: null,
    method: "monthlyMean",
    value: null,
    key: "avgChange",
    unit: "appCurrency"
  },
  /*{
    name: "Time-weighted",
    chartkey: "TWR",
    subtitle: "Compounded return over different holding periods",
    info: "https://www.investopedia.com/terms/t/time-weightedror.asp",
    values: [
      {
        method: "timeframeProduct",
        value: null,
        subtitle: "",
        chartkey: "TWR"
      }
    ],
    unit: "%"
  },
  {
    name: "Taxes",
    subtitle: "How much of your gains you need to let go of.",
    info: null,
    values: Object.values(this.$store.state.stats["Taxes EUR"]),
    method: "sum",
    kpi: null,
    unit: this.$store.state.settings.currency
  },*/ {
    name: "Missed Gain",
    icon: "😢",
    subtitle: "Drop in value from highest point.",
    info: null,
    method: "sum",
    key: "missedGain",
    unit: "appCurrency"
  },
  {
    name: "Delta to target",
    icon: "😢",
    subtitle: "Predicted change based on avg. price target.",
    info: null,
    method: "sum",
    key: "diffToTargetPrice",
    unit: "appCurrency"
  } /*
  {
    name: "Potential updside",
    subtitle:
      "Potential upside if the price of all your assets goes back up to its highest price in 52 weeks.",
    info: null,
    method: "sum",
    value: null,
    key: "diffToYearlyHigh",
    unit: "appCurrency"
  }*/
];

export default new Vuex.Store({
  state: {
    selectedKpiIdx: 0,
    expandMode: false,
    showSettings: null,
    drawer: null,
    assets: [],
    stats: {},
    exchangeRates: null,
    settings: {
      stopLoss: {
        pct: 0,
        date: null
      },
      taxes: 0,
      currency: "EUR",
      benchmark: {
        _name: "benchmark",
        _ticker: "SPY"
      },
      termsConfirmed: false
    }
  },
  mutations: {
    setKpiIdx(state, value) {
      state.selectedKpiIdx = value;
    },
    incrementKpiIdx(state, value) {
      state.selectedKpiIdx = (state.selectedKpiIdx + value) % kpis.length;
    },
    setExchangeRates(state, value) {
      state.exchangeRates = value;
    },
    setBenchmark(state, value) {
      state.settings.benchmark = value;
    },
    setCurrency(state, value) {
      state.settings.currency = value;
    },
    setCurrencies(state, value) {
      state.exchangeRates = value;
    },
    setTaxes(state, value) {
      state.settings.taxes = parseFloat(value);
    },
    setStopLoss(state, value) {
      state.settings.stopLoss.pct = parseFloat(value);
      state.settings.stopLoss.date = new Date().toISOString().substring(0, 10);
    },
    confirmTerms(state) {
      state.settings.termsConfirmed = true;
    },
    setAssets(state, assets) {
      state.assets = assets;
    },
    setStats(state, stats) {
      state.stats = stats;
    },
    addAsset(state, asset) {
      asset.id = Math.random()
        .toString(36)
        .substr(2, 16);
      state.assets.push(asset);
    },
    updateAsset(state, asset) {
      let indexes = state.assets.map(item => item._id);
      let idx = indexes.indexOf(asset.id);
      state.assets[idx] = asset;
    }
  },
  actions: {
    getCurrencies({ commit, state }) {
      return new Promise(async function(resolve) {
        state.exchangeRates = {};
        state.exchangeRates[state.settings.currency] = {};
        await API.requestHandler("forexLatest", {
          exchangeRates: state.exchangeRates
        });
        commit("setCurrencies", state.exchangeRates);
        resolve();
      });
    },
    getExchangeRates({ commit, state, dispatch }, assets) {
      return new Promise(async function(resolve) {
        const today = new Date().toISOString().substring(0, 10);
        const base = state.settings.currency;
        let hasLastestForex = false;
        let hasForexForBuyDate = false;

        if (!state.exchangeRates) await dispatch("getCurrencies");

        let baseObj = state.exchangeRates[base];
        // retrieve latest exchange rates for all currency combinations
        assets.forEach(asset => {
          if (asset.currency && asset.currency !== base) {
            const hasCurrencyPair = baseObj.hasOwnProperty(asset.currency);
            if (hasCurrencyPair) {
              hasLastestForex = baseObj[asset.currency][today];
              hasForexForBuyDate = baseObj[asset.currency][asset.dateBuy];
            } else baseObj[asset.currency] = {};

            if (!hasLastestForex)
              dispatch("getForex", {
                base: base,
                currency: asset.currency,
                date: today
              });
            if (!hasForexForBuyDate)
              dispatch("getForex", {
                base: base,
                currency: asset.currency,
                date: asset.dateBuy
              });
          }
        }, this);
        resolve();
      });
    },
    async getForex({ commit, state }, { base, currency, date }) {
      await API.requestHandler("forexByDate", {
        exchangeRates: state.exchangeRates,
        base: base,
        currency: currency,
        date: date
      });
      commit("setExchangeRates", state.exchangeRates);
    },
    async fetchBenchmarkData({ commit, state, dispatch, getters }) {
      state.settings.benchmark.dateBuy = getters.firstPortfolioDate;
      if (!state.settings.benchmark.isUpdated()) {
        if (
          !this.benchmark.lastTrade ||
          this.benchmark.lastTrade < this.yesterday
        )
          await dispatch("getQuote", this.benchmark);
        commit("setBenchmark", this.benchmark);
      }
    }
  },
  getters: {
    kpi(state) {
      return kpis[state.selectedKpiIdx];
    },
    kpis() {
      return kpis;
    },
    assetsIDs(state) {
      return state.assets.map(item => item._id);
    },
    soldAssets(state, getters) {
      return state.assets.filter(asset => asset._dateSell);
    },
    holdAssets(state, getters) {
      return state.assets.filter(asset => !asset._dateSell);
    },
    firstPortfolioDate(state, getters) {
      let dates = state.assets.map(item => new Date(item._dateBuy));
      return new Date(Math.min(...dates));
    },
    lastPortfolioDate(state, getters) {
      if (getters.holdAssets.length > 0) return new Date();
      let dates = state.assets.map(item => new Date(item._dateSell));
      return new Date(Math.max(...dates));
    },
    settings: state => {
      return state.settings;
    },
    currencyList: state => {
      return state.exchangeRates ? Object.keys(state.exchangeRates) : [];
    }
  },
  plugins: [vuexPersist.plugin]
});
