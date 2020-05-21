<template>
  <div class="pb-6">
    <v-toolbar flat light class="mb-5">
      <v-toolbar-title
        v-if="asset.name"
        class="text-truncate font-weight-black headline"
      >{{asset.name}}</v-toolbar-title>
      <v-toolbar-title v-else class="font-weight-black headline">New Asset</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn fab dark small @click="hideDetails()" color="grey darken-4">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-alert
      v-if="asset.error"
      icon="mdi-information-outline"
      prominent
      text
      type="info"
    >{{ asset.error }}</v-alert>
    <v-card flat v-if="asset.prices.length > 0" class="mx-4" style="height:105px">
      <Sparkline :values="asset.prices" height="95" :kpi="asset.totalChange"/>
    </v-card>
    <v-expansion-panels flat hover v-model="openPanel" tile accordion class="my-3">
      <router-view v-if="asset.prices.length > 1" name="news" :data="asset"></router-view>
      <router-view name="performance" :data="asset"></router-view>
      <router-view name="payouts" :data="asset"></router-view>
      <router-view name="form" :data="asset"></router-view>
    </v-expansion-panels>
    <v-card outlined v-if="asset.industry && asset.id" class="mx-4 mb-4">
      <v-card-subtitle class="blue--text">{{ asset.industry }}</v-card-subtitle>
      <v-card-text class="caption">{{ asset.description }}</v-card-text>
    </v-card>
    <v-btn block light text color="red" class v-if="asset.id" @click="removeAsset(asset.id)">Delete</v-btn>
  </div>
</template>

<script>
//import Asset from "./asset.js";
import Sparkline from "./Sparkline";
//import * as API from "./api";

export default {
  components: {
    Sparkline
  },
  props: {
    //idx: Number,
    data: Object,
    required: true
  },
  data() {
    return {
      //asset: new Asset(this.$store.state.assets[this.idx]),
      asset: this.data,
      panel: null
    };
  },
  created: function() {},
  mounted: function() {},
  watch: {},
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
    hideDetails(item) {
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
</style>
