<template>
  <v-navigation-drawer v-model="$store.state.showSettings" app :disable-resize-watcher="true">
    <v-list dense nav>
      <v-subheader>Options</v-subheader>
      <v-list-item link @click="exportData()" :disabled="$store.state.assets.length === 0">
        <v-list-item-content>
          <v-list-item-title class="primary--text">Save your portfolio</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link @click="uploader()">
        <input type="file" @change="importData($event)" class="d-none" ref="uploader">
        <v-list-item-content>
          <v-list-item-title class="primary--text">Restore your portfolio</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-subheader class="mb-5">Settings</v-subheader>

      <v-text-field
        outlined
        flat
        dense
        v-model="$store.state.settings.stopLossPct"
        type="number"
        step="1"
        min="0"
        max="99"
        label="Stop Loss warning at"
        maxlength="2"
        suffix="%"
      ></v-text-field>

      <!--<v-text-field
        outlined
        flat
        dense
        v-model.lazy="$store.state.settings.taxes"
        label="Capital gains tax rate"
        maxlength="2"
        type="number"
        step="1"
        min="0"
        max="99"
        suffix="%"
      ></v-text-field>-->
      <v-select
        v-model="$store.state.settings.currency"
        :items="$store.state.currencyList"
        label="Display currency"
        dense
        outlined
      ></v-select>

      <v-select
        v-model="$store.state.settings.benchmark._ticker"
        :items="benchmarksList"
        label="Benchmark Index"
        dense
        outlined
      ></v-select>

      <v-subheader>About</v-subheader>
    </v-list>

    <div class="caption px-4 mb-5">
      A not-so-serious prototype for tracking the performance of your stock
      portfolio.
      <a
        href="https://iexcloud.io"
      >Data provided by IEX Cloud</a>
      and
      <a href="https://finnhub.io/">Finnhub.io</a>
      <P/>
      <span class="font-weight-medium">
        Made by
        <a href="https://twitter.com/VanZelleb" target="_blank">VanZelleb</a>
      </span>
    </div>
  </v-navigation-drawer>
</template>

<script>
import Asset from "./asset.js";
import * as API from "./api";

export default {
  data() {
    return {
      benchmarksList: [
        { text: "S&P500", value: "SPY" },
        { text: "NASDAQ", value: "QQQ" },
        { text: "DOW JONES", value: "DIA" }
      ]
    };
  },
  watch: {
    "$store.state.settings.stopLossPct": function() {
      this.$store.commit(
        "setStopLossPct",
        this.$store.state.settings.stopLossPct
      );
    },
    "$store.state.settings.currency": function() {
      this.$store.commit("setCurrency", this.$store.state.settings.currency);
    },
    "$store.state.settings.taxes": function() {
      this.$store.dispatch("updateInsights");
    },
    "$store.state.settings.benchmark._ticker": async function() {
      await API.getChart(this.benchmark);
      this.$store.commit("setBenchmark", this.benchmark);
    }
  },
  computed: {
    benchmark() {
      return new Asset(this.$store.state.settings.benchmark);
    },
    assets() {
      return this.$store.state.assets.map(asset => new Asset(asset));
    }
  },
  methods: {
    close() {
      this.$store.state.showSettings = false;
    },
    exportData: function() {
      const rows = this.$store.state.assets.map(function(item) {
        item._timeseries = {};
        return JSON.stringify(item);
      });
      let string = rows.join("\r\n");
      var a = document.createElement("a");
      a.href = "data:text/plain," + encodeURIComponent(string);
      a.target = "_blank";
      a.download =
        "Portfolio" + new Date().toISOString().substring(0, 10) + ".txt";
      document.body.appendChild(a);
      a.click();
    },
    uploader: function() {
      this.$refs.uploader.click();
      this.close();
    },
    importData: function(ev) {
      let that = this;
      let promises = [];
      var file = ev.target.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = async function(event) {
          var fileContent = event.target.result;
          var allTextLines = fileContent.split(/\r\n|\n/);

          if (allTextLines.length >= 1) {
            that.$store.state.stats = {};
            that.$store.state.assets = [];
            allTextLines.forEach(function(line) {
              try {
                const json = JSON.parse(line);
                const asset = new Asset(json);
                if (asset.name) that.$store.commit("addAsset", asset);
              } catch (error) {
                alert("The data is not in the correct format");
              }
            });

            that.assets.forEach(asset => {
              promises.push(API.getCompanyInfo(asset));
              promises.push(API.getChart(asset));
              if (!asset.isSold()) promises.push(API.getQuote(asset));
            });

            if (promises.length > 0) {
              // wait for all assets to be updated
              await Promise.all(promises);
              that.$store.commit("setAssets", that.assets);
              that.$store.dispatch("updateInsights");
            }
          } else alert("The file is empty, my friend.");
        };
        reader.readAsText(file);
      } else alert("No file found.");

      this.close();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a {
  outline: none;
  text-decoration: none;
}
.brandFont {
  font-family: "Days One", sans-serif;
  font-size: 16pt;
}
</style>
