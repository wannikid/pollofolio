import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import App from "./App";
import store from "./store.js";
import router from "./router.js";

Vue.use(Vuetify);
Vue.config.productionTip = true;

Vue.filter("toLocaleNumber", function(value, digits) {
  if (isNaN(parseFloat(value))) {
    return value;
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
});

new Vue({
  store: store,
  router: router,
  vuetify: new Vuetify(),
  render: h => h(App)
}).$mount(`#app`);
