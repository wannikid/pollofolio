<template>
  <v-app v-cloak class="noselect">
    <v-app-bar app :prominent="hasAssets" clipped-right color="yellow accent-3" light>
      <v-app-bar-nav-icon
        color="deep-purple accent-2"
        @click="$store.state.showSettings = !$store.state.showSettings"
      ></v-app-bar-nav-icon>

      <v-toolbar-title v-if="hasAssets">
        <span class="d-flex mt-6">
          <span class="numberFont">{{ kpi.value | toLocaleNumber(0)}}</span>
          <span class="caption align-self-end mb-1">&nbsp;{{ getKpiUnit() }}</span>
        </span>
        <transition name="slide" mode="out-in">
          <div :key="kpi.name" class="body-2">{{ kpi.name }}</div>
        </transition>
      </v-toolbar-title>
      <v-toolbar-title v-else>Pollofolio</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-btn
        v-if="hasAssets"
        icon
        color="deep-purple accent-3"
        class="hidden-sm-and-up"
        dark
        @click="$store.state.expandMode = !$store.state.expandMode"
      >
        <v-icon>mdi-chart-areaspline-variant</v-icon>
      </v-btn>
      <v-btn
        icon
        color="deep-purple accent-3"
        dark
        :class="{ 'blink-2': !hasAssets }"
        @click="newAsset()"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn
        v-if="hasAssets"
        small
        color="deep-purple accent-3"
        dark
        absolute
        bottom
        right
        fab
        @click="nextKpi()"
      >
        <v-icon>mdi-chevron-right</v-icon>
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
    return {};
  },
  created: async function() {
    //this.$store.dispatch("fetchBenchmarkData");
    this.$store.state.drawer = false;
    this.$store.state.showSettings = false;
  },
  mounted: function() {
    this.fetchPortfolioData();
    this.$store.dispatch("getExchangeRates", this.assets);
  },
  computed: {
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
    }
  },
  watch: {
    "$store.state.drawer": function() {
      // reset route to assets
      if (!this.$store.state.drawer && this.$route.name !== "assets")
        this.$router.push({ name: "assets" });
    },
    "$store.state.selectedKpiIdx": {
      immediate: true,
      handler() {
        const values = this.assets.map(asset => asset[this.kpi.key]);
        this.$store.commit("setKpi", values);
      }
    }
  },
  methods: {
    nextKpi() {
      this.$store.commit("incrementKpiIdx", 1);
    },
    getKpiUnit() {
      if (this.kpi.unit === "appCurrency")
        return this.$store.state.settings.currency;
      else return this.kpi.unit;
    },
    async fetchPortfolioData() {
      let promises = [];
      this.assets.forEach(asset => {
        if (!asset.isUpdated()) {
          promises.push(API.requestHandler("history", { asset: asset }));
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
    setCategory(id, item) {
      this.activeMenuItem = id;
      this.$store.state.selectedCategory = item;
      this.$store.state.drawer = false;
    },
    newAsset() {
      this.$router.push({ name: "add", params: { data: new Asset(null) } });
    },
    showInsights() {
      this.$router.push({ name: "insights" });
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

.v-navigation-drawer__content {
  background: #ede7f6;
  background: linear-gradient(to top, #ede7f6, #ffffff);
}

.slide-in-right {
  -webkit-animation: slide-in-right 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)
    both;
  animation: slide-in-right 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
/* ----------------------------------------------
 * Generated by Animista on 2020-6-7 20:56:50
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

/**
 * ----------------------------------------
 * animation slide-in-right
 * ----------------------------------------
 */
@-webkit-keyframes slide-in-right {
  0% {
    -webkit-transform: translateX(1000px);
    transform: translateX(1000px);
    opacity: 0;
  }
  100% {
    -webkit-transform: translateX(0);
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes slide-in-right {
  0% {
    -webkit-transform: translateX(1000px);
    transform: translateX(1000px);
    opacity: 0;
  }
  100% {
    -webkit-transform: translateX(0);
    transform: translateX(0);
    opacity: 1;
  }
}

.blink-2 {
  -webkit-animation: blink-2 1.9s infinite both;
  animation: blink-2 1.9s infinite both;
}

/* ----------------------------------------------
 * Generated by Animista on 2020-6-8 1:30:55
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

/**
 * ----------------------------------------
 * animation blink-2
 * ----------------------------------------
 */
@-webkit-keyframes blink-2 {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}
@keyframes blink-2 {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}

.slide-leave-active,
.slide-enter-active {
  transition: 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.slide-enter {
  transform: translate(100%, 0);
}
.slide-leave-to {
  transform: translate(-100%, 0);
}
</style>

