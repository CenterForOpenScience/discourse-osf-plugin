// jshint esversion: 6

import { withPluginApi } from 'discourse/lib/plugin-api';
import { createWidget, Widget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import ShareButton from 'discourse/views/share-button';
import PostMenu from 'discourse/widgets/post-menu';
import MountWidget from 'discourse/components/mount-widget';

export default {
    name: "apply-osf",
    initialize() {
        createWidget('osf-project-menu', {
            tagName: 'div',

            html(attrs) {
                const base_osf_url = Discourse.SiteSettings.osf_domain;
                const base_disc_url = window.location.origin;

                var title = '';
                var guid = '';
                var parent_guid = '';

                var route = this.container.lookup('controller:Application').currentPath;

                if (route.startsWith('topic')) {
                    var topicModel = this.container.lookup('controller:topic').model;
                    if (topicModel.parent_names) {
                        title = topicModel.parent_names[0];
                        guid = topicModel.parent_guids[0];
                        parent_guid = topicModel.parent_guids[1];
                    }
                } else if (route.startsWith('projects.')) {
                    var projectTopicList = this.container.lookup('controller:projects.show').list.topic_list;
                    title = projectTopicList.parent_names[0];
                    guid = projectTopicList.parent_guids[0];
                    parent_guid = projectTopicList.parent_guids[1];
                } else {
                    return '';
                }

                return h('div#project-header',
                    h('ul', [
                        h('li.header-offset'),
                        parent_guid ? h('li',
                            h('a.project-parent', {
                                'href': `${base_osf_url}/${parent_guid}/`
                            }, h('i.fa.fa-level-down.fa-rotate-180'))
                        ) : null,
                        h('li',
                            h('a.project-name', {
                                'href': `${base_osf_url}/${guid}/`
                            }, `${title}`)
                        ),
                        h('li',
                            h('a', {
                                'href': `${base_osf_url}/${guid}/files`
                            }, "Files")
                        ),
                        h('li',
                            h('a.project-forum', {
                                'href': `${base_disc_url}/forum/${guid}`
                            }, "Forum")
                        ),
                        h('li',
                            h('a', {
                                'href': `${base_osf_url}/${guid}/wiki`
                            }, "Wiki")
                        ),
                        h('li',
                            h('a', {
                                'href': `${base_osf_url}/${guid}/analytics`
                            }, "Analytics")
                        ),
                        h('li',
                            h('a', {
                                'href': `${base_osf_url}/${guid}/registrations`
                            }, "Registrations")
                        ),
                        h('li',
                            h('a', {
                                'href': `${base_osf_url}/${guid}/forks`
                            }, "Forks")
                        ),
                        h('li',
                            h('a', {
                                'href': `${base_osf_url}/${guid}/contributors`
                            }, "Contributors")
                        ),
                        h('li',
                            h('a', {
                                'href': `${base_osf_url}/${guid}/settings`
                            }, "Settings")
                        )
                    ])
                );
            }
        });

        var projectHeader;
        var api;
        withPluginApi('0.1', _api => {
            api = _api;
            api.decorateWidget('header:after', header => {
                projectHeader = header.attach('osf-project-menu');
                return projectHeader;
            });
            api.onPageChange((url, title) => {
                projectHeader.scheduleRerender();

                if (url.startsWith('/t') || url.startsWith('/forum')) {
                    $('#main-outlet').addClass('has-osf-bar');
                } else {
                    $('#main-outlet').removeClass('has-osf-bar');
                }
            });
        });

        MountWidget.reopen({
            afterRender() {
                var topicModel = this.container.lookup('controller:topic').model;
                if (!topicModel) {
                    return;
                }
                if (topicModel.project_is_public) {
                    $('button.share').removeClass('private');
                } else {
                    $('button.share').addClass('private');
                }
            }
        });
    }
};
