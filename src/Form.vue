<template>
  <v-expansion-panel ripple>
    <v-expansion-panel-header v-if="asset.id" class="d-flex justify-start">
      <span class="font-weight-medium">
        <v-icon class="pl-0 pr-3 black--text">mdi-pencil</v-icon>Edit
      </span>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <v-form class="mt-4" v-model="valid" ref="assetForm">
        <v-row>
          <v-col cols="6" class="py-0">
            <v-dialog v-model="buyModal" width="290px">
              <template v-slot:activator="{ on }">
                <v-text-field
                  dense
                  outlined
                  persistent-hint
                  hint="Purchase date"
                  type="date"
                  :rules="[rules.dateBuyRequired, rules.sellAfterBuy, rules.noFutureDate]"
                  :value="asset.dateBuy"
                  readonly
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                no-title
                v-model="asset.dateBuy"
                :allowed-dates="allowedDates"
                @input="buyModal = false;"
                @change="getBuyPrice()"
              ></v-date-picker>
            </v-dialog>
          </v-col>
          <v-col class="py-0">
            <v-text-field
              dense
              outlined
              persistent-hint
              v-model.number="asset.buyPrice"
              hint="Price per share"
              type="number"
              pattern="\d+(\.\d{2})?"
              maxlength="10"
              min="0"
              :prefix="asset.currency"
              :rules="[rules.buyPriceRequired]"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col class="py-0">
            <v-text-field
              dense
              outlined
              persistent-hint
              v-model.number="asset.amount"
              hint="No. of shares"
              type="number"
              pattern="\d+(\.\d{2})?"
              maxlength="10"
              min="0"
              :rules="[rules.quantityRequired]"
            ></v-text-field>
          </v-col>
          <v-col class="py-0">
            <v-text-field
              dense
              outlined
              persistent-hint
              v-model.number="asset.buyValue"
              placeholder=" "
              type="number"
              maxlength="10"
              min="0"
              hint="Invested value"
              :prefix="$store.state.settings.currency"
              :rules="[rules.totalBuyRequired]"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row v-if="soldSwitch || asset.isSold()">
          <v-col cols="6" class="py-0">
            <v-dialog v-model="sellModal" width="290px">
              <v-date-picker
                no-title
                v-model="asset.dateSell"
                :allowed-dates="allowedDates"
                @input="sellModal = false;"
              ></v-date-picker>
            </v-dialog>
            <v-text-field
              dense
              outlined
              persistent-hint
              readonly
              v-model="asset.dateSell"
              type="date"
              @click="sellModal=true"
              :rules="[rules.dateSellRequired, rules.sellAfterBuy, rules.noFutureDate]"
              placeholder
              hint="Sell date"
            ></v-text-field>
          </v-col>
          <v-col class="py-0">
            <v-text-field
              dense
              outlined
              persistent-hint
              v-model.number="asset.sellValue"
              hint="Sell value"
              placeholder=" "
              type="number"
              maxlength="10"
              min="0"
              :prefix="$store.state.settings.currency"
              :rules="[rules.totalSellRequired]"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row v-if="!asset.isSold()">
          <v-col class="py-0">
            <v-switch inset dense v-model="soldSwitch" label="I sold it"></v-switch>
          </v-col>
        </v-row>
      </v-form>

      <v-btn
        rounded
        :loading="loading"
        class="mt-3 white--text"
        color="deep-purple accent-4"
        block
        :disabled="disableSaving"
        @click="save();"
      >Save</v-btn>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import * as API from "./api/api";

export default {
  props: {
    data: Object,
    required: true
  },
  data() {
    return {
      asset: this.data,
      loading: false,
      valid: true,
      buyModal: false,
      sellModal: false,
      soldSwitch: false,
      hasChanged: false,
      rules: {
        nameRequired: value => !!value || "Name required",
        quantityRequired: value => !!value || "No. of shares",
        dateBuyRequired: value => !!value || "Ourchase date",
        buyPriceRequired: value => !!value || "Price per share",
        totalBuyRequired: value => !!value || "Invested value",
        totalSellRequired: value => !!value || !this.soldSwitch || "Sell value",
        dateSellRequired: value => !!value || !this.soldSwitch || "Sell date",
        sellAfterBuy: () =>
          !this.asset._dateSell ||
          this.asset._dateBuy < this.asset._dateSell ||
          "Sell date must be after purchase date.",
        noFutureDate: value =>
          new Date(value) <= new Date() || "Date cannot be in the future."
      }
    };
  },
  created: function() {
    if (this.asset.isSold()) this.soldSwitch = true;
  },
  mounted: function() {},
  computed: {
    disableSaving() {
      return (
        !!this.asset.id &&
        (!this.$store.state.settings.termsConfirmed ||
          !this.valid ||
          !this.hasChanged)
      );
    }
  },
  watch: {
    soldSwitch: function() {
      if (this.soldSwitch === false) {
        this.asset._dateSell = null;
        this.asset._totalSell = null;
      }
    },
    asset: {
      deep: true,
      handler(oldVal, newVal) {
        this.hasChanged = true;
        this.$store.state.bannerText = newVal.error ? newVal.error : "";
      }
    }
  },
  methods: {
    validateForm() {
      this.$refs.assetForm.validate();
    },
    confirm() {
      this.$store.commit("confirmTerms");
    },
    allowedDates(val) {
      //if (this.asset.dates.length > 0)
      //return this.asset.timeseries.hasOwnProperty(val) ? true : false;
      // exclude weekends
      let date = new Date(val);
      return ![0, 6].includes(date.getDay()) && date <= new Date();
    },
    trim(asset) {
      let trimmedTimeseries = {};
      let start = 0;
      let end = 0;
      if (asset.isSold()) end = asset.dates.indexOf(asset.dateSell) + 1;
      else end = asset.dates.length - 1;
      const trimmedDates = asset.dates.slice(start, end);
      for (let date of trimmedDates) {
        trimmedTimeseries[date] = asset.timeseries[date];
      }
      asset.timeseries = trimmedTimeseries;
    },
    save: async function() {
      //this.validateForm();
      if (this.valid) {
        this.loading = true;
        // get some additional data on the asset
        await API.requestHandler("signal", { asset: this.asset });
        await API.requestHandler("target", { asset: this.asset });
        this.asset.error = await API.requestHandler("quote", {
          asset: this.asset
        });
        // trim the timeseries of prices from buy to sell/current date
        //this.trim(this.asset);
        if (!this.asset.id) this.$store.commit("addAsset", this.asset);
        else this.$store.commit("updateAsset", this.asset);
        this.hasChanged = false;
        this.loading = false;
        this.$store.state.drawer = false;
      }
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
.banner {
  background-color: #EDE7F6;
}
.bold {
  font-weight: bold;
}
</style>
