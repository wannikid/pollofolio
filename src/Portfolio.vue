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
        <template v-if="!listEmpty">
          <v-alert
            v-for="(item, idx) of assets"
            v-show="isSelectedCategory(item)"
            :key="`asset-${idx}`"
            :color="item.totalChange > 0 ? 'green accent-2' : 'red accent-2'"
            border="left"
            elevation="2"
            colored-border
            class="pl-0 mx-2 mb-2 itemBg"
            v-on:click.native="showDetails(item)"
          >
            <v-list-item>
              <v-list-item-content>
                <div class="font-weight-bold grey--text text--darken-4">{{ item.name }}</div>
              </v-list-item-content>
              <span v-if="item.prices.length === 0" class="ml-2">🔍</span>
              <span v-if="item.hasAlarm()" class="ml-2">⏰</span>
              <span v-if="item.forexChange" class="ml-2">💱</span>
              <span v-if="item.return" class="ml-2">💰</span>
              <span v-if="item.signal && item.signal.toUpperCase().includes('BUY')" class="ml-2">👍</span>
              <span v-if="item.signal && item.signal.toUpperCase().includes('SELL')" class="ml-2">👎</span>
              <v-list-item-action
                class="numberFont"
              >{{ item[kpi.key] ? item[kpi.key] : 0 | toLocaleNumber(0) }}&nbsp;{{ getKpiUnit() }}</v-list-item-action>
            </v-list-item>
            <div
              v-show="expandAssets && item.prices.length > 0"
              class="hidden-sm-and-up mt-3 pl-2"
              style="height:55px"
            >
              <Sparkline :values="item.prices" height="50" :kpi="item.totalChange"/>
            </div>
          </v-alert>
          <!--<v-list-item v-show="isSelectedCategory(item)" @click="showDetails(item)" :key="idx">
              <v-list-item-content>
                <v-list-item-title
                  class="text-truncate font-weight-black grey--text text--darken-3 mb-0"
                >{{ item.name }}</v-list-item-title>
                <v-list-item-subtitle class="text-truncate">
                  <v-row no-gutters>
                    <v-col :class="detailsDirection">
                      <tr v-if="item.prices.length === 0" class="mt-2">
                        <v-chip class="mr-2" :color="chipColor" :class="sizeAndColor()">
                          <v-avatar left class="mr-0">🔍</v-avatar>
                          <span
                            class="font-weight-medium red--text ml-2"
                            v-if="expandAssets"
                          >No prices found</span>
                        </v-chip>
                      </tr>
                      <tr v-if="item.hasAlarm()" class="mt-2">
                        <v-chip class="mr-2" :color="chipColor" :class="sizeAndColor()">
                          <v-avatar left class="mr-0">⏰</v-avatar>
                          <span
                            v-if="expandAssets"
                            class="font-weight-medium red--text ml-2"
                          >Stop Loss Alarm !!!</span>
                        </v-chip>
                      </tr>
                      <tr v-if="item.signal" class="mt-2">
                        <v-chip class="mr-2" :color="chipColor" :class="sizeAndColor()">
                          <v-avatar left class="mr-0">🚦</v-avatar>
                          <span class="ml-2 text-uppercase">{{ item.signal }}</span>
                          <span
                            v-if="expandAssets"
                            class="font-weight-medium ml-2 black--text"
                          >Techn. Indicator Signal</span>
                        </v-chip>
                      </tr>
                      <!--<tr
                        v-if="item.relativeChange"
                        :class="sizeAndColor(item.relativeChange)"
                      >
                        <template v-if="item.relativeChange >= 0">
                          <td class="pr-4">👍</td>
                          <td v-if="expandAssets" class="black--text">Outperforms benchmark</td>
                        </template>
                        <template v-else>
                          <td class="pr-4">👎</td>
                          <td v-if="expandAssets" class="black--text">Underperforms benchmark</td>
                        </template>
                      </tr>
                      <tr v-if="item.forexChange" class="mt-2">
                        <v-chip class="mr-2" :color="chipColor" :class="sizeAndColor()">
                          <v-avatar left class="mr-0">💱</v-avatar>
                          <template v-if="expandAssets">
                            <span
                              v-if="item.forexChange > 0"
                              class="font-weight-medium ml-2"
                            >Currency gains</span>
                            <span
                              v-if="item.forexChange < 0"
                              class="font-weight-medium ml-2"
                            >Currency losses</span>
                          </template>
                        </v-chip>
                      </tr>
                      <tr v-if="item.roi || item.roi === 0" class="mt-2">
                        <v-chip class="mr-2" :color="chipColor" :class="sizeAndColor(item.roi)">
                          <v-avatar left class="mr-0">📈</v-avatar>
                          <span class="ml-2">{{ item.roi | toLocaleNumber(1) }}</span>
                          <span class="caption">&nbsp;%</span>
                          <span
                            v-if="expandAssets"
                            class="ml-2 font-weight-medium black--text"
                          >Yearly Rate of Return</span>
                        </v-chip>
                      </tr>
                      <tr v-if="item.return" class="mt-2">
                        <v-chip class="mr-2" :color="chipColor" :class="sizeAndColor(item.return)">
                          <v-avatar left class="mr-0">💰</v-avatar>
                          <span class="ml-2">{{ item.return | toLocaleNumber(0) }}</span>
                          <span class="caption">&nbsp;{{ $store.state.settings.currency }}</span>
                          <span
                            class="ml-2 font-weight-medium black--text"
                            v-if="expandAssets"
                          >Realized earnings</span>
                        </v-chip>
                      </tr>
                      <div
                        v-if="expandAssets && item.prices.length > 0"
                        class="hidden-sm-and-up mt-3"
                        style="height:55px"
                      >
                        <Sparkline :values="item.prices" height="50" :kpi="item.totalChange"/>
                      </div>
                    </v-col>
                  </v-row>
                </v-list-item-subtitle>
              </v-list-item-content>
              <!--<v-list-item-action v-show="expandAssets">
                <v-list-item-action-text v-if="item.lastChecked" v-text="item.lastChecked"></v-list-item-action-text>
              </v-list-item-action>
            </v-list-item>
          <v-divider v-if="isSelectedCategory(item)" :key="'divider-' + idx"></v-divider>-->
        </template>
        <v-container v-else class="text-center">
          <div class="title font-weight-light font-italic my-8">Nothing here</div>
          <img alt="chicken logo" src="../public/images/pollofront.webp" width="100px">
        </v-container>

        <!--<v-btn
          v-if="$route.name === 'assets'"
          @click="showInsights()"
          fixed
          fab
          bottom
          right
          dark
          color="deep-purple accent-3"
        >
          <v-icon>mdi-finance</v-icon>
        </v-btn>-->
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
      chipColor: "orange lighten-4",
      activeMenuItem: 0,
      menuItems: ["Holding", "Already sold"]
    };
  },
  created: function() {},
  mounted: function() {},
  watch: {
    assets: function() {
      // trigger a change of category if there is no asset left in the current one
      this.activeMenuItem = this.$store.getters.holdAssets.length > 0 ? 0 : 1;
      this.$store.state.selectedCategory = this.menuItems[this.activeMenuItem];
    }
  },
  computed: {
    kpi() {
      return this.$store.getters.kpi;
    },
    expandAssets() {
      return this.$store.state.expandMode;
    },
    assets() {
      return this.$store.state.assets.map(asset => new Asset(asset));
    },
    holdCount() {
      return this.$store.getters.holdAssets.length;
    },
    soldCount() {
      return this.$store.getters.soldAssets.length;
    },
    listEmpty() {
      if (
        this.$store.state.selectedCategory === "Holding" &&
        this.holdCount > 0
      )
        return false;
      if (
        this.$store.state.selectedCategory === "Already sold" &&
        this.soldCount > 0
      )
        return false;
      return true;
    },
    benchmark() {
      return new Asset(this.$store.state.settings.benchmark);
    },
    detailsDirection() {
      return this.expandAssets
        ? "d-flex flex-column mt-2"
        : "d-flex flex-row justify-start";
    }
  },
  methods: {
    getKpiUnit() {
      if (this.kpi.unit === "appCurrency")
        return this.$store.state.settings.currency;
      else return this.kpi.unit;
    },
    setCategory(id, item) {
      this.activeMenuItem = id;
      this.$store.state.selectedCategory = item;
      this.$store.state.drawer = false;
    },
    isSelectedCategory(item) {
      if (this.$store.state.selectedCategory === "Holding")
        return item.isSold() ? false : true;
      if (this.$store.state.selectedCategory === "Already sold")
        return item.isSold() ? true : false;
    } /*
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push("/");
    },*/,
    sizeAndColor(val) {
      let classString = this.expandAssets ? "body-2" : "subtitle-1";
      if (val)
        classString += val >= 0 ? " green--text text--darken-1" : " red--text";
      return classString;
    },
    showInsights() {
      this.$router.push({ name: "insights" });
    },
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
