import { withPluginApi } from 'discourse/lib/plugin-api';
import { createWidget, Widget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import TopicView from 'discourse/views/topic';



export default {
  name: "apply-osf",

  initialize() {

    var w = createWidget('projectmenu', {
      tagName: 'div',
      
      defaultState() {
        return {
          guid: null
        }
      },
      
      updateLinks(name) {
        console.log('IM UPDATING');
        this.state.guid = name
        
      },
      
      html(attrs, state) { 
        return h('div#project_header', {},
          h('ul.wrap', {},
            h('li#project_name', {}, `${state.guid}`),
            h('li#files', {}, "Files"),
            h('li#forum', {}, "Forum"),
            h('li#wiki', {}, "Wiki")
          )
        );
      }

    });
    
    console.log(w)
    window.my_widget = w
    TopicView.reopen({
      _osfTopicLoad: function() {
        const enteredAt = this.get('controller.enteredAt');
        console.log(this)
        window.__this = this
        console.log(enteredAt)
        if (enteredAt && (this.get('lastEnteredAt') !== enteredAt)) {
          console.log('osfTopicLoadfn calld and got inside conditional')
          var data_var = this.get('controller.model')
          w.updateLinks(data_var)
        }
      }.observes('controller.enteredAt')
    })
    
    withPluginApi('0.1', api => {
      api.decorateWidget('header:after', utils => {
        return utils.attach('projectmenu')
      })
    });
    
  }
};
