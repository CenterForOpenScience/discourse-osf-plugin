import { withPluginApi } from 'discourse/lib/plugin-api';
import { createWidget, Widget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import TopicView from 'discourse/views/topic';



export default {
  name: "apply-osf",

  initialize() {

    createWidget('projectmenu', {
      tagName: 'div',
      
      defaultState() {
        return {
          guid: ''
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
    
    var menu_bar;
    
    withPluginApi('0.1', api => {
      api.decorateWidget('header:after', dh => {
        menu_bar = dh.attach('projectmenu');
        return menu_bar
      })
    });

    TopicView.reopen({
      osfUpdateProjectBar: function() {
      //_osfTopicLoad: function() {
      //  const enteredAt = this.get('controller.enteredAt');
      //  var topic = this.get('topic');
      //  var model
      //  menu_bar.sendWidgetAction('updateLinks', data_var);
      //  if (enteredAt && (this.get('lastEnteredAt') !== enteredAt)) {
      //    console.log('osfTopicLoadfn called and got inside conditional');
      //    var data_var = this.get('controller.model');
      //    menu_bar.sendWidgetAction('updateLinks', data_var);
      //  }
      

      
        const title = this.get('model.title')
        menu_bar.sendWidgetAction('updateLinks', title)
      
      //}.observes('model.title')
      }.observes('controller.enteredAt')
      
      
    })    
  
  }
};
