<template>
  <div>
    <v-sparkline
      class="posBottom pa-0"
      :value="values"
      :fill="true"
      :gradient="getChartFillColor()"
      :smooth="true"
      :height="height"
    ></v-sparkline>
    <v-sparkline
      class="posBottom pa-0"
      :value="values"
      :fill="false"
      :gradient="getChartLineColor()"
      :smooth="true"
      :line-width="1.0"
      :height="height"
    ></v-sparkline>
  </div>
</template>

<script>
export default {
  props: ["values", "height"],
  data() {
    return {};
  },
  created: function() {},
  mounted: function() {},
  computed: {},
  watch: {},
  methods: {
    getChartFillColor() {
      if (this.values[0] <= this.values[this.values.length - 1])
        // green gradient
        return ["rgba(0,200,0,0.4)", "rgba(173,216,230,0.2)"];
      // red gradient
      else return ["#ee9ca7", "#ffdde1"];
    },
    getChartLineColor() {
      if (this.values[0] <= this.values[this.values.length - 1])
        // green gradient
        return ["rgba(0,200,0,0.5)", "rgba(0,200,0,0.5)"];
      // red gradient
      else return ["red", "red"];
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.posBottom {
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  z-index: 0;
}
</style>
