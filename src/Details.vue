<template>
  <v-stepper v-model="activeStep" v-if="onboarding">
    <v-stepper-header>
      <v-stepper-step :complete="activeStep > 1" step="1"></v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :rules="[() => !asset.error]" :complete="activeStep > 2" step="2"></v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="activeStep > 3" step="3"></v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="activeStep > 4" step="4"></v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="activeStep > 5" step="5"></v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="6"></v-stepper-step>
    </v-stepper-header>
    <v-stepper-items>
      <v-stepper-content step="1">
        <v-card flat>
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
        <v-btn class="mt-4" color="primary" @click="next(); $store.commit('confirmTerms')">I got it</v-btn>
      </v-stepper-content>

      <v-stepper-content step="2">
        <v-card outlined>
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
            ></v-text-field>
          </v-card-text>
          <v-card-subtitle v-if="asset.name && !asset.error">
            <v-alert text color="teal" border="left" type="success">{{ asset.name }}</v-alert>
          </v-card-subtitle>
          <v-card-text
            class="black--text"
          >Every asset on the stock market has a unique ticker symbol. Need help finding it?</v-card-text>
          <v-card-actions>
            <v-btn text color="primary">
              <v-icon left>mdi-open-in-new</v-icon>
              <a
                target="_blank"
                href="https://www.marketwatch.com/tools/quotes/lookup.asp"
              >Search in new tab</a>
            </v-btn>
          </v-card-actions>
        </v-card>
        <div class="mt-6">
          <v-btn
            v-if="!asset.name || !asset.ticker"
            :disabled="!asset.ticker && !!asset.error"
            :loading="loading"
            color="primary"
            @click="check()"
          >Check</v-btn>
          <v-btn v-else color="primary" @click="next()">Next</v-btn>
          <v-btn text @click="stepBack()">Back</v-btn>
        </div>
      </v-stepper-content>

      <v-stepper-content step="3">
        <v-card outlined>
          <v-card-title>Provide details</v-card-title>
          <v-card-text
            class="black--text"
          >To know how much your asset has changed over time you need to provide some details about the transaction.</v-card-text>
          <v-card-subtitle>Purchase date:</v-card-subtitle>
          <v-card-subtitle>
            <v-date-picker
              flat
              :full-width="true"
              :show-current="false"
              no-title
              v-model="asset.dateBuy"
              :allowed-dates="allowedDates"
              @change="getBuyPrice()"
            ></v-date-picker>
          </v-card-subtitle>
        </v-card>
        <div class="mt-6">
          <v-btn color="primary" @click="next()" :disabled="!asset.dateBuy">Next</v-btn>
          <v-btn text @click="stepBack()">Back</v-btn>
        </div>
      </v-stepper-content>

      <v-stepper-content step="4">
        <v-card outlined>
          <v-card-title>Provide details</v-card-title>
          <v-card-text
            class="black--text"
          >To know how much your asset has changed over time you need to provide some details about the transaction.</v-card-text>
          <v-card-subtitle>Price per share:</v-card-subtitle>
          <v-card-subtitle>
            <v-text-field
              v-model.number="asset.buyPrice"
              type="number"
              pattern="\d+(\.\d{2})?"
              maxlength="10"
              min="0"
              :prefix="asset.currency"
            ></v-text-field>
          </v-card-subtitle>
        </v-card>
        <div class="mt-6">
          <v-btn color="primary" @click="next()" :disabled="!asset.buyPrice">Next</v-btn>
          <v-btn text @click="stepBack()">Back</v-btn>
        </div>
      </v-stepper-content>

      <v-stepper-content step="5">
        <v-card outlined>
          <v-card-title>Provide details</v-card-title>
          <v-card-text
            class="black--text"
          >To know how much your asset has changed over time you need to provide some details about the transaction.</v-card-text>
          <v-card-subtitle>No. of shares:
            <v-text-field
              v-model.number="asset.amount"
              type="number"
              pattern="\d+(\.\d{2})?"
              maxlength="10"
              min="0"
            ></v-text-field>
          </v-card-subtitle>
        </v-card>
        <div class="mt-6">
          <v-btn color="primary" @click="next()" :disabled="!asset.amount">Next</v-btn>
          <v-btn text @click="stepBack()">Back</v-btn>
        </div>
      </v-stepper-content>

      <v-stepper-content step="6">
        <v-card outlined>
          <v-card-title>Provide details</v-card-title>
          <v-card-text
            class="black--text"
          >To know how much your asset has changed over time you need to provide some details about the transaction.</v-card-text>
          <v-card-subtitle>Invested value:
            <v-text-field
              v-model.number="asset.buyValue"
              placeholder=" "
              type="number"
              maxlength="10"
              min="0"
              :prefix="$store.state.settings.currency"
            ></v-text-field>
          </v-card-subtitle>
        </v-card>
        <div>
          <v-btn color="primary" @click="next()" :disabled="!asset.buyValue">Next</v-btn>
          <v-btn text @click="stepBack()">Back</v-btn>
        </div>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>

  <div v-else>
    <v-toolbar dense flat light>
      <v-btn icon @click="hideDetails()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
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
      <router-view v-if="asset.prices.length > 1" name="news" :data="asset"></router-view>
      <router-view name="performance" :data="asset"></router-view>
      <router-view name="payouts" :data="asset"></router-view>
      <router-view name="form" :data="asset"></router-view>
    </v-expansion-panels>
    <v-card outlined v-if="asset.id && !openPanel" class="mx-2">
      <v-card-title>
        <template v-if="asset.name" class="text-truncate">{{asset.name}}</template>
      </v-card-title>
      <v-card-subtitle v-if="asset.industry" class="blue--text">{{ asset.industry }}</v-card-subtitle>
      <v-card-text v-if="asset.description" class="caption">{{ asset.description }}</v-card-text>
    </v-card>
    <v-btn
      block
      light
      text
      color="red"
      class="mt-4"
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
      onboarding: true,
      activeStep: 1,
      loading: false
    };
  },
  created: function() {
    if (this.asset.id) this.onboarding = false;
    if (this.$store.state.settings.termsConfirmed) this.activeStep = 2;
  },
  mounted: function() {},
  watch: {
    activeStep() {
      if (this.activeStep > 6) this.onboarding = false;
    }
  },
  computed: {
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
    allowedDates(val) {
      // exclude weekends
      let date = new Date(val);
      return ![0, 6].includes(date.getDay()) && date <= new Date();
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
      this.$store.state.drawer = false;
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
</style>
