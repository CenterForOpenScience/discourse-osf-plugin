import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: "apply-details",

  initialize() {
    console.log("initialize")
    withPluginApi('0.1', api => {
      api.decorateWidget('header:after', h => {
        return h.h('ul.menubar',
          {
            style: {
              height: "40px",
              backgroundColor: "#ddd"
            }
          },
          h.h('li.project_name', 'Project_Name'),
          h.h('li.files', 'Files'),
          h.h('li.forum', 'Forum')
        );
        //helper.connect(Ember.View.extend({
        //  tagName: 'div',
        //  classNames: ['project_bar'],
        //  template: Ember.HTMLBars.compile("<ul>{{#each navbuttons as |button|}}<li>{{button}}</li>{{/each}}</ul>")
        //}).create({
        //  navbuttons: [
        //    "Project Name",
        //    "Files",
        //    "Forum",
        //    "Wiki",
        //    "Analytics"
        //  ]
        //}))
      })
    });
  }
};
