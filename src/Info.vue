<template>
  <v-expansion-panel ripple>
    <v-expansion-panel-header class="d-flex justify-space-between">
      <span>
        <span class="title pr-3">🏦</span>
        <span class="blue--text font-weight-medium">{{asset.name}}</span>
      </span>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <div v-if="asset.industry" class="body-1 my-2">{{ asset.industry }}</div>
      <div v-if="asset.description" class="caption my-2">{{ asset.description }}</div>
      <div v-if="asset.address" class="overline my-2 grey--text text--darken-2">{{ asset.address }}</div>
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
      asset: this.data
    };
  },
  created: function() {},
  mounted: function() {},
  computed: {},
  watch: {},
  methods: {}
};
</script>

<!-- Add "scoped" keyibute to limit CSS to this component only -->
<style scoped>
</style>
