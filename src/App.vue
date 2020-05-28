<template>
  <v-app v-cloak class="noselect">
    <v-app-bar app clipped-right color="deep-purple accent-3" dark>
      <v-app-bar-nav-icon @click="$store.state.showSettings = !$store.state.showSettings"></v-app-bar-nav-icon>
      <v-toolbar-title>
        <span class="brandFont">Pollofolio</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="newAsset()">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <template v-if="$store.state.assets.length > 0" v-slot:extension class="align-center">
        <v-menu bottom left>
          <template v-slot:activator="{ on }">
            <v-btn text class="align-self-center mr-4" v-on="on">
              {{ menuItems[activeMenuItem] }}
              <v-icon right>mdi-menu-down</v-icon>
            </v-btn>
          </template>
          <v-list class="grey lighten-3">
            <v-list-item
              v-for="(item,id) of menuItems"
              :key="id"
              @click="setCategory(id, item)"
            >{{ item }}</v-list-item>
          </v-list>
        </v-menu>
        <v-spacer></v-spacer>
        <v-switch hide-details v-model="$store.state.expandMode" label="Expand"></v-switch>
      </template>
    </v-app-bar>

    <Settings v-if="$store.state.showSettings"/>

    <v-navigation-drawer
      v-model="$store.state.drawer"
      floating
      clipped
      right
      app
      :width="drawerWidth"
      :disable-resize-watcher="true"
    >
      <router-view name="drawer" :key="$route.fullPath"/>
    </v-navigation-drawer>
    <router-view :key="$route.fullPath"/>
  </v-app>
</template>
 

<script>
import Asset from "./asset.js";
import Settings from "./Settings";
import * as API from "./api/api";

export default {
  name: "App",
  components: {
    Settings
  },
  data() {
    return {
      activeMenuItem: 0,
      menuItems: ["Holding", "Already sold"]
    };
  },
  created: async function() {
    //this.$store.dispatch("fetchBenchmarkData");
    this.$store.state.drawer = false;
    this.$store.state.showSettings = false;
  },
  mounted: function() {
    this.fetchPortfolioData();
    this.fetchExchangeRates();
    this.fetchCurrencies();
  },
  computed: {
    assets() {
      return this.$store.state.assets.map(asset => new Asset(asset));
    },
    drawerWidth() {
      if (this.$vuetify.breakpoint.xsOnly) {
        return this.$vuetify.breakpoint.width;
      } else return 360;
    }
  },
  watch: {
    "$store.state.drawer": function() {
      // close the right side drawer if open
      if (!this.$store.state.drawer && this.$route.name !== "assets")
        this.$router.push({ name: "assets" });
    },
    "$store.state.assets": function() {
      // trigger a change of category if there is no asset left in the current one
      this.activeMenuItem = this.$store.getters.holdAssets.length > 0 ? 0 : 1;
      this.$store.state.selectedCategory = this.menuItems[this.activeMenuItem];
    }
  },
  methods: {
    fetchCurrencies() {
      // initiate currencyList if not done already
      if (this.$store.state.currencyList.length < 2) {
        this.$store.state.currencyList.push(
          this.$store.state.settings.currency
        );
        this.$store.dispatch("getCurrencies");
      }
    },
    async fetchPortfolioData() {
      let promises = [];
      this.assets.forEach(asset => {
        if (!asset.isUpdated()) {
          promises.push(API.requestHandler("history",{ asset: asset }));
          if (!asset.isSold()) {
            promises.push(API.requestHandler("quote", { asset: asset }));
            promises.push(API.requestHandler("signal", { asset: asset }));
          }
        }
      });
      // wait for all prices to be returned
      if (promises.length > 0) {
        await Promise.all(promises);
        this.$store.commit("setAssets", this.assets);
        this.$store.dispatch("updateInsights");
      }
    },
    fetchExchangeRates() {
      const today = new Date().toISOString().substring(0, 10);
      const base = this.$store.state.settings.currency;
      let hasLastestForex = false;
      let hasForexForBuyDate = false;

      let baseObj = this.$store.state.exchangeRates[base];
      // retrieve latest exchange rates for all currency combinations
      this.assets.forEach(asset => {
        if (asset.currency && asset.currency !== base) {
          const hasCurrencyPair = baseObj.hasOwnProperty(asset.currency);
          if (hasCurrencyPair) {
            hasLastestForex = baseObj[asset.currency][today];
            hasForexForBuyDate = baseObj[asset.currency][asset.dateBuy];
          } else baseObj[asset.currency] = {};

          if (!hasLastestForex)
            this.$store.dispatch("getForex", {
              base: base,
              currency: asset.currency,
              date: today
            });
          if (!hasForexForBuyDate)
            this.$store.dispatch("getForex", {
              base: base,
              currency: asset.currency,
              date: asset.dateBuy
            });
        }
      }, this);
    },
    setCategory(id, item) {
      this.activeMenuItem = id;
      this.$store.state.selectedCategory = item;
      this.$store.state.drawer = false;
    },
    newAsset() {
      this.$router.push({ name: "add", params: { data: new Asset(null) } });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
[v-cloak] {
  display: none;
}

html {
  overflow-y: auto;
}

.noselect {
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.brandFont {
  font-family: "Days One", sans-serif;
}

.v-application--wrap {
  background: #ede7f6;
  background: -webkit-linear-gradient(
    to left,
    #ede7f6,
    #ffffff
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to left,
    #ede7f6,
    #ffffff
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
</style>

