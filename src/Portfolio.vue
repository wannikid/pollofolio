<template>
  <div>
    <v-content class="mb-12">
      <v-container v-if="$store.state.assets.length === 0" class="text-center px-5">
        <div
          class="anim1 handFont my-6 font-weight-light"
        >Get magical insights into the mystical world of your stock portfolio</div>
        <img class="anim1" src="../public/images/pollofront.png" alt="App logo" width="250px">
      </v-container>
      <template v-else>
        <v-list-item class="px-2 my-2">
          <v-list-item-avatar class="mr-1">
            <v-btn fab :href="kpi.info" target="_blank">
              <v-icon :color="kpi.info ? 'grey darken-3' : 'grey lighten-1'">mdi-open-in-new</v-icon>
            </v-btn>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-subtitle v-html="kpi.subtitle" :key="kpi.key"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <template v-if="assets.length > 0">
          <v-row class="mx-1">
            <v-col
              class="anim2 py-0 px-0"
              cols="12"
              sm="6"
              md="4"
              v-for="(item, idx) of assets"
              :key="`asset-${idx}`"
            >
              <v-card
                light
                outlined
                ripple
                :disabled="item.id === assetID"
                class="mx-2 mb-2"
                v-on:click.native="showDetails(item)"
              >
                <v-list-item class="pr-2 px-3">
                  <v-list-item-content class="font-weight-regular py-2">
                    {{ item.name }}
                    <div class="numberFont" :class="numberColor(item)">
                      {{ item[kpi.key] | toLocaleNumber(0) }}
                      <span class="caption">&nbsp;{{ unit }}</span>
                      <span v-if="item.hasAlarm()" class="ml-2">⏰</span>
                      <!-- <span v-if="item.forexChange" class="ml-2">💵</span>
                  <span v-if="item.return" class="ml-2">💰</span>
                  <span
                    v-if="item.signal && item.signal.toUpperCase().includes('BUY')"
                    class="ml-2"
                  >👍</span>
                  <span
                    v-if="item.signal && item.signal.toUpperCase().includes('SELL')"
                    class="ml-2"
                      >👎</span>-->
                    </div>
                  </v-list-item-content>
                  <v-list-item-action class="ma-0">
                    <v-btn small icon>
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
                <div
                  v-if="expanded && item.prices.length > 1"
                  class="hidden-sm-and-up"
                  style="height:55px"
                >
                  <Sparkline :values="item.prices" height="50" :kpi="item.change"/>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </template>
        <v-container v-else class="text-center">
          <div class="title font-weight-light font-italic my-8">Nothing yet</div>
          <img src="../public/images/pollofront.png" alt="App logo" width="100px">
        </v-container>
      </template>
    </v-content>
  </div>
</template>

<script>
import Asset from "./asset.js";
import Sparkline from "./Sparkline";
import gsap from "gsap";

export default {
  components: {
    Sparkline
  },
  props: {
    id: String,
    assets: Array,
    unit: String
  },
  data() {
    return {
      assetID: this.id
    };
  },
  created: function() {},
  mounted: function() {
    gsap.from(".anim1", { duration: 1, y: -50, opacity: 0, stagger: 0.6 });
  },
  watch: {
    kpi: function() {
      gsap.from(".anim2", { duration: 0.5, opacity: 0, x: -500, stagger: 0.1 });
    }
  },
  computed: {
    kpi() {
      return this.$store.getters.kpi;
    },
    expanded() {
      return this.$store.state.expandMode;
    },
    benchmark() {
      return new Asset(this.$store.state.settings.benchmark);
    }
  },
  methods: {
    numberColor(asset) {
      if (this.kpi.key === "change")
        return asset[this.kpi.key] < 0
          ? "red--text text--accent-3"
          : "green--text text--accent-4";
    },
    borderColor(asset) {
      if (asset.isSold())
        return asset.return > 0 ? "green accent-2" : "red accent-2";
      else return asset.change > 0 ? "green accent-2" : "red accent-2";
    },
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push("/");
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
.numberFont {
  font-family: "Lato", sans-serif;
  font-size: 12pt;
}
</style>
