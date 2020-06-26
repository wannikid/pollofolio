<template>
  <v-expansion-panel ripple>
    <v-expansion-panel-header class="d-flex justify-space-between">
      <span>
        <span class="title pr-3">📈</span>
        <span class="font-weight-medium">Performance</span>
      </span>
      <!--<span v-if="asset.roi" class="d-flex justify-end pr-3">{{ asset.roi | toLocaleNumber(1) }} %</span>-->
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <div
        class="body-2 my-2"
      >The yearly Rate of Return allows you to compare assets that you have owned for different lengths of time.</div>
      <P/>
      <div v-for="detail in details" :key="detail.key">
        <div
          v-if="asset[detail.key] && suffix(detail.suffix)"
          class="d-flex justify-space-between pb-1 body-2"
        >
          <span class="subtitle-2" v-html="detail.name"></span>
          <span>
            {{ asset[detail.key] | toLocaleNumber(detail.digits) }}
            <span
              v-if="detail.suffix"
              class="caption align-self-end"
            >{{ suffix(detail.suffix) }}</span>
          </span>
        </div>
      </div>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
export default {
  props: {
    data: Object,
    required: true
  },
  data() {
    return {
      asset: this.data,
      details: [
        {
          name: "Last price",
          key: "lastPrice",
          digits: 2,
          suffix: "assetCurrency"
        },
        {
          name: "Stop Loss at",
          key: "stopLoss",
          digits: 2,
          suffix: "appCurrency"
        },
        {
          name: "Avg. price target",
          key: "targetPrice",
          digits: 2,
          suffix: "assetCurrency"
        },

        {
          name: "Holding period",
          key: "holdingPeriod",
          digits: 0,
          suffix: " days"
        },
        {
          name: "Invested value",
          key: "buyValue",
          digits: 0,
          suffix: "appCurrency"
        },
        {
          name: "Change",
          key: "change",
          digits: 0,
          suffix: "appCurrency"
        },
        {
          name: "Currency effects",
          key: "forexChange",
          digits: 0,
          suffix: "appCurrency"
        },
        {
          name: "Current value",
          key: "value",
          digits: 0,
          suffix: "appCurrency"
        },
        {
          name: "Down from high",
          key: "missedGain",
          digits: 0,
          suffix: "appCurrency"
        },
        {
          name: "Upside to 52 weeks high",
          key: "diffToYearlyHigh",
          digits: 0,
          suffix: "appCurrency"
        },
        {
          name: "Change in %",
          key: "changePct",
          digits: 1,
          suffix: "%"
        },
        {
          name: "Return (incl. income)",
          key: "return",
          digits: 0,
          suffix: "appCurrency"
        },
        {
          name: "Yearly Rate of Return",
          key: "roi",
          digits: 1,
          suffix: "%"
        },
        {
          name: "Technical signal",
          key: "signal",
          digits: null,
          suffix: null
        }
        /*{
          name: "Relative change to benchmark",
          key: "relativeChange",
          digits: 1,
          suffix: "%"
        },*/
      ]
    };
  },
  created: function() {},
  mounted: function() {},
  computed: {},
  watch: {},
  methods: {
    suffix: function(suffix) {
      if (suffix === "assetCurrency") {
        if (this.asset.currency) return " " + this.asset.currency;
        else return null;
      }
      if (suffix === "appCurrency")
        return " " + (suffix = this.$store.state.settings.currency);
      else return " " + suffix;
    }
  }
};
</script>

<!-- Add "scoped" keyibute to limit CSS to this component only -->
<style scoped>
.bold {
  font-weight: bold;
}
</style>
