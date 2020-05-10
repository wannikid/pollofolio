<template>
  <v-expansion-panel ripple>
    <v-expansion-panel-header class="d-flex justify-space-between">
      <span>
        <v-icon class="pl-0 pr-3 black--text">mdi-new-box</v-icon>
        <span class="font-weight-medium">News</span>
      </span>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <div class="body-2 my-2">Narrow down news by selecting a date range.</div>
      <div class="text-center font-weight-medium d-flex justify-space-between mt-4 mb-2">
        <span>{{ this.asset.dates[this.range[0]] }}</span>
        <span>{{ this.data.dates[this.range[1]] }}</span>
      </div>
      <v-range-slider
        color="grey"
        v-model="range"
        :max="max"
        :min="min"
        hide-details
        class="align-center my-5 px-0"
      ></v-range-slider>
      <v-btn
        :loading="searching"
        block
        class="white--text"
        color="deep-purple accent-4"
        @click="getNews()"
      >Search News</v-btn>
      <v-list dense two-line v-if="asset.news.length > 0" class="mt-3">
        <template v-for="(item, idx) of asset.news">
          <v-list-item :key="idx" class="px-0">
            <v-list-item-content>
              <v-list-item-subtitle class="text-truncate overline">{{ item.datetime }}</v-list-item-subtitle>
              <v-list-item-subtitle
                v-text="item.headline"
                class="black--text body-2 font-weight-medium mb-2"
              ></v-list-item-subtitle>
              <div class="caption">{{ item.description }}</div>
            </v-list-item-content>
          </v-list-item>
          <v-divider v-if="idx + 1 < asset.news.length" :key="'div-' + idx"></v-divider>
        </template>
      </v-list>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import * as API from "./api";

export default {
  props: {
    data: Object,
    required: true
  },
  data() {
    return {
      asset: this.data,
      min: 0,
      max: this.data.dates.length - 1,
      range: [0, this.data.dates.length - 1],
      searching: false
    };
  },
  created: function() {},
  mounted: function() {},
  computed: {
    uniqueNews() {
      const headlines = this.asset.news.map(item => item.headline);
      const IDs = headlines.map((headline, i) => headlines.indexOf(headline));
      const uniqueIDs = [...new Set(IDs)];
      return uniqueIDs.map(id => this.asset.news[id]);
    }
  },
  watch: {},
  methods: {
    async getNews() {
      this.searching = true;
      const from = this.asset.dates[this.range[0]];
      const to = this.asset.dates[this.range[1]];
      await API.getNews(this.asset, from, to);
      this.searching = false;
    }
  }
};
</script>

<!-- Add "scoped" keyibute to limit CSS to this component only -->
<style scoped>
</style>
