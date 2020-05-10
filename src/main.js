import Vue from "vue";
import VueRouter from "vue-router";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import App from "./App";
import store from "./store.js";
import Portfolio from "./Portfolio";
import Insights from "./Insights";
import Details from "./Details";
import Form from "./Form.vue";
import Payouts from "./Payouts";
import Performance from "./Performance";
import News from "./News";
//import Settings from "./Settings";

Vue.use(VueRouter);
Vue.use(Vuetify);
Vue.config.productionTip = true;

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "*",
      name: "assets",
      component: Portfolio,
      props: true
    },
    {
      path: "/assets",
      name: "details",
      components: {
        default: Portfolio,
        drawer: Details
      },
      children: [
        // will be rendered inside Details <router-view>
        {
          path: "/assets/:id",
          name: "show",
          components: {
            news: News,
            performance: Performance,
            payouts: Payouts,
            form: Form
          }
        },
        {
          path: "/assets/add",
          name: "add",
          components: {
            form: Form
          }
        }
      ],
      props: { default: true, drawer: true },
      beforeEnter: (to, from, next) => {
        store.state.drawer = true;
        next();
      }
    },
    {
      path: "/insights",
      name: "insights",
      components: {
        default: Portfolio,
        drawer: Insights
      },
      beforeEnter: (to, from, next) => {
        store.state.drawer = true;
        next();
      }
    } /*,
    {
      path: "/settings",
      name: "settings",
      components: {
        default: Portfolio,
        settings: Settings
      },
      beforeEnter: (to, from, next) => {
        store.state.menuBar = true;
        next();
      }
    }*/
  ],
  // This will simply make the page scroll to top for all route navigations.
  scrollBehavior() {
    return { x: 0, y: 0 };
  }
});

Vue.filter("toLocaleNumber", function(value, digits) {
  if (isNaN(parseFloat(value))) {
    return value;
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
});

/* eslint-disable no-new */
new Vue({
  store: store,
  router: router,
  vuetify: new Vuetify(),
  render: h => h(App)
}).$mount(`#app`);
