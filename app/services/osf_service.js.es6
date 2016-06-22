Ember.Service.extend({
  value: null,

  unsetValue() {
    this.get('value').setObjects([]);
  },
  pushValue(pushed_value) {
    this.get().pushObject(pushed_value);
  }
});
    
