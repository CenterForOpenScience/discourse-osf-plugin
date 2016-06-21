(() => {
  withPluginApi('0.1', api => {
    api.decorateWidget('header:after', helper => {
      helper.connect(Ember.View.extend({
        tagName: 'div',
        classNames: ['project_bar'],
        template: Ember.HTMLBars.compile("<ul>{{#each navbuttons as |button|}}<li>{{button}}</li>{{/each}}</ul>")
      }).create({
        navbuttons: [
          "Project Name",
          "Files",
          "Forum",
          "Wiki",
          "Analytics"
        ]
      }))
    })
  });
})()
