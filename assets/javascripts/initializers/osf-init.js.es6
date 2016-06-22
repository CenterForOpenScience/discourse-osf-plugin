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
        return h('div#project_header', 
          {},
          h('ul.wrap', 
            {},
            h('li#project_name', {}, `${state.guid}`),
            h('li#files', {}, "Files"),
            h('li#forum', {}, "Forum"),
            h('li#wiki', {}, "Wiki")
          )
        );
      }
    });
    
    TopicView.reopen({
      _osfTopicLoad: function() {
        const enteredAt = this.get('controller.enteredAt');
        if (enteredAt && (this.get('lastEnteredAt') !== enteredAt)) {
          w.updateLinks(this.get('controller.model'))
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
