<template>
  <v-expansion-panel ripple>
    <v-expansion-panel-header class="d-flex justify-space-between">
      <span>
        <v-icon class="pl-0 pr-3 black--text">mdi-finance</v-icon>
        <span class="font-weight-medium">Performance</span>
      </span>
      <span v-if="asset.roi" class="d-flex justify-end pr-3">{{ asset.roi | toLocaleNumber(1) }} %</span>
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
          <span>{{ asset[detail.key] | toLocaleNumber(detail.digits) }}{{ suffix(detail.suffix) }}</span>
        </div>
      </div>
      <!--<div :style="{height: chartHeight + 'px'}" class="mt-5">
        <div v-if="asset.timeseries.length >= 2">
          <v-sparkline
            :value="assetLine"
            :fill="true"
            :gradient="['rgba(0,200,0,0.9)', 'rgba(173,216,230,0.4)']"
            :smooth="true"
            :height="assetHeight"
            class="px-0"
            :style="assetLineStyle"
          ></v-sparkline>
          <v-sparkline
            class="px-0"
            :value="benchmarkLine"
            :fill="false"
            :gradient="['orange']"
            :smooth="true"
            :line-width="1.0"
            :height="benchmarkHeight"
            :style="benchmarkLineStyle"
          ></v-sparkline>
        </div>
      </div>-->
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
//import Asset from "./asset.js";

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
          name: "Holding period",
          key: "holdingPeriod",
          digits: 0,
          suffix: " days"
        },
        {
          name: "Invested value",
          key: "totalBuy",
          digits: 0,
          suffix: "appCurrency"
        },
        {
          name: "Change",
          key: "totalChange",
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
          name: "Total value",
          key: "totalValue",
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
          key: "totalChangePct",
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
        } /*
        {
          name: "Technical signal",
          key: "signal",
          digits: null,
          suffix: ""
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
  created: function() {
    //if (!this.asset.lastPrice)
    //this.$store.state.bannerText = "No price information available.";
  },
  mounted: function() {},
  computed: {
    /*,
    benchmark: function() {
      return new Asset(this.$store.state.settings.benchmark).trim(
        this.asset.dateBuy,
        this.asset.dateSell
      );
    },
    benchmarkLine: function() {
      let prices = Object.values(this.benchmark._timeseries);
      return prices.map(price => {
        return price / this.benchmark._timeseries[this.asset.dateBuy] - 1;
      });
    },
    assetLine: function() {
      let prices = Object.values(this.asset._timeseries);
      return prices.map(price => {
        return price / this.asset._timeseries[this.asset.dateBuy] - 1;
      });
    },
    assetBottomDiff: function() {
      // determine if the benchmark has a negative minimum and adjust the bottom-margin for the asset accordingly
      let diff = 0;
      let min = Math.min(...Object.values(this.benchmarkLine));
      let max = Math.max(...Object.values(this.benchmarkLine));
      let maxDiff = max + Math.abs(min);
      if (min < 0)
        diff = Math.round((Math.abs(min) / maxDiff) * this.benchmarkHeight);
      return diff;
    },
    benchmarkBottomDiff: function() {
      // determine if the asset has a negative minimum and adjust the bottom-margin for the benchmark accordingly
      let diff = 0;
      let min = Math.min(...Object.values(this.assetLine));
      let max = Math.max(...Object.values(this.assetLine));
      let maxDiff = max + Math.abs(min);
      if (min < 0)
        diff = Math.round((Math.abs(min) / maxDiff) * this.assetHeight);
      return diff;
    },
    assetLineStyle: function() {
      let diff = 0;
      if (this.assetBottomDiff > this.benchmarkBottomDiff)
        diff = this.assetBottomDiff - this.benchmarkBottomDiff;
      else diff = 0;
      return {
        position: "absolute",
        bottom: diff + "px",
        left: 0 + "px",
        right: 0 + "px"
      };
    },
    benchmarkLineStyle: function() {
      let diff = 0;
      if (this.assetBottomDiff > this.benchmarkBottomDiff) diff = 0;
      else diff = this.benchmarkBottomDiff - this.assetBottomDiff;
      return {
        position: "absolute",
        bottom: diff + "px",
        left: 0 + "px",
        right: 0 + "px",
        zIndex: 10
      };
    },
    maxDiffAsset: function() {
      let min = Math.min(...Object.values(this.assetLine));
      let max = Math.max(...Object.values(this.assetLine));
      return max + Math.abs(min);
    },
    maxDiffBenchmark: function() {
      let min = Math.min(...Object.values(this.benchmarkLine));
      let max = Math.max(...Object.values(this.benchmarkLine));
      return max + Math.abs(min);
    },
    assetHeight: function() {
      let ratio = this.maxDiffAsset / this.maxDiffBenchmark;
      // if the ratio bigger than 1, the asset should take the full height of the chart = 100px
      if (ratio > 1) return 100;
      else return Math.round(100 * ratio);
    },
    benchmarkHeight: function() {
      let ratio = this.maxDiffBenchmark / this.maxDiffAsset;
      // if the ratio bigger than 1, the asset should take the full height of the chart = 100px
      if (ratio > 1) return 100;
      else return Math.round(100 * ratio);
    },
    chartHeight: function() {
      let abs = Math.abs(this.benchmarkBottomDiff - this.assetBottomDiff);
      let a = this.benchmarkHeight + abs;
      let b = this.assetHeight + abs;
      let c = a > b ? a : b;
      let d = this.benchmarkHeight + this.assetHeight;
      return c > d ? d : c;
    }*/
  },
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
