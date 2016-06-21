import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: "apply-details",

  initialize() {
    console.log("initialize")
    withPluginApi('0.1', api => {
      api.decorateWidget('header:after', () => {
        console.log('hello');
        return "<div style='height: 10px; background-color: #222'></div>";
      })
    });
  }
};
