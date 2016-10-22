# The discourse-osf-plugin plugin
Here we manage features that are very specific to integration with the OSF. While the discourse-osf-projects plugin makes many modifications to both the front and back ends of Discourse, this plugin works exclusively on the front-end. It adds a project header bar designed to look and function identically to the one on the OSF, and because we use cryptic GUIDs as usernames, it replaces usernames in the UI with full names. It adds CSS to style Discourse more like the OSF and also adds an MFR viewer to the top post of each file topic.

Read the general documentation about writing Discourse plugins here: https://meta.discourse.org/t/beginners-guide-to-creating-discourse-plugins/30515

##On the Discourse Back-end
In the plugin.rb file, we add our scss file for styling Discourse, and also register two additional links to add fonts from google that we use.

We also add the path "plugins/discourse-osf-plugin/views" to the search path for views so that our comments.html.erb file overrides the default one. This file is used to render the html that is embedded into the comments pane on various OSF pages, and our override is necessary to show full names instead of usernames in that panel.

##Discourse Connectors
We add the mfr-view.hbs file to the topic-title plugin outlet. This file consists of javascript that detects when the current page is a topic with the first post linking to a file on the OSF. If so, it adds a button that when clicked shows the MFR view of that file.

##On the Ember Front-end
In the extend-for-osf initializer we make all our changes to the Ember side of Discourse.

First, we make a virtual-dom view to show the OSF project header/menu. Whenever the page changes, we make sure this header is updated and inserted in the proper location of the DOM. If the page should not have the project header, it is simply rendered empty. We also set the has-osf-bar class on the main-outlet so that the project-show template contents do not get covered up by project bar when it is held fixed at the top of the window.

We also have an event handler attached to the hamburger/menu icon for when the page is in mobile mode. The icon animates the expanding or collapsing of the menu.

Second, we replace usernames with full names anywhere in the page that they appear visually: as tool tips, in \@mentions, and around avatars. The username-fullname pairs used in the replacement process are gathered from the contributors, the current user, excerpt_mentioned_users, posters, and reply_to_user's. We schedule this replacement to occur on page change, rerendering of the post stream/topic widget, refresh of the composer/editor, and toggle of the bulk select.

Because we change the text in the \@mentions to show the full name, this actually breaks the way that the \@mention links work to show the user card details. In order to fix this, we modify the UserCardView so that it extracts the username from the link instead of the display text.

When the post stream/topic widget rerenders, we make sure that "share" buttons only appear for public projects, and we prevent the MFR view on the topic post from being "cloaked," which would cause the DOM modifications to the topic post to get messed up.

We also modify the expandPinned method of the topic list item. This method determines whether to show an excerpt from the topic in a topic-list. Normally, Discourse will only show an excerpt if a topic is pinned, but since we want to show excerpts for all topics, we have this return true as long as the topic in question actually has an excerpt to display.

##CSS Styling
The styling is all done in osf-plugin.scss.

We style the top Discourse header to look like the OSF header.
We style the OSF project header to look like the OSF project header, and to duplicate functionality especially in mobile mode.
We add a couple of styles needed by the MFR javascript to correctly calculate PDF height.
We hide GUID usernames from showing up.

##Further Work/Bugs to Fix
Make sure that \@mention and other notifications work in a way compatible with the OSF/the way we expect them to.
