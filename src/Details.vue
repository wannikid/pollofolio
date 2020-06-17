<template>
  <v-stepper v-model="activeStep" v-if="onboarding">
    <v-stepper-header>
      <v-stepper-step color="deep-purple accent-2" :complete="activeStep > 1" step="1"></v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step
        color="deep-purple accent-2"
        :rules="[() => !asset.error]"
        :complete="activeStep > 2"
        step="2"
      ></v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step color="deep-purple accent-2" :complete="activeStep > 3" step="3"></v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step color="deep-purple accent-2" :complete="activeStep > 4" step="4"></v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step color="deep-purple accent-2" step="5"></v-stepper-step>
    </v-stepper-header>
    <v-stepper-items>
      <v-stepper-content step="1">
        <v-card flat color="transparent">
          <v-card-title>Heads up</v-card-title>
          <v-card-text class="black--text">
            <p>
              Data you enter in this app is stored
              <u>ONLY</u> on your device, so make sure you back it
              up once in a while.
            </p>
            <p>
              The statistics might deviate (a bit) from the real
              valuation of your portfolio as prices are updated only once a day.
            </p>The app might change or stop working at any time
            and gives no financial advise.
          </v-card-text>
        </v-card>
        <div class="mt-6">
          <v-btn
            color="deep-purple accent-2"
            class="white--text"
            @click="next(); $store.commit('confirmTerms')"
          >OK, whatever</v-btn>
          <v-btn text @click="hideDetails()">Cancel</v-btn>
        </div>
      </v-stepper-content>

      <v-stepper-content step="2">
        <v-card flat color="transparent">
          <v-card-title>Identify the asset</v-card-title>
          <v-card-text>
            <v-text-field
              autofocus
              outlined
              label="Ticker/Symbol"
              v-model="asset.ticker"
              maxlength="10"
              @change="check()"
              :error-messages="asset.error"
              hide-details
              @click:append="check()"
              :append-icon="'mdi-magnify'"
            ></v-text-field>
          </v-card-text>
          <v-card-subtitle v-if="asset.ticker && asset.name">
            <v-alert text color="teal" border="left" type="success">{{ asset.name }}</v-alert>
          </v-card-subtitle>
          <v-card-subtitle v-if="asset.ticker && asset.error">
            <v-alert text border="left" type="error">{{ asset.error }}</v-alert>
          </v-card-subtitle>
          <v-card-text
            class="black--text"
          >Every asset on the stock market has a unique ticker symbol. Need help finding it?</v-card-text>
          <v-card-actions>
            <v-btn
              text
              color="deep-purple accent-2"
              target="_blank"
              href="https://finance.yahoo.com"
            >
              <v-icon left>mdi-open-in-new</v-icon>Search in new tab
            </v-btn>
          </v-card-actions>
        </v-card>
        <div class="mt-6">
          <v-btn
            class="white--text"
            :disabled="!asset.name"
            :loading="loading"
            color="deep-purple accent-2"
            @click="next()"
          >Next</v-btn>
          <v-btn text @click="hideDetails()">Cancel</v-btn>
        </div>
      </v-stepper-content>

      <v-stepper-content step="3">
        <v-card outlined color="transparent">
          <v-card-title>Purchase details</v-card-title>
          <v-card-text
            class="black--text"
          >To calculate the change over time, we need to know when you bought the asset and how much you invested.</v-card-text>
          <v-card-subtitle>
            <v-date-picker
              outlined
              label="Purchase date"
              :full-width="true"
              :show-current="false"
              no-title
              v-model="asset.dateBuy"
              :allowed-dates="allowedDates"
              @change="getBuyPrice()"
            ></v-date-picker>
          </v-card-subtitle>
          <v-card-subtitle>
            <v-text-field
              :error="!asset.buyValue"
              outlined
              label="Invested value"
              v-model.number="asset.buyValue"
              type="number"
              maxlength="10"
              min="0"
              :suffix="$store.state.settings.currency"
              hide-details
            ></v-text-field>
          </v-card-subtitle>
        </v-card>
        <div class="mt-6">
          <v-btn
            class="white--text"
            color="deep-purple accent-2"
            @click="next()"
            :disabled="!asset.dateBuy || !asset.buyValue"
          >Next</v-btn>
          <v-btn text @click="hideDetails()">Cancel</v-btn>
        </div>
      </v-stepper-content>

      <v-stepper-content step="4">
        <v-card outlined color="transparent">
          <v-card-title>Asset details</v-card-title>
          <v-card-text
            class="black--text"
          >Tell us how many assets you purchased and for what price. We prefilled the the asset price for you with information from the purchase date.</v-card-text>
          <v-card-subtitle>
            <v-row>
              <v-col class="py-0">
                <v-text-field
                  :error="!asset.amount"
                  outlined
                  label="No. of assets"
                  v-model.number="asset.amount"
                  type="number"
                  pattern="\d+(\.\d{2})?"
                  maxlength="10"
                  min="0"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col class="py-0">
                <v-text-field
                  :error="!asset.buyPrice"
                  outlined
                  label="Asset price"
                  v-model.number="asset.buyPrice"
                  type="number"
                  pattern="\d+(\.\d{2})?"
                  maxlength="10"
                  min="0"
                  :suffix="asset.currency"
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-subtitle>
        </v-card>
        <div class="mt-6">
          <v-btn
            class="white--text"
            color="deep-purple accent-2"
            @click="next()"
            :disabled="!asset.buyPrice || !asset.amount"
          >Next</v-btn>
          <v-btn text @click="hideDetails()">Cancel</v-btn>
        </div>
      </v-stepper-content>

      <v-stepper-content step="5">
        <v-card outlined color="transparent">
          <v-card-title>Sell details</v-card-title>
          <v-card-text
            class="black--text"
          >If you sold your assets already, please specify when and for how much you sold them. Otherwise just continue to save.</v-card-text>
          <v-card-subtitle>
            <v-date-picker
              outlined
              label="Sell date"
              :full-width="true"
              :show-current="false"
              no-title
              v-model="asset.dateSell"
              :allowed-dates="allowedDates"
            ></v-date-picker>
          </v-card-subtitle>
          <v-card-subtitle>
            <v-text-field
              outlined
              label="Sell value"
              v-model.number="asset.sellValue"
              type="number"
              maxlength="10"
              min="0"
              :suffix="$store.state.settings.currency"
              hide-details
            ></v-text-field>
          </v-card-subtitle>
        </v-card>
        <div class="mt-6">
          <v-btn
            :loading="loading"
            class="white--text"
            color="deep-purple accent-2"
            @click="save()"
          >Save</v-btn>
          <v-btn text @click="hideDetails()">Cancel</v-btn>
        </div>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>

  <div v-else>
    <v-toolbar dense flat light>
      <v-btn icon @click="hideDetails()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        v-if="asset.id"
        @click="sync()"
        outlined
        small
        :loading="loading"
        text
        color="deep-purple accent-2"
      >Update</v-btn>
    </v-toolbar>
    <v-alert
      v-if="asset.error"
      icon="mdi-information-outline"
      prominent
      text
      type="info"
    >{{ asset.error }}</v-alert>
    <v-card flat v-if="asset.id && asset.prices.length > 0" class="mx-2 mt-2" style="height:105px">
      <Sparkline :values="asset.prices" height="95" :kpi="asset.totalChange"/>
    </v-card>
    <v-expansion-panels flat hover v-model="openPanel" tile accordion class="my-3">
      <router-view name="info" :data="asset"></router-view>
      <router-view v-if="asset.prices.length > 1" name="news" :data="asset"></router-view>
      <router-view name="performance" :data="asset"></router-view>
      <router-view name="payouts" :data="asset"></router-view>
      <router-view name="form" :data="asset"></router-view>
    </v-expansion-panels>
    <v-btn
      block
      light
      text
      color="red"
      class="my-5"
      v-if="asset.id"
      @click="removeAsset(asset.id)"
    >Delete</v-btn>
  </div>
