import { withPluginApi } from 'discourse/lib/plugin-api';
import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';



export default {
  name: "apply-osf",

  initialize() {
    
    createWidget('projectmenu', {
      tagName: 'div',

      html(attrs) { 
        return h('div', {
          style: {
            height: '44px',
            backgroundColor: '#eee',
            boxShadow: '0 0 9px -1px #838383'
          }
        },
          h('ul', {
            style: {
              width: '940px',
              margin: '0 auto'
            }
          }, [
            h('li#project_name', "Project Name"),
            h('li#files', "Files"),
            h('li#forum', "Forum"),
            h('li#wiki', "Wiki")
          ])
        );
      },
    });
    
    console.log("initialize")
    withPluginApi('0.1', api => {
      api.decorateWidget('header:after', utils => {
        return utils.attach('projectmenu')
      })
    });
  }
};

        //return h.h('ul.menubar',
        //  {
        //    style: {
        //      height: "40px",
        //      backgroundColor: "#ddd",
        //      margin: "0 0 0 0"
        //    }
        //    
        //  },
        //  h.h('li.project_name', 'Project_Name'),
        //  h.h('li.files', 'Files'),
        //  h.h('li.forum', 'Forum')
        //);
        
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
