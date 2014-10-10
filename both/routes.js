Router.map(function(){
  this.route('home', { 
    path: '/',
    layoutTemplate: 'standardLayout',
    yieldTemplates: {
      'header': {to: 'header'}
    },
    waitOn: function(){         
      return [Meteor.subscribe('comments'),     
              Meteor.subscribe('groups'),
              Meteor.subscribe('commentLikes')]
    },
    data: function(){
      return {
          comments: Comments.find().fetch(), 
          groups: Groups.find().fetch()
        }
    },
    action: function(){
      if(this.ready()){
        this.render()
      }
    }
  })
})