</template>

<script>
import Sparkline from "./Sparkline";
import * as API from "./api/api";

export default {
  components: {
    Sparkline
  },
  props: {
    data: Object
  },
  data() {
    return {
      asset: this.data,
      panel: null,
      activeStep: 1,
      loading: false
    };
  },
  created: function() {
    if (this.$store.state.settings.termsConfirmed) this.activeStep = 2;
  },
  mounted: function() {},
  watch: {
    "asset.ticker": function() {
      // reset the error message and the name every time the ticker changes
      this.asset.error = null;
      this.asset.name = null;
    }
  },
  computed: {
    onboarding() {
      return !this.asset.id;
    },
    openPanel: {
      // getter
      get: function() {
        return this.$route.name === "add" ? 0 : this.panel;
      },
      // setter
      set: function(value) {
        this.panel = value;
      }
    }
  },
  methods: {
    allowedDates(val) {
      let date = new Date(val);
      // only show dates that are bigger/equal than the buy date
      if (this.asset._dateBuy && date <= this.asset._dateBuy) return false;
      return ![0, 6].includes(date.getDay()) && date <= new Date();
    },
    async sync() {
      this.loading = true;
      await API.requestHandler("quote", { asset: this.asset });
      await API.requestHandler("signal", { asset: this.asset });
      await API.requestHandler("target", { asset: this.asset });
      this.$store.commit("updateAsset", this.asset);
      this.loading = false;
    },
    stepBack() {
      this.activeStep--;
    },
    next() {
      this.activeStep++;
    },
    async getBuyPrice() {
      this.loading = true;
      this.asset.error = await API.requestHandler("history", {
        asset: this.asset
      });
      this.loading = false;
    },
    save: async function() {
      this.loading = true;
      // get some additional data on the asset
      await API.requestHandler("signal", { asset: this.asset });
      await API.requestHandler("target", { asset: this.asset });
      this.asset.error = await API.requestHandler("quote", {
        asset: this.asset
      });
      this.$store.commit("addAsset", this.asset);
      this.$store.dispatch("updateInsights");
      this.loading = false;
      this.hideDetails();
    },
    async check() {
      this.loading = true;
      this.asset.error = await API.requestHandler("company", {
        asset: this.asset
      });
      // update the buy price if there is already a buy date
      if (this.asset.dateBuy) this.asset.error = await this.getBuyPrice();
      this.loading = false;
    },
    hideDetails() {
      this.$router.push({ name: "assets" });
    },
    removeAsset(id) {
      if (confirm("Are you sure you want delete it?")) {
        //delete this.$store.state.assets[id];
        this.$store.state.assets = this.$store.state.assets.filter(
          item => item._id !== id
        );
        this.$store.commit("setAssets", this.$store.state.assets);
        this.hideDetails();
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.theme--light.v-expansion-panels .v-expansion-panel {
  background-color: transparent;
}

.theme--light.v-stepper {
  background: transparent;
}
</style>
