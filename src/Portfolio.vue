<template>
  <div>
    <v-content>
      <v-container v-if="assets.length === 0" class="text-center px-5">
        <div
          class="display-1 font-weight-light my-6"
        >Get magical insights into the mystical world of your stock portfolio</div>
        <div class="body-2">Experimental web app</div>
        <img class="mt-10" alt="chicken logo" src="../public/images/pollofront.webp" width="290px">
      </v-container>
      <template v-else>
        <v-list
          v-if="!listEmpty"
          flat
          three-line
          color="transparent"
          class="py-0 mb-10"
          id="assetList"
        >
          <v-subheader>ASSETS</v-subheader>
          <template v-for="(item, idx) of assets">
            <v-list-item v-show="isSelectedCategory(item)" @click="showDetails(item)" :key="idx">
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
                          <span class="text-uppercase">{{ item.signal }}</span>
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
                      </tr>-->
                      <tr v-if="item.forexChange" class="mt-2">
                        <v-chip class="mr-2" :color="chipColor" :class="sizeAndColor()">
                          <v-avatar left class>💱</v-avatar>
                          <template v-if="expandAssets" class="font-weight-medium black--text">
                            <span v-if="item.forexChange > 0" class="ml-2">Currency gains</span>
                            <span v-if="item.forexChange < 0" class="ml-2">Currency losses</span>
                          </template>
                        </v-chip>
                      </tr>
                      <tr v-if="item.roi || item.roi === 0" class="mt-2">
                        <v-chip
                          class="mr-2"
                          :color="chipColor"
                          :class="sizeAndColor(item.roi)"
                        >
                          <v-avatar left class="mr-2">📈</v-avatar>
                          <span>{{ item.roi | toLocaleNumber(1) }}</span>
                          <span class="caption mr-2">&nbsp;%</span>
                          <span v-if="expandAssets" class="font-weight-medium black--text">Yearly Rate of Return</span>
                        </v-chip>
                      </tr>
                      <tr v-if="item.return" class="mt-2">
                        <v-chip
                          class="mr-2"
                          :color="chipColor"
                          :class="sizeAndColor(item.return)"
                        >
                          <v-avatar left class="mr-2">💰</v-avatar>
                          <span class>{{ item.return | toLocaleNumber(0) }}</span>
                          <span class="caption mr-2">&nbsp;{{ $store.state.settings.currency }}</span>
                          <span
                            class="font-weight-medium black--text"
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
              </v-list-item-action>--->
            </v-list-item>
            <v-divider v-if="isSelectedCategory(item)" :key="'divider-' + idx"></v-divider>
          </template>
        </v-list>
        <v-container v-else class="text-center">
          <div class="title font-weight-light font-italic my-8">Nothing here yet</div>
          <img alt="chicken logo" src="../public/images/pollofront.webp" width="100px">
        </v-container>
        <v-btn
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
        </v-btn>
      </template>
    </v-content>
  </div>
</template>

<script>
import Asset from "./asset.js";
import Sparkline from "./Sparkline";
//import * as API from "./api";

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
      chipColor: "orange lighten-4"
    };
  },
  created: function() {},
  mounted: function() {},
  watch: {},
  computed: {
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
    isSelectedCategory(item) {
      if (this.$store.state.selectedCategory === "Holding")
        return item.isSold() ? false : true;
      if (this.$store.state.selectedCategory === "Already sold")
        return item.isSold() ? true : false;
    },
    /*toggleMenu() {
      this.$router.push({ name: "settings" });
    },
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push("/");
    },*/
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
