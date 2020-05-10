<template>
  <div>
    <v-toolbar flat light color="grey lighten-4">
      <v-toolbar-title class="font-weight-black headline">Magical Insights 🧙</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="hideDetails()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-expansion-panels hover flat v-model="openPanel" accordion class="mt-0 mb-12">
      <v-expansion-panel v-for="(item, id) in kpis" :key="`kpi-${id}`" class="px-0">
        <v-expansion-panel-header class="d-flex justify-space-between">
          <span>
            <span class="font-weight-medium">{{ item.header }}</span>
          </span>
          <span class="d-flex justify-end pr-3 align-center self-align-center">
            <span class="title font-weight-light">{{ item.kpi | toLocaleNumber(0)}}</span>
            <span class="caption">&nbsp;{{item.unit }}</span>
          </span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card outlined class="mt-3">
            <v-card-subtitle v-if="item.info" class="blue--text">
              <v-icon small color="blue" left>mdi-open-in-new</v-icon>
              <a target="_blank" :href="item.info">Learn More</a>
            </v-card-subtitle>
            <v-card-text class="text-left body-2">{{ item.subtitle }}</v-card-text>
            <!--<v-card-actions v-if="item.info">
              <v-btn text color="primary">
                <v-icon left>mdi-open-in-new</v-icon>
                <a target="_blank" :href="item.info">Learn More</a>
              </v-btn>
            </v-card-actions>-->
            <div v-if="getValues(item).length > 0" style="height:105px" class="mb-0">
              <Sparkline :values="getValues(item)" height="80"/>
            </div>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <!--<v-bottom-navigation elevation="8" class="posBottom" :value="activeMenuItem" grow color="teal">
      <v-btn v-for="(item, id) of menuItems" :key="`menu-${id}`">
        <span>{{ item }}</span>
      </v-btn>
    </v-bottom-navigation>-->
  </div>
</template>


<script>
import Sparkline from "./Sparkline";
import Asset from "./asset.js";

