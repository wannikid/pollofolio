<template>
  <v-app v-cloak class="noselect">
    <v-app-bar app :prominent="hasAssets" clipped-right class="yellow accent-3">
      <v-app-bar-nav-icon @click="$store.state.showSettings = !$store.state.showSettings"></v-app-bar-nav-icon>

      <v-toolbar-title v-if="hasAssets" class="flex-grow-1 pl-0">
        <span class="d-flex mt-6">
          <span class="numberFont ml-2">{{ kpiValue | toLocaleNumber(0)}}</span>
          <span class="caption align-self-end mb-1">&nbsp;{{ kpiUnit }}</span>
        </span>

        <v-menu bottom :offset-y="offsetY">
          <template v-slot:activator="{ on }">
            <transition name="slide" mode="out-in">
              <v-btn
                text
                class="align-self-start px-2"
                v-on="on"
                :key="$store.state.selectedKpiIdx"
              >
                {{ kpi.name }}
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </transition>
          </template>
          <v-list class="grey lighten-3">
            <v-list-item
              v-for="(kpi,id) of $store.getters.kpis"
              :key="`menu-${id}`"
              @click="$store.commit('setKpiIdx', id)"
            >{{ kpi.name }}</v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        v-if="hasAssets"
        icon
        class="hidden-sm-and-up"
        @click="$store.state.expandMode = !$store.state.expandMode"
      >
        <v-icon>mdi-chart-areaspline-variant</v-icon>
      </v-btn>
      <v-btn
        id="startBtn"
        dark
        v-if="assets.length === 0 && !$store.state.drawer"
        small
        class="white--text"
        @click="newAsset()"
      >Start</v-btn>
      <v-btn v-else-if="!$store.state.drawer" icon @click="newAsset()">
        <v-icon>mdi-plus-circle</v-icon>
      </v-btn>
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
    <router-view :assets="this.filteredAssets" :unit="this.kpiUnit" :key="$route.fullPath"/>
  </v-app>
</template>
 

<script>
import Asset from "./asset.js";
import Settings from "./Settings";
import * as API from "./api/api";
import gsap from "gsap";

export default {
  name: "App",
  components: {
    Settings
  },
  data() {
    return {
      offsetY: true,
      methods: {
        sum: function(array) {
          const method = (acc, cur) => acc + cur;
          return array.reduce(method, 0);
        },
        last: function(array) {
          return array[array.length - 1];
        },
        monthlyMean: function(array) {
          const method = (acc, cur) => acc + cur;
          let sum = array.reduce(method, 0);
          // 30 days per month on average
          let avg = array.length >= 30 ? sum / (array.length / 30) : sum;
          return isNaN(avg) ? 0 : avg;
        },
        lastChange: function(array) {
          return array[array.length - 1] - array[array.length - 2];
        }
      }
    };
  },
  created: async function() {
    //this.$store.dispatch("fetchBenchmarkData");
    this.$store.state.drawer = false;
    this.$store.state.showSettings = false;
  },
  mounted: function() {
    this.fetchPortfolioData();
    this.$store.dispatch("getExchangeRates", this.assets);
    gsap.from("#startBtn", { delay: 0.5, x: 100, opacity: 0 });
  },
  computed: {
    filteredAssets() {
      let filtered = [];
      this.assets.forEach(asset => {
        if (asset[this.kpi.key]) filtered.push(asset);
      });
      return filtered;
    },
    hasAssets() {
      return this.assets.length > 0;
    },
    assets() {
      return this.$store.state.assets.map(asset => new Asset(asset));
    },
    drawerWidth() {
      if (this.$vuetify.breakpoint.xsOnly) {
        return this.$vuetify.breakpoint.width;
      } else return 360;
    },
    kpi() {
      return this.$store.getters.kpi;
    },
    kpiValue() {
      const values = this.assets.map(asset => asset[this.kpi.key]);
      const method = this.methods[this.kpi.method];
      return method(values);
    },
    kpiUnit() {
      if (this.kpi.unit === "appCurrency")
        return this.$store.state.settings.currency;
      else return this.kpi.unit;
    }
  },
  watch: {
    "$store.state.drawer": function() {
      // reset route when the drawer is closed without using the menu bar buttons
      if (!this.$store.state.drawer && this.$route.name !== "assets")
        this.$router.push({ name: "assets" });
    }
  },
  methods: {
    nextKpi() {
      this.$store.commit("incrementKpiIdx", 1);
    },
    async fetchPortfolioData() {
      let promises = [];
      this.assets.forEach(asset => {
        if (!asset.isUpdated()) {
          promises.push(API.requestHandler("history", { asset: asset }));
          if (!asset.isSold()) {
            promises.push(API.requestHandler("quote", { asset: asset }));
            promises.push(API.requestHandler("signal", { asset: asset }));
            promises.push(API.requestHandler("target", { asset: asset }));
          }
        }
      });
      // wait for all prices to be returned
      if (promises.length > 0) {
        await Promise.all(promises);
        this.$store.commit("setAssets", this.assets);
      }
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

.numberFont {
  font-family: "Lato", sans-serif;
  font-size: 24pt;
}

.handFont {
  font-family: "Indie Flower", cursive;
  font-size: 20pt;
}

.v-navigation-drawer__content {
  background: #ede7f6;
  background: linear-gradient(to top, #ede7f6, #ffffff);
}

.slide-leave-active,
.slide-enter-active {
  transition: 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.slide-enter {
  transform: translate(-100%, 0);
}
.slide-leave-to {
  transform: translate(100%, 0);
}

.gradientBg {
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

