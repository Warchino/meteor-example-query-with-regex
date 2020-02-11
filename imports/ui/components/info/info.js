import { Links } from '/imports/api/links/links.js';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import './info.html';

Template.info.onCreated(function() {
  const instance = Template.instance();
  instance.filter = new ReactiveVar({});
  instance.subsInfo = new ReactiveVar({});
  instance.autorun(() => {
    instance.subsInfo.set(Meteor.subscribe('links.all', instance.filter.get()));
  });
});

Template.info.helpers({
  links() {
    return Links.find({});
  },
  subsInfo() {
    const { subsInfo } = Template.instance();
    const { id, params, name } = Meteor.connection._subscriptions[subsInfo.get().subscriptionId];
    return JSON.stringify({
      id, params, name
    }, null, 2);
  }
});

Template.info.events({
  'submit .info-link-add'(event) {
    event.preventDefault();

    const target = event.target;
    const title = target.title;
    const url = target.url;

    Meteor.call('links.insert', title.value, url.value, (error) => {
      if (error) {
        alert(error.error);
      } else {
        title.value = '';
        url.value = '';
      }
    });
  },
  'keyup .filter'(event, instance) {
    if (event.keyCode === 13) {
      const { value } = event.target;
      // When we send the parameter with the class RegExp that doesn't belong to EJSON, the subscription
      // doesn't works fine.
      // Meteor needs to know about how to handle some types like RegExp that's why it's not updating the
      // subscription.
      // https://docs.meteor.com/api/ejson.html#EJSON-addType

      instance.filter.set({ title: new RegExp(value, 'i') });

      // Instead sending the RegExp we can do the query like this:
      // instance.filter.set({ title: { $regex: value, $options: 'i' } });
    }
    if (event.keyCode === 27) {
      event.target.value = '';
      instance.filter.set({});
    }
  },
});
