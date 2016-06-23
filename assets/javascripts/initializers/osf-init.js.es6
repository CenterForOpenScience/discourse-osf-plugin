import { withPluginApi } from 'discourse/lib/plugin-api';
import { createWidget, Widget } from 'discourse/widgets/widget';
import 'discourse/widgets/header' as Header;
import { h } from 'virtual-dom';
import TopicView from 'discourse/views/topic';



export default {
  name: "apply-osf",

  initialize() {

    function createStateObject() {
      var state = {};
      return {
        setState: function(state_value) {
          state = state_value;
        },
        getState: function() {
          return state;
        }
      }
    }

    const osf_pb_st = createStateObject()

    osf_pb_st.setState({
      title: ""
    })

    createWidget('projectmenu', {
      tagName: 'div',

      updateLinks(title) {
        return osf_pb_st.setState(function() {
          var current_state = osf_pb_st.getState();
          current_state.title = title;
          return current_state;
        });
      },
      
      html(attrs) {
        const base_osf_url = 'http://mechanysm.com';
        const base_disc_url = 'http://mechanysm.com';
        return h('div#project_header',
          h('ul.wrap', [
            h('li#project_name', {
              'data-osf-target': `${base_osf_url}/${osf_pb_st.getState().title}/`
            }, `${osf_pb_st.getState().title}`),
            h('li#files', "Files"),
            h('li#forum', "Forum"),
            h('li#wiki', "Wiki")
          ])
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
      

      
        var title = this.get('topic.title')
        console.log(title);
        menu_bar.updateLinks(title);
      
      //}.observes('model.title')
      }.observes('controller.enteredAt')
      
      
    })    
  
    
    //`
    //
    //  html(attrs, state) {
    //    const panels = [this.attach('header-buttons', attrs),
    //                    this.attach('header-icons', { hamburgerVisible: state.hamburgerVisible,
    //                                                  userVisible: state.userVisible,
    //                                                  searchVisible: state.searchVisible,
    //                                                  flagCount: attrs.flagCount })];

    //    if (state.searchVisible) {
    //      panels.push(this.attach('search-menu', { contextEnabled: state.contextEnabled }));
    //    } else if (state.hamburgerVisible) {
    //      panels.push(this.attach('hamburger-menu'));
    //    } else if (state.userVisible) {
    //      panels.push(this.attach('user-menu'));
    //    }

    //    const contents = [ this.attach('home-logo', { minimized: !!attrs.topic }),
    //                       h('div.panel.clearfix', panels) ];

    //    if (attrs.topic) {
    //      contents.push(this.attach('header-topic-info', attrs));
    //    }

    //    return h('div.wrap', h('div.contents.clearfix', contents));
    //  }
      
    //}
    //`
  }
};
