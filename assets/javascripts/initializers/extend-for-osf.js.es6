// jshint esversion: 6

import { withPluginApi } from 'discourse/lib/plugin-api';
import { createWidget, Widget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import VirtualDom from 'virtual-dom';
import PostMenu from 'discourse/widgets/post-menu';
import MountWidget from 'discourse/components/mount-widget';
import ComposerModel from 'discourse/models/composer';
import ComposerController from 'discourse/controllers/composer';
import { wantsNewWindow } from 'discourse/lib/intercept-click';
import UserCardContents from 'discourse/components/user-card-contents';
import TopicListModel from 'discourse/models/topic-list';
import DiscoveryTopics from 'discourse/controllers/discovery/topics';
import computed from 'ember-addons/ember-computed-decorators';
import TopicListItem from 'discourse/components/topic-list-item';
import TopicView from 'discourse/views/topic';
import TopicTimeline from 'discourse/components/topic-timeline';
import ApplicationRoute from 'discourse/routes/application';
import { avatarImg } from 'discourse/widgets/post';
import { registerUnbound } from 'discourse-common/lib/helpers';
import { renderAvatar } from 'discourse/helpers/user-avatar';

// startsWith polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

export default {
    name: "extend-for-osf",
    initialize() {
        function getProjectModel() {
            var projectModel = {};
            var container = Discourse.__container__;
            var route = container.lookup('controller:Application').currentPath;

            if (route.startsWith('topic')) {
                var topicController = container.lookup('controller:topic');
                var topicModel = topicController.model;
                if (topicModel.parent_names) {
                    projectModel.parent_names = topicModel.parent_names;
                    projectModel.parent_guids = topicModel.parent_guids;
                    projectModel.contributors = topicModel.contributors;
                    projectModel.project_is_public = topicModel.project_is_public;
                    projectModel.view_only = topicController.view_only;
                    return projectModel;
                }
            } else if (route.startsWith('projects.show') || route.startsWith('projects.top')) {
                var projectController = container.lookup('controller:projects.show');
                var projectList = projectController.list;
                if (projectList && projectList.topic_list.parent_names) {
                    var projectTopicList = projectList.topic_list;
                    projectModel.parent_names = projectTopicList.parent_names;
                    projectModel.parent_guids = projectTopicList.parent_guids;
                    projectModel.contributors = projectTopicList.contributors;
                    projectModel.project_is_public = projectTopicList.project_is_public;
                    projectModel.view_only = projectController.view_only;
                    return projectModel;
                }
            }
            return null;
        }

        function renderOsfProjectMenu() {
            var container = Discourse.__container__;

            var base_osf_url = Discourse.SiteSettings.osf_domain;
            if (base_osf_url[base_osf_url.length - 1] === '/') {
                base_osf_url = base_osf_url.slice(0, -1);
            }

            var base_disc_url = window.location.origin;

            var title = '';
            var guid = '';
            var parent_guid = '';
            var queryString = '';

            var currentUser = container.lookup('component:siteHeader').currentUser;
            var isContributor = false;

            var projectModel = getProjectModel();
            if (projectModel) {
                title = projectModel.parent_names[0];
                guid = projectModel.parent_guids[0];
                parent_guid = projectModel.parent_guids[1];
                queryString = projectModel.view_only ? '?view_only=' + projectModel.view_only : '';
            }
            if (!title) {
                // empty
                return h('nav#projectSubnav');
            }

            var isContributor = false;
            if (!queryString && currentUser && projectModel.contributors) {
                _.each(projectModel.contributors, c => {
                    if (c.username === currentUser.username) {
                        isContributor = true;
                    }
                });
            }

            return h('nav#projectSubnav.navbar.osf-project-navbar[role=navigation]',
                    h('div.container', [
                        h('div.navbar-header', [
                            h('button.navbar-toggle.collapsed', {'attributes': {
                                    'data-toggle': 'collapse', 'data-target': '#project-header'
                                }}, [h('span.sr-only', 'Toggle navigation'), h('span.fa.fa-bars.fa-lg')]
                            ),
                            h('a.navbar-brand.visible-xs', {
                                'href':`/forum/${guid}/${queryString}`
                            }, 'Project Navigation')
                        ]),
                        h('div.collapse.navbar-collapse.project-nav',
                            h('ul.nav.navbar-nav', [
                                parent_guid ? h('li',
                                    h('a.project-parent', {
                                        'href': `${base_osf_url}/${parent_guid}/${queryString}`,
                                        'target': '_self' // Does nothing, but prevents bug in intercept-click from misrouting it
                                    }, h('i.fa.fa-level-down.fa-rotate-180'))
                                ) : null,
                                h('li',
                                    h('a.project-name', {
                                        'href': `${base_osf_url}/${guid}/${queryString}`,
                                        'target': '_self'
                                    }, `${title}`)
                                ),
                                h('li',
                                    h('a', {
                                        'href': `${base_osf_url}/${guid}/files/${queryString}`,
                                        'target': '_self'
                                    }, "Files")
                                ),
                                h('li',
                                    h('a.project-forum', {
                                        'href': `${base_disc_url}/forum/${guid}/${queryString}`,
                                    }, "Forum")
                                ),
                                h('li',
                                    h('a', {
                                        'href': `${base_osf_url}/${guid}/wiki/${queryString}`,
                                        'target': '_self'
                                    }, "Wiki")
                                ),
                                (isContributor || projectModel.project_is_public) ? h('li',
                                    h('a', {
                                        'href': `${base_osf_url}/${guid}/analytics/${queryString}`,
                                        'target': '_self'
                                    }, "Analytics")
                                ) : null,
                                h('li',
                                    h('a', {
                                        'href': `${base_osf_url}/${guid}/registrations/${queryString}`,
                                        'target': '_self'
                                    }, "Registrations")
                                ),
                                h('li',
                                    h('a', {
                                        'href': `${base_osf_url}/${guid}/forks/${queryString}`,
                                        'target': '_self'
                                    }, "Forks")
                                ),
                                isContributor ? h('li',
                                    h('a', {
                                        'href': `${base_osf_url}/${guid}/contributors/${queryString}`,
                                        'target': '_self'
                                    }, "Contributors")
                                ) : null,
                                isContributor ? h('li',
                                    h('a', {
                                        'href': `${base_osf_url}/${guid}/settings/${queryString}`,
                                        'target': '_self'
                                    }, "Settings")
                                ) : null
                            ])
                        )
                    ]
                )
            );
        }

        // This allows us to use the name instead of username for the title in
        // user-selector-autocomplete, which would otherwise be difficult to correct.
        // modified from discourse/helpers/user-avatar
        registerUnbound('avatar', function(user, params) {
            if (user.name) {
                user.title = user.name;
            }
            return new Handlebars.SafeString(renderAvatar.call(this, user, params));
        });

        var replaceUsernames = function() {
            // We want to make all these image tags have tooltips with the name, not the username
            // We specify just the ones we want because we don't want to mess with the ones
            // that show up for the autocorrect, which should show both username and full name
            var avatarElems = document.querySelectorAll('#current-user img, .topic-avatar img, .reply-to img, .reply-to-tab img, .posters img, .topic-map img, .user-image img, .author img');

            var usernamesToNames = {};

            var container = Discourse.__container__;
            var route = container.lookup('controller:Application').currentPath;

            var currentUser = container.lookup('component:siteHeader').currentUser;
            if (currentUser) {
                usernamesToNames[currentUser.username] = currentUser.name;
            }

            if (route.startsWith('discovery') || route.startsWith('projects')) {
                var topicsModel = container.lookup('controller:discovery.topics').model;
                if (topicsModel) {
                    _.each(topicsModel.topic_list.topics, topic => {
                        _.each(topic.posters, poster => {
                            usernamesToNames[poster.user.username] = poster.user.name;
                        });
                        _.each(topic.excerpt_mentioned_users, user => {
                            usernamesToNames[user.username] = user.name;
                        });
                    });
                    _.each(topicsModel.topic_list.contributors, contributor => {
                        usernamesToNames[contributor.username] = contributor.name;
                    });
                }
            } else if (route.startsWith('topic')) {
                var topicModel = container.lookup('controller:topic').model;
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
            } else if (route.startsWith('full-page-search')) {
                var resultsModel = container.lookup('controller:full-page-search').model;
                if (resultsModel) {
                    _.each(resultsModel.posts, post => {
                        usernamesToNames[post.username] = post.name;
                    });
                }
            }

            _.each(avatarElems, elem => {
                if (elem.title.length === 0) {
                    // For the composer, where the username text follows and is not in the title.
                    let sibling = elem.nextSibling;
                    if (!sibling || !usernamesToNames[sibling.textContent.trim().split(' ')[0]]) {
                        sibling = elem.nextElementSibling;
                    }
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
                        // Sometimes a containing <a> will also have a title that needs to be changed
                        if (elem.parentNode) {
                            elem.parentNode.title = elem.parentNode.title.replace(username, name);
                            // Also try the siblings of the parent...
                            var parentSibling = elem.parentNode.nextSibling;
                            while (parentSibling) {
                                parentSibling.textContent = parentSibling.textContent.replace(username, name);
                                parentSibling = parentSibling.nextSibling;
                            }
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

            // Show full name in the User Menu
            var userLink = document.querySelector('a.user-activity-link');
            if (userLink) {
                userLink.title = currentUser.name;
                _.each(userLink.childNodes, elem => {
                    if (elem.nodeName === '#text') {
                        elem.data = elem.data.replace(currentUser.username, currentUser.name);
                    }
                });
            }
        };

        var projectHeader = null;
        var updateProjectHeader = function() {
            // We do all the work with VirtualDom ourselves so that we can place
            // the header exactly where we want it.

            // If we are waiting for the topic model to be fully loaded, however, we don't
            // want to take down the old project header yet.
            var container = Discourse.__container__;
            var route = container.lookup('controller:Application').currentPath;
            if (route.startsWith('topic') && !container.lookup('controller:topic').model.parent_guids) {
                return;
            }

            var subnav = document.getElementById('projectSubnav');
            if (subnav) {
                var newProjectHeader = renderOsfProjectMenu();
                var patches = VirtualDom.diff(projectHeader, newProjectHeader);
                subnav = VirtualDom.patch(subnav, patches);
                projectHeader = newProjectHeader;
            } else {
                projectHeader = renderOsfProjectMenu();
                subnav = VirtualDom.create(projectHeader);
                var main = document.getElementById('main-outlet');
                main.parentNode.insertBefore(subnav, main);
            }
        }

        var api;
        withPluginApi('0.1', _api => {
            api = _api;
            api.onPageChange((url, title) => {
                Ember.run.scheduleOnce('afterRender', () => {
                    updateProjectHeader();

                    $('.navbar-toggle').off('click.navbar-toggle');
                    $('.navbar-toggle').on('click.navbar-toggle', () => {
                        $('.project-nav').animate({height: 'toggle'});
                    });

                    // A topic is not in a project if it has a slug that isn't a topic_guid (alphanumeric, 5 chars)
                    //
                    var slug = url.split('/')[2];
                    var slugIsGuid = slug && slug != 'topic' && slug.length <= 6;
                    if ((url.startsWith('/t/') && slugIsGuid) || url.startsWith('/forum/')) {
                        $('#main-outlet').addClass('has-osf-bar');
                    } else {
                        $('#main-outlet').removeClass('has-osf-bar');
                    }

                    replaceUsernames();
                });
            });

            // Override this widget to use full names
            api.createWidget(`search-result-user`, {
                html(attrs) {
                    return attrs.results.map(r => {
                        return h('li', this.attach('link', {
                            href: r.get('path'),
                            contents: () => [ avatarImg('small', { template: r.avatar_template, username: r.name }), ' ', r.name ],
                            className: 'search-link'
                        }));
                    });
                }
            });
        });

        TopicView.reopen({
            topicModelChanged: function() {
                Ember.run.scheduleOnce('afterRender', updateProjectHeader);
            }.observes('topic.parent_guids', 'topic.parent_names')
        });

        // Because we modify @mentions to show full names, we also have to modify the click handler
        UserCardContents.reopen({
            didInsertElement: function() {
                this._super();

                const clickMention = 'click.discourse-user-mention';

                // Replace the default mention click handler with one that
                // uses the href to find the username instead of the display text
                $('#main-outlet').unbind(clickMention);
                $('#main-outlet').on(clickMention, 'a.mention', (e) => {
                    if (wantsNewWindow(e)) { return; }

                    const $target = $(e.target);
                    const username = $target.attr('href').replace('/users/', '');
                    return this._show(username, $target);
                });
            }
        });

        // After "mounting"/rendering of the topic/poststream "widget"
        MountWidget.reopen({
            afterRender() {
                this._super();

                var topicModel = this.container.lookup('controller:topic').model;
                if (!topicModel) {
                    return;
                }
                // Don't allow sharing posts in private projects
                if (topicModel.project_is_public) {
                    $('button.share').removeClass('private');
                } else {
                    $('button.share').addClass('private');
                }

                // Don't cloak the first post, which may have an MFR view in it.
                var firstPost = topicModel.get('postStream').posts[0];
                if (firstPost) {
                    api.preventCloak(firstPost.id);
                }

                replaceUsernames();
            }
        });

        // When the user dropdown appears, we need to do a username replacement for it
        $(document).on('click', '#current-user a', e => {
            Ember.run.scheduleOnce('afterRender', replaceUsernames);
        });

        ComposerController.reopen({
            actions: {
                afterRefresh: function($preview) {
                    this._super($preview);
                    // Schedule it so that it runs after the mention span/a tag replacement
                    Ember.run.scheduleOnce('afterRender', replaceUsernames);
                }
            }
        });

        DiscoveryTopics.reopen({
            actions: {
                // This schedules a rerender, so we need to also schedule
                // A replacing of the users, since the page doesn't reload
                toggleBulkSelect() {
                    this._super();
                    Ember.run.scheduleOnce('afterRender', replaceUsernames);
                },
            }
        });

        // Always display the topic excerpt
        TopicListItem.reopen({
            @computed()
            expandPinned() {
              return Boolean(this.get('topic.excerpt'));
            }
        });

        // Move the timeline out of the way of the project bar
        TopicTimeline.reopen({
            buildArgs() {
                var args = this._super();
                if ($('#main-outlet').hasClass('has-osf-bar')) {
                    args['top'] = Math.max(args['top'], 115);
                }
                return args;
            }
        });

        // Set the title in the same manner as the OSF
        ApplicationRoute.reopen({
            actions: {
                _collectTitleTokens(tokens) {
                    var projectModel = getProjectModel();
                    var projectName = projectModel ? projectModel.parent_names[0] + ' ' : ' ';
                    Discourse.set('_docTitle', 'OSF | '+ projectName + 'Forum');
                }
            }
        });
    }
};
