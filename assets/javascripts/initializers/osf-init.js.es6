import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: "apply-details",

  initialize() {
    console.log()
    withPluginApi('0.1', api => {
      console.log(api)
    });
  }
};
