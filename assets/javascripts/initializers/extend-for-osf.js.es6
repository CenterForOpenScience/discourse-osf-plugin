// jshint esversion: 6

import { withPluginApi } from 'discourse/lib/plugin-api';
import { createWidget, Widget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import ShareButton from 'discourse/views/share-button';
import PostMenu from 'discourse/widgets/post-menu';
import MountWidget from 'discourse/components/mount-widget';
import ComposerModel from 'discourse/models/composer';

export default {
    name: "extend-for-osf",
    initialize() {
        createWidget('osf-project-menu', {
            tagName: 'div',

            html(attrs) {
                var base_osf_url = Discourse.SiteSettings.osf_domain;
                if (base_osf_url.endsWith('/')) {
                    base_osf_url = base_osf_url.slice(0, -1);
                }

                var base_disc_url = window.location.origin;

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

        var replaceAvatarTooltips = function() {
            // We want to make all these image tags have tooltips with the name, not the username
            // The first selector for topic list pages, the second for topic pages
            var elems = document.querySelectorAll('.posters a img, a.reply-to-tab img');

            var usernamesToNames = {};

            var topicsModel = Discourse.__container__.lookup('controller:discovery.topics').model;
            if (topicsModel) {
                _.each(topicsModel.topic_list.topics, topic => {
                    _.each(topic.posters, poster => {
                        usernamesToNames[poster.user.username] = poster.user.name;
                    });
                });
            }

            var topicModel = Discourse.__container__.lookup('controller:topic').model;
            if (topicModel) {
                _.each(topicModel.get('postStream').posts, post => {
                    if (post.reply_to_user) {
                        usernamesToNames[post.reply_to_user.username] = post.reply_to_user.name;
                    }
                });
            }

            _.each(elems, elem => {
                var username = elem.title.split(' ')[0];
                if (usernamesToNames[username]) {
                    elem.title = elem.title.replace(username, usernamesToNames[username]);
                    // On the topic page, a span with the username also appears right afterward
                    // I'm guessing it is for accessability.
                    var sibling = elem.nextElementSibling;
                    if (sibling && sibling.textContent == username) {
                        sibling.textContent = usernamesToNames[username];
                    }
                }
            });

            // Finally for the current user in the site header
            var currentUser = Discourse.__container__.lookup('component:siteHeader').currentUser;
            var userAvatar = document.querySelector('#current-user img');
            if (currentUser && userAvatar) {
                userAvatar.title = userAvatar.title.replace(currentUser.username, currentUser.name);
            }
        };

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

                replaceAvatarTooltips();
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

                replaceAvatarTooltips();
            }
        });

        // Have the reply-to show the name and not the guid "username".
        ComposerModel.reopen({
            actionTitle: function() {
                var html = this._super();
                var post = this.get('post');
                if (post) {
                    // replace the username where it is not in a url.
                    html = html.replace(new RegExp('([^\/])' + post.username), '$1' + post.name);
                    if (post.reply_to_user) {
                        html = html.replace(new RegExp('([^\/])' + post.reply_to_user.username), '$1' + post.reply_to_user.name);
                    }
                }
                return html;
            }.property(),
        });
    }
};
