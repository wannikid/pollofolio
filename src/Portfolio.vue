<template>
  <div>
    <v-content>
      <v-container v-if="assets.length === 0" class="text-center px-5">
        <div
          class="display-1 my-6 font-weight-light"
        >Get magical insights into the mystical world of your stock portfolio</div>
        <img alt="chicken logo" src="../public/images/pollofront.webp" width="290px">
      </v-container>
      <template v-else>
        <v-menu bottom left>
          <template v-slot:activator="{ on }">
            <v-btn text class="align-self-center my-3 ml-2" color="deep-purple accent-4" v-on="on">
              {{ activeFilter }}
              <v-icon right>mdi-menu-down</v-icon>
            </v-btn>
          </template>
          <v-list class="grey lighten-3">
            <v-list-item v-for="(name,id) of filters" :key="id" @click="setFilter(name)">{{ name }}</v-list-item>
          </v-list>
        </v-menu>
        <template v-if="filteredAssets.length > 0">
          <template v-for="(item, idx) of assets">
            <v-alert
              v-if="matchesFilter(item)"
              :key="`asset-${idx}`"
              :color="item.totalChange > 0 ? 'green accent-2' : 'red accent-2'"
              border="left"
              elevation="2"
              colored-border
              class="pl-0 mx-2 mb-2 itemBg"
              v-on:click.native="showDetails(item)"
            >
              <v-list-item>
                <v-list-item-content
                  class="font-weight-bold grey--text text--darken-4"
                >{{ item.name }}</v-list-item-content>
                <!--<span v-if="item.prices.length === 0" class="ml-2">🔍</span>
                <span v-if="item.hasAlarm()" class="ml-2">⏰</span>
                <span v-if="item.forexChange" class="ml-2">💱</span>
                <span v-if="item.return" class="ml-2">💰</span>
                <span
                  v-if="item.signal && item.signal.toUpperCase().includes('BUY')"
                  class="ml-2"
                >👍</span>
                <span
                  v-if="item.signal && item.signal.toUpperCase().includes('SELL')"
                  class="ml-2"
                >👎</span>-->
                <v-list-item-action>
                  <span class="numberFont">
                    {{ item[kpi.key] ? item[kpi.key] : 0 | toLocaleNumber(0) }}
                    <span
                      class="caption"
                    >&nbsp;{{ getKpiUnit() }}</span>
                  </span>
                </v-list-item-action>
              </v-list-item>
              <div
                v-show="expandAssets && item.prices.length > 0"
                class="hidden-sm-and-up mt-3 pl-2"
                style="height:55px"
              >
                <Sparkline :values="item.prices" height="50" :kpi="item.totalChange"/>
              </div>
            </v-alert>
          </template>
        </template>
        <v-container v-else class="text-center">
          <div class="title font-weight-light font-italic my-8">Nothing here</div>
          <img alt="app logo" src="../public/images/pollofront.webp" width="100px">
        </v-container>
      </template>
    </v-content>
  </div>
</template>

<script>
import Asset from "./asset.js";
import Sparkline from "./Sparkline";

export default {
  components: {
    Sparkline
  },
  props: {
    id: String,
    required: false
  },
  data() {
    return {
      activeFilter: null,
      filters: ["Holding", "Already sold"]
    };
  },
  created: function() {},
  mounted: function() {},
  watch: {
    assets: {
      immediate: true,
      handler() {
        this.activeFilter =
          this.$store.getters.holdAssets.length > 0
            ? "Holding"
            : "Already sold";
      }
    }
  },
  computed: {
    filteredAssets() {
      if (this.activeFilter === "Holding")
        return this.$store.getters.holdAssets;
      else return this.$store.getters.soldAssets;
    },
    kpi() {
      return this.$store.getters.kpi;
    },
    expandAssets() {
      return this.$store.state.expandMode;
    },
    assets() {
      return this.$store.state.assets.map(asset => new Asset(asset));
    },
    benchmark() {
      return new Asset(this.$store.state.settings.benchmark);
    }
  },
  methods: {
    getKpiUnit() {
      if (this.kpi.unit === "appCurrency")
        return this.$store.state.settings.currency;
      else return this.kpi.unit;
    },
    setFilter(name) {
      this.activeFilter = name;
      this.$store.state.drawer = false;
    },
    matchesFilter(item) {
      if (this.activeFilter === "Holding" && !item.isSold()) return true;
      if (this.activeFilter === "Already sold" && item.isSold()) return true;
      return false;
    } /*
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push("/");
    },*/,
    showDetails(asset) {
      // prevent from navigating to the current route again
      if (this.id !== asset.id) {
        this.$router.push({
          name: "show",
          params: { data: asset, id: asset.id }
        });
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bold {
  font-weight: bold;
}

.numberFont {
  font-family: "Lato", sans-serif;
  font-size: 12pt;
}

.itemBg {
  background: #ede7f6;
  background: -webkit-linear-gradient(
    to right,
    #ede7f6,
    #ffffff
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #ede7f6,
    #ffffff
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
</style>
