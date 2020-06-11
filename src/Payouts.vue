<template>
  <v-expansion-panel ripple>
    <v-expansion-panel-header class="d-flex justify-space-between">
      <span>
        <v-icon class="pl-0 pr-3 black--text">mdi-cash-usd-outline</v-icon>
        <span class="font-weight-medium">Income</span>
      </span>
      <!--<span class="d-flex justify-end pr-3">
        <span class="align-self-center">{{ asset.income | toLocaleNumber(1) }}</span>
        <span class="caption">&nbsp;{{ $store.state.settings.currency }}</span>
      </span>-->
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <div
        class="body-2 my-2"
      >Some stocks pay out dividends on regular basis. This increases the Rate of Return.</div>
      <template v-if="asset.payouts.length > 0">
        <table width="100%" class="py-3 body-2">
          <tr>
            <th align="left" class="font-weight-medium">Date</th>
            <th align="right" class="font-weight-medium">{{$store.state.settings.currency}}</th>
            <th align="right" class="font-weight-medium">Yield</th>
            <th/>
          </tr>
          <tr v-for="date of payoutDates()" :key="key + date">
            <td width="30%">{{ date }}</td>
            <td width="30%" align="right">{{ asset._payouts[date].value | toLocaleNumber(2) }}</td>
            <td width="30%" align="right">{{ calcPayoutYield(date) | toLocaleNumber(1) }}%</td>
            <td width="10%" align="right">
              <v-btn icon small @click="setPayout(date)">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </td>
          </tr>
        </table>
      </template>
      <v-form v-model="valid" ref="payoutForm">
        <v-row>
          <v-col cols="6">
            <v-text-field
              dense
              outlined
              persistent-hint
              v-model="payoutDate"
              hint="Dividend date"
              type="date"
              readonly
              @click="dateModal=true"
              :rules="[rules.dateRequired]"
            ></v-text-field>
            <v-dialog v-model="dateModal">
              <v-date-picker
                light
                outlined
                v-model="payoutDate"
                :allowed-dates="allowedDates"
                @input="dateModal = false;"
              ></v-date-picker>
            </v-dialog>
          </v-col>
          <v-col cols="6">
            <v-text-field
              dense
              outlined
              persistent-hint
              v-model.number="payoutValue"
              hint="Net dividend"
              type="number"
              :prefix="$store.state.settings.currency"
              :append-icon="'mdi-delete-outline'"
              @click:append="deletePayout(payoutDate)"
              :rules="[rules.valueRequired]"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-form>
      <v-btn
        block
        class="white--text"
        color="deep-purple accent-4"
        @click="savePayout()"
        :disabled="disableSaving"
      >Add</v-btn>
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
      key: 0,
      dateModal: null,
      payoutDate: null,
      payoutValue: null,
      hasChanged: false,
      valid: true,
      rules: {
        dateRequired: value => !!value || "Name required.",
        valueRequired: value => !!value || "Amount required."
      }
    };
  },
  created: function() {},
  mounted: function() {},
  computed: {
    disableSaving() {
      return !this.valid || !this.hasChanged;
    }
  },
  watch: {
    payoutDate: {
      handler() {
        this.hasChanged = true;
      }
    },
    payoutValue: {
      handler() {
        this.hasChanged = true;
      }
    }
  },
  methods: {
    calcPayoutYield: function(date) {
      let priceIncrRatio = 0;
      // abstract away the fact that the timeseries can be in a different currency than the totalBuy value
      if (!isNaN(this.asset._timeseries[date]))
        priceIncrRatio = this.asset._timeseries[date] / this.asset.buyPrice;
      else return null;
      return (
        (this.asset._payouts[date].value /
          (priceIncrRatio * this.asset.buyValue)) *
        100
      );
    },
    payoutDates: function() {
      return Object.keys(this.asset._payouts).sort();
    },
    allowedDates: function(date) {
      if (new Date(date) >= this.asset._dateBuy) {
        if (!this.asset._dateSell)
          if (new Date(date) < new Date()) return true;
          else if (new Date(date) <= this.asset._dateSell) return true;
      } else return false;
    },
    deletePayout(date) {
      if (confirm("Sure?")) {
        //delete this.asset._payouts[date];
        // force re-render after asset prop changes
        this.$delete(this.asset._payouts, date);
        this.payoutDate = null;
        this.payoutValue = null;
        //this.$store.commit("updateAsset", this.asset);
        this.$store.dispatch("updateInsights", this.$store.state.assets);
      }
    },
    savePayout() {
      if (this.payoutDate && this.payoutValue) {
        // force re-render after asset prop changes
        this.$set(this.asset._payouts, this.payoutDate, {
          value: this.payoutValue
        });
        //this.$store.commit("updateAsset", this.asset);
        this.$store.dispatch("updateInsights", this.$store.state.assets);
        this.payoutDate = null;
        this.payoutValue = null;
      }
    },
    setPayout(date) {
      this.payoutDate = date;
      this.payoutValue = this.asset._payouts[date].value;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bold {
  font-weight: bold;
}
</style>
