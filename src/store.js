// store.js
import Vue from "vue";
import Vuex from "vuex";
import VuexPersist from "vuex-persist";
import * as API from "./api";

const vuexPersist = new VuexPersist({
  key: "pollofolio",
  storage: window.localStorage
});

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    selectedCategory: null,
    expandMode: false,
    showSettings: null,
    drawer: null,
    assets: [],
    stats: {},
    exchangeRates: {
      EUR: {}
    },
    currencyList: [],
    settings: {
      stopLossPct: 0,
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
      state.currencyList = value;
    },
    setTaxes(state, value) {
      state.settings.taxes = parseFloat(value);
    },
    setStopLossPct(state, value) {
      state.settings.stopLossPct = parseFloat(value);
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
    async getCurrencies({ commit, state }) {
      await API.getEXCHANGERATESlatest(state.currencyList);
      commit("setCurrencies", state.currencyList);
    },
    async getForex({ commit, state }, { base, currency, date }) {
      await API.getEXCHANGERATESdate({
        exchangeRates: state.exchangeRates,
        base: base,
        currency: currency,
        date: date
      });
      commit("setExchangeRates", state.exchangeRates);
    },
    async updateInsights({ commit, state, dispatch, getters }) {
      if (state.assets.length > 0) {
        const response = await fetch(
          "https://runonstocks-tyjszt3iha-uc.a.run.app/insights",
          {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              stocks: state.assets,
              taxes: state.settings.taxes
            })
          }
        );
        const stats = await response.json();
        commit("setStats", stats);
      }
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
    }
  },
  plugins: [vuexPersist.plugin]
});
