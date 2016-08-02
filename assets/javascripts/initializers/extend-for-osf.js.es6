// jshint esversion: 6

import { withPluginApi } from 'discourse/lib/plugin-api';
import { createWidget, Widget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import ShareButton from 'discourse/views/share-button';
import PostMenu from 'discourse/widgets/post-menu';
import MountWidget from 'discourse/components/mount-widget';
import ComposerModel from 'discourse/models/composer';
import ComposerController from 'discourse/controllers/composer';
import { wantsNewWindow } from 'discourse/lib/intercept-click';
import UserCardView from 'discourse/views/user-card';

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

        var replaceUsernames = function() {
            // We want to make all these image tags have tooltips with the name, not the username
            // We specify just the ones we want because we don't want to mess with the ones
            // that show up for the autocorrect, which should show both username and full name
            var avatarElems = document.querySelectorAll('#current-user img, .topic-avatar img, .reply-to img, .reply-to-tab img, .posters img, .topic-map img');

            var usernamesToNames = {};

            var currentUser = Discourse.__container__.lookup('component:siteHeader').currentUser;
            usernamesToNames[currentUser.username] = currentUser.name;

            var topicsModel = Discourse.__container__.lookup('controller:discovery.topics').model;
            if (topicsModel) {
                _.each(topicsModel.topic_list.topics, topic => {
                    _.each(topic.posters, poster => {
                        usernamesToNames[poster.user.username] = poster.user.name;
                    });
                });
                _.each(topicsModel.topic_list.contributors, contributor => {
                    usernamesToNames[contributor.username] = contributor.name;
                });
            }

            var topicModel = Discourse.__container__.lookup('controller:topic').model;
            if (topicModel) {
                _.each(topicModel.get('postStream').posts, post => {
                    usernamesToNames[post.username] = post.name;
                    if (post.reply_to_user) {
                        usernamesToNames[post.reply_to_user.username] = post.reply_to_user.name;
                    }
                });
                _.each(topicModel.contributors, contributor => {
                    usernamesToNames[contributor.username] = contributor.name;
                });
            }

            _.each(avatarElems, elem => {
                if (elem.title.length === 0) {
                    // For the composer, where the username text follows and is not in the title.
                    let sibling = elem.nextSibling;
                    if (sibling) {
                        let username = sibling.textContent.trim().split(' ')[0];
                        let name = usernamesToNames[username];
                        if (name) {
                            sibling.textContent = sibling.textContent.replace(username, name);
                        }
                    }
                } else {
                    let username = elem.title.split(' ')[0];
                    let name = usernamesToNames[username];
                    if (name) {
                        elem.title = elem.title.replace(username, name);
                        // On the topic page, a span with the username also appears right afterward
                        let sibling = elem.nextElementSibling;
                        if (sibling && sibling.textContent == username) {
                            sibling.textContent = name;
                        }
                    }
                }
            });

            // Show full names in @mentions
            _.each(document.querySelectorAll('a.mention, span.mention'), elem => {
                var username = elem.textContent.substr(1);
                var name = usernamesToNames[username];
                if (name) {
                    elem.textContent = '@' + name;
                }
            });
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

                replaceUsernames();
            });
        });

        // Because we modify @mentions to show full names, we also have to modify the click handler
        UserCardView.reopen({
            _setup: function() {
                this._super();

                const clickMention = 'click.discourse-user-mention';
                const expand = (username, $target) => {
                  const postId = $target.parents('article').data('post-id'),
                    user = this.get('controller').show(username, postId, $target[0]);
                  if (user !== undefined) {
                    user.then( () => this._willShow($target) ).catch( () => this._hide() );
                  } else {
                    this._hide();
                  }
                  return false;
                };

                // Replace the default mention click handler with one that
                // uses the href to find the username instead of the display text
                $('#main-outlet').unbind(clickMention);
                $('#main-outlet').on(clickMention, 'a.mention', (e) => {
                    if (wantsNewWindow(e)) { return; }

                    const $target = $(e.target);
                    const username = $target.attr('href').replace('/users/', '');
                    return expand(username, $target);
                });
            }.on('didInsertElement')
        });

        MountWidget.reopen({
            afterRender() {
                this._super();

                var topicModel = this.container.lookup('controller:topic').model;
                if (!topicModel) {
                    return;
                }
                if (topicModel.project_is_public) {
                    $('button.share').removeClass('private');
                } else {
                    $('button.share').addClass('private');
                }

                replaceUsernames();
            }
        });

        ComposerController.reopen({
            actions: {
                afterRefresh: function($preview) {
                    this._super();
                    // Schedule it so that it runs after the mention span/a tag replacement
                    Ember.run.scheduleOnce('afterRender', function() {
                        replaceUsernames();
                    });
                }
            }
        });
    }
};
