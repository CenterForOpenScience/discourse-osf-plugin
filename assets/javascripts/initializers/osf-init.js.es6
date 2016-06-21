import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: "apply-details",

  initialize() {
    withPluginApi('0.1', api => {
      console.log(api)
      api.decorateWidget('site-header:after', (helper) => {
        return "<h1>HELLP</h1>"
      });
    });
  }
};
