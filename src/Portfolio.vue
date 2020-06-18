<template>
  <div>
    <v-content>
      <v-container v-if="$store.state.assets.length === 0" class="text-center px-5">
        <div
          class="handFont my-6 font-weight-light"
        >Get magical insights into the mystical world of your stock portfolio</div>
        <picture>
          <source srcset="../public/images/pollofront.webp" type="image/webp">
          <source srcset="../public/images/pollofront.png" type="image/png">
          <img src="../public/images/pollofront.png" alt="App logo" width="290px">
        </picture>
      </v-container>
      <template v-else>
        <v-list-item class="px-2 my-2">
          <v-list-item-avatar class="mr-1">
            <v-btn fab :href="kpi.info" target="_blank">
              <v-icon
                :color="kpi.info ? 'deep-purple accent-2' : 'grey lighten-1'"
              >mdi-information-outline</v-icon>
            </v-btn>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-subtitle v-html="kpi.subtitle" :key="kpi.key"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <template v-if="assets.length > 0">
          <v-row class="mx-1">
            <v-col
              class="py-0 px-0"
              cols="12"
              sm="6"
              md="4"
              v-for="(item, idx) of assets"
              :key="`asset-${idx}`"
            >
              <v-alert
                dense
                :color="borderColor(item)"
                border="left"
                colored-border
                class="pl-0 mx-2 mb-2 itemBg"
                :elevation="2"
                v-on:click.native="showDetails(item)"
              >
                <v-list-item>
                  <v-list-item-content
                    class="font-weight-bold grey--text text--darken-4 py-0 align-start"
                  >{{ item.name }}</v-list-item-content>

                  <v-list-item-action class="my-0">
                    <div class="numberFont">
                      {{ item[kpi.key] | toLocaleNumber(0) }}
                      <span class="caption">&nbsp;{{ unit }}</span>
                    </div>
                    <!--<v-list-item-action-text class="body-1" v-if="expandAssets">
                  <span v-if="item.prices.length === 0" class="ml-2">🔍</span>
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
                  >👎</span>
                    </v-list-item-action-text>--->
                  </v-list-item-action>
                </v-list-item>
                <div
                  v-if="expanded && item.prices.length > 1"
                  class="hidden-sm-and-up mt-0 pl-2"
                  style="height:55px"
                >
                  <Sparkline :values="item.prices" height="50" :kpi="item.change"/>
                </div>
              </v-alert>
            </v-col>
          </v-row>
        </template>
        <v-container v-else class="text-center">
          <div class="title font-weight-light font-italic my-8">Nothing yet</div>
          <picture>
            <source srcset="../public/images/pollofront.webp" type="image/webp">
            <source srcset="../public/images/pollofront.png" type="image/png">
            <img src="../public/images/pollofront.png" alt="App logo" width="100px">
          </picture>
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
    assets: Array,
    unit: String
  },
  data() {
    return {};
  },
  created: function() {},
  mounted: function() {},
  watch: {},
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

/* ----------------------------------------------
 * Generated by Animista on 2020-6-10 10:22:31
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

/**
 * ----------------------------------------
 * animation flip-horizontal-bottom
 * ----------------------------------------
 */
@keyframes flip {
  0% {
    letter-spacing: -0.5em;
    opacity: 0;
  }
  40% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

.flip-enter-active {
  animation: flip 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) both;
}
</style>