export default {
  components: {
    Sparkline
  },
  data() {
    return {
      menuItems: [],
      activeMenuItem: 0,
      openPanel: null,
      timeframeStart: 0,
      timeframeEnd: 0,
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
      },
      kpis: [
        /*{
          header: "Last change",
          subtitle: "How much you are up or down today.",
          info: null,
          values: Object.values(this.$store.state.stats["Change EUR"]),
          method: "lastChange",
          kpi: null,
          unit: this.$store.state.settings.currency
        },*/
        {
          header: "Total change",
          subtitle: "How much your portfolio has changed.",
          info: null,
          values: Object.values(this.$store.state.stats["Change EUR"]),
          /*values: this.$store.getters.holdAssets.map(
            asset => new Asset(asset).totalChange
          ),*/
          method: "last",
          kpi: null,
          unit: this.$store.state.settings.currency
        },
        {
          header: "Invested",
          subtitle:
            "For how much you have purchased the assets in your portfolio.",
          info: null,
          values: Object.values(this.$store.state.stats["Invested EUR"]),
          method: "last",
          kpi: null,
          unit: this.$store.state.settings.currency
        },
        {
          header: "Valuation",
          subtitle:
            'How much you have on your "bank account". It is the sum of your investments plus price changes.',
          info: null,
          method: "last",
          kpi: null,
          values: Object.values(this.$store.state.stats["Market value EUR"]),
          unit: this.$store.state.settings.currency
        },
        {
          header: "Gain/Loss from trading",
          subtitle: "Your gain/loss from selling assets.",
          info: "https://www.investopedia.com/terms/g/gain.asp",
          values: Object.values(this.$store.state.stats["GainLossCum EUR"]),
          /*values: this.$store.state.assets.map(
            asset => new Asset(asset).return
          ),*/
          method: "last",
          kpi: null,
          unit: this.$store.state.settings.currency
        },
        {
          header: "Gain from payouts",
          subtitle: "Your gain from receiving dividends.",
          info: "https://www.investopedia.com/terms/g/gain.asp",
          values: Object.values(this.$store.state.stats["Payouts EUR"]),
          /*values: this.$store.state.assets.map(asset =>
            new Asset(asset).getPayoutSum()
          ),*/
          method: "sum",
          kpi: null,
          unit: this.$store.state.settings.currency
        },
        {
          header: "Avg. monthly payout",
          subtitle: "Average monthly change of your portfolio's valuation.",
          info: null,
          values: Object.values(this.$store.state.stats["Payouts EUR"]),
          method: "monthlyMean",
          kpi: null,
          unit: this.$store.state.settings.currency
        },
        {
          header: "Avg. monthly change",
          subtitle: "Average monthly change of your portfolio's valuation.",
          info: null,
          values: Object.values(this.$store.state.stats["Daily change EUR"]),
          method: "monthlyMean",
          kpi: null,
          unit: this.$store.state.settings.currency
        },
        /*{
          header: "Time-weighted",
          chartkey: "TWR",
          subtitle: "Compounded return over different holding periods",
          info: "https://www.investopedia.com/terms/t/time-weightedror.asp",
          values: [
            {
              method: "timeframeProduct",
              value: null,
              subtitle: "",
              chartkey: "TWR"
            }
          ],
          unit: "%"
        },
        {
          header: "Taxes",
          subtitle: "How much of your gains you need to let go of.",
          info: null,
          values: Object.values(this.$store.state.stats["Taxes EUR"]),
          method: "sum",
          kpi: null,
          unit: this.$store.state.settings.currency
        },*/
        {
          header: "Missed Gain",
          subtitle:
            "What you missed out on by not selling your current assets at the highest price.",
          info: null,
          values: this.$store.getters.holdAssets.map(
            asset => new Asset(asset).missedGain
          ),
          method: "sum",
          kpi: null,
          unit: this.$store.state.settings.currency
        },
        {
          header: "Potential updside",
          subtitle:
            "Potential upside if the price of all your assets goes back up to its highest price in 52 weeks.",
          info: null,
          values: this.$store.getters.holdAssets.map(
            asset => new Asset(asset).diffToYearlyHigh
          ),
          method: "sum",
          kpi: null,
          unit: this.$store.state.settings.currency
        }
      ]
    };
  },
  created: async function() {
    this.menuItems = this.dateSlices();
    this.activeMenuItem = this.menuItems.length > 1 ? 1 : 0;
    this.calculateKPIs();
  },
  mounted: function() {},
  watch: {
    activeMenuItem: function(newVal, oldVal) {
      this.calculateKPIs();
    }
  },
  computed: {
    dates: function() {
      const firstStat = Object.values(this.$store.state.stats)[0];
      return Object.keys(firstStat);
    },
    relevantInsights: function() {
      const thisYear = new Date().getFullYear();
      let relevantKPIs = this.kpis;
      const portfolioDays = Math.round(
        (new Date() - this.$store.getters.firstPortfolioDate) /
          (1000 * 60 * 60 * 24)
      );
      // filter out any KPI that has no value
      relevantKPIs = relevantKPIs.filter(item => {
        return item.kpi !== null;
      });
      // remove monthly KPI if the portfolio has less than one month of data
      if (portfolioDays < 30)
        relevantKPIs = relevantKPIs.filter(item => {
          return item.header !== "Monthly averages";
        });
      // remove tax KPI if tax is set to 0
      if (this.$store.state.settings.taxes === 0)
        relevantKPIs = relevantKPIs.filter(item => {
          return item.header !== "Taxes";
        });
      // show certain KPIs only in the current year
      let isHistoricKPI = item =>
        item.header !== "Missed Gain" &&
        item.header !== "Potential Upside" &&
        item.header !== "Today's change";
      if (thisYear.toString() !== this.menuItems[this.activeMenuItem])
        relevantKPIs = relevantKPIs.filter(item => {
          return isHistoricKPI(item);
        });
      return relevantKPIs;
    }
  },
  methods: {
    hideDetails(item) {
      //this.$router.push({ name: "assets" });
      this.$store.state.drawer = false;
    },
    dateSlices() {
      let slices = [];
      const thisYear = new Date().getFullYear();
      const firstPortfolioYear = this.$store.getters.firstPortfolioDate.getFullYear();
      // there will be maximum 3 menu entries to chose from
      if (firstPortfolioYear && firstPortfolioYear < thisYear)
        slices.push((thisYear - 1).toString());

      slices.push(thisYear.toString());

      if (firstPortfolioYear && firstPortfolioYear < thisYear)
        slices.push(firstPortfolioYear + " - " + thisYear);

      return slices;
    },
    getValues(kpi) {
      // if there are less values than dates for a KPI, return the entire array
      if (kpi.values && kpi.values.length === this.dates.length)
        return kpi.values.slice(this.timeframeStart, this.timeframeEnd);
      else return [];
    },
    calcLimits: function() {
      // assuming all stats are the same length pick the first one to calculate time spans
      const dates = this.dates;
      const thisYear = new Date().getFullYear();
      if (dates.length > 0) {
        let i = 0;
        switch (this.menuItems[this.activeMenuItem]) {
          case thisYear.toString():
            // keep this setting as a default in case there is no stats data for this timeframe
            this.timeframeStart = dates.length;
            this.timeframeEnd = dates.length;
            for (i; i < dates.length; i++) {
              // if date is bigger than first day of this year
              let date = new Date(dates[i]);
              if (date >= new Date(thisYear, 0, 1)) {
                this.timeframeStart = i;
                break;
              }
            }
            break;

          case (thisYear - 1).toString():
            var lastYear = parseInt(thisYear, 10) - 1;
            var firstDayLastYear = new Date(lastYear, 0, 1);
            var firstDayThisYear = new Date(thisYear, 0, 1);

            for (i; i < dates.length; i++) {
              // if date is bigger than first day of last year
              if (new Date(dates[i]) >= firstDayLastYear) {
                this.timeframeStart = i;
                break;
              }
            }
            for (i = this.timeframeStart; i < dates.length; i++) {
              this.timeframeEnd = i + 1;
              // if date is bigger than first day of last year
              if (new Date(dates[i]) >= firstDayThisYear) {
                this.timeframeEnd = i - 1;
                break;
              }
            }
            break;

          default:
            this.timeframeStart = 0;
            this.timeframeEnd = dates.length;
            break;
        }
      }
    },
    calculateKPIs: function() {
      this.calcLimits();
      this.kpis.forEach(item => {
        //item.kpi = this.methods[item.method](this.getValues(item));
        item.kpi = this.methods[item.method](item.values);
      });
    }
  }
};
</script>

<style scoped>
a {
  outline: none;
  text-decoration: none;
}
.posBottom {
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  z-index: 0;
}
.v-expansion-panel-content__wrap {
  padding: 0 16px 16px;
}
</style>