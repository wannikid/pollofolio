<template>
  <div>
    <v-toolbar dense flat light>
      <v-btn small icon @click="hideDetails()">
        <v-icon color="black">mdi-arrow-left-circle</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        v-if="!asset.id"
        color="black"
        class="white--text"
        small
        :disabled="disabled"
        @click="next()"
      >Next</v-btn>
      <v-btn v-else @click="sync()" small outlined :loading="loading">Update</v-btn>
    </v-toolbar>
    <v-overlay :absolute="true" :value="loading">
      <v-row class="fill-height" align-content="center" justify="center">
        <v-col class="subtitle-1 text-center" cols="12">Getting your data</v-col>
        <v-col cols="10">
          <v-progress-linear color="white" indeterminate rounded height="6"></v-progress-linear>
        </v-col>
      </v-row>
    </v-overlay>
    <v-container v-if="onboarding" class="pa-0">
      <v-stepper v-model="activeStep">
        <v-stepper-items>
          <v-stepper-content step="1">
            <v-card class="ma-1">
              <v-card-title>Heads up</v-card-title>
              <v-card-text class="black--text">
                <p>
                  Data you enter here never leaves your device, so make sure you back it
                  up once in a while.
                </p>
                <p>
                  The statistics might deviate (a bit) from the real
                  valuation of your portfolio as prices are updated only once a day.
                </p>The app might change or stop working at any time
                and gives no financial advise.
              </v-card-text>
              <v-card-actions>
                <v-btn
                  small
                  text
                  color="deep-purple accent-2"
                  @click="hideDetails(); $store.state.showSettings = !$store.state.showSettings"
                >Change currency</v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-card outlined>
              <v-card-title>Identify the asset</v-card-title>
              <v-alert
                v-if="asset.ticker && asset.name"
                prominent
                text
                color="teal"
                type="success"
                class="mx-4"
              >{{ asset.name }}</v-alert>
              <v-alert
                v-if="asset.ticker && asset.error"
                text
                prominent
                type="error"
                class="mx-4"
              >{{ asset.error }}</v-alert>
              <v-card-text>
                <v-text-field
                  dense
                  autofocus
                  outlined
                  label="Ticker/Symbol"
                  v-model="asset.ticker"
                  maxlength="10"
                  @change="check()"
                  :error-messages="asset.error"
                  hide-details
                  append-outer-icon="mdi-magnify"
                  @click:append-outer="asset.name ? next() : check()"
                ></v-text-field>
              </v-card-text>

              <v-card-text
                class="black--text"
              >Every asset on the stock market has a unique ticker symbol. Need help finding it?</v-card-text>
              <v-card-actions>
                <v-btn
                  text
                  small
                  color="deep-purple accent-2"
                  target="_blank"
                  href="https://finance.yahoo.com"
                >Open search</v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>

          <v-stepper-content step="3">
            <v-card outlined>
              <v-card-title>Purchase details</v-card-title>
              <v-card-text
                class="black--text"
              >To calculate the change over time, we need to know when you bought the asset and how much you invested.</v-card-text>
              <v-card-subtitle>
                <v-date-picker
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
                <v-row>
                  <v-col class="pt-0">
                    <v-text-field
                      dense
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
                  <v-col class="pt-0">
                    <v-text-field
                      dense
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
                <v-row>
                  <v-col class="pb-0">
                    <v-text-field
                      dense
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
                  </v-col>
                </v-row>
              </v-card-subtitle>
            </v-card>
          </v-stepper-content>

          <v-stepper-content step="4">
            <v-card outlined>
              <v-card-title>Sell details</v-card-title>
              <v-card-text class="black--text">
                <b>If you still own the asset just click next.</b> Otherwise, please specify when and for how much you sold them.
              </v-card-text>
              <v-card-subtitle>
                <v-date-picker
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
                  dense
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
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-container>

    <div v-else>
      <v-alert
        v-if="asset.error"
        icon="mdi-information-outline"
        prominent
        text
        type="error"
      >{{ asset.error }}</v-alert>
      <v-card
        flat
        v-if="asset.id && asset.prices.length > 0"
        class="mx-2 mt-2"
        style="height:105px"
      >
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
    disabled() {
      if (this.activeStep === 2) return !this.asset.name;
      if (this.activeStep === 3)
        return (
          !this.asset.dateBuy || !this.asset.amount || !this.asset.buyValue
        );
    },
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
      if (
        this.asset._dateBuy &&
        this.asset.buyValue &&
        date <= this.asset._dateBuy
      )
        return false;
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
      if (this.activeStep === 1) this.$store.commit("confirmTerms");
      if (this.activeStep === 4) this.save();
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

.v-stepper,
.v-stepper__header {
  box-shadow: none;
}

.v-stepper__content {
  padding: 8px 8px 0px;
}
</style>
