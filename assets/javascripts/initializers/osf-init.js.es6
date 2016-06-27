import { withPluginApi } from 'discourse/lib/plugin-api';
import { createWidget, Widget } from 'discourse/widgets/widget';
//import 'discourse/widgets/header' as Header;
import { h } from 'virtual-dom';
import TopicView from 'discourse/views/topic';
import TopicRoute from 'discourse/routes/topic';



export default {
  name: "apply-osf",

  initialize() {

    function createStateObject() {
      var state = {};
      
      function setState(state_value) {
          state = state_value;
      };
      
      function getState() {
        return state;
      };
      
      return {
        setState: setState,
        getState: getState
      }
      
    }

    const osf_pb_st = createStateObject()

    osf_pb_st.setState({
      title: ""
    })

    createWidget('projectmenu', {
      tagName: 'div',

      updateLinks(title) {
        

      },
      
      html(attrs) {
        const base_osf_url = 'http://mechanysm.com';
        const base_disc_url = 'http://mechanysm.com';
        return h('div#project_header',
          h('ul.wrap', {
            onclick: function(e) {
              window.location.replace(e.target.dataset.osfTarget);
            }
          }, [
            h('li#project_name', {
              'data-osf-target': `${base_osf_url}/${osf_pb_st.getState().title}/`
            }, `${osf_pb_st.getState().title}`),
            h('li#files', {
              'data-osf-target': `${base_osf_url}/${osf_pb_st.getState().title}/files`
            }, "Files"),
            h('li#forum', {
              'data-osf-target': `${base_disc_url}/groups/${osf_pb_st.getState().title}`
            }, "Forum"),
            h('li#wiki', {
              'data-osf-target': `${base_disc_url}/${osf_pb_st.getState().title}/wiki`
            }, "Wiki"),
            h('li#analytics', {
              'data-osf-target': `${base_disc_url}/${osf_pb_st.getState().title}/analytics`
            }, "Analytics"),
            h('li#registrations', {
              'data-osf-target': `${base_disc_url}/${osf_pb_st.getState().title}/registrations`
            }, "Registrations"),
            h('li#forks', {
              'data-osf-target': `${base_disc_url}/${osf_pb_st.getState().title}/forks`
            }, "Forks"),
            h('li#contributors', {
              'data-osf-target': `${base_disc_url}/${osf_pb_st.getState().title}/contributors`
            }, "contributors"),
            h('li#settings', {
              'data-osf-target': `${base_disc_url}/${osf_pb_st.getState().title}/settings`
            }, "Settings")
          ])
        );
      }

    });
    
    var menu_bar;
    
    function updateProjectBar() {
      var title = this.currentModel.title
      console.log(title);
      var new_state = osf_pb_st.setState((function() {
        var current_state = osf_pb_st.getState();
        current_state.title = title;
        return current_state;
      })());
      console.log(menu_bar);
      menu_bar.scheduleRerender();
    }
    
    withPluginApi('0.1', api => {
      api.decorateWidget('header:after', dh => {
        menu_bar = dh.attach('projectmenu');
        return menu_bar;
      })
    });
    
    var _activate = TopicRoute.proto().activate;
    var _deactivate = TopicRoute.proto().deactivate;

    TopicRoute.reopen({
      activate: function() {
        console.log('creating project bar')
        _activate.bind(this)();

        //createProjectBar.bind(this)();
      },
      
      deactivate: function() {
        var ph = document.getElementById('project_header')
        _deactivate.bind(this)();
        ph.parentNode.remove(ph);
      },
      
      actions: {
        didTransition: function() {
          console.log('didTransition')
          this.controllerFor("topic")._showFooter();
          updateProjectBar.bind(this)()
          return true;
        }
      }
      //onTopicChange: function() {
      //  updateProjectBar();
      //}.on('didTransition')
    });
    
    //TopicView.reopen({
    //  osfUpdateProjectBar: updateProjectBar.observes('topic.title')
    //});
    
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
