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


  this.route('page', { 
    path: '/id/:_id',
    template: "home",
    layoutTemplate: 'standardLayout',
    yieldTemplates: {
      'header': {to: 'header'}
    },
    waitOn: function(){         
      var id = this.params._id
      return [Meteor.subscribe('comments', id),     
              Meteor.subscribe('groups', id),
              Meteor.subscribe('commentLikes', id)]
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

  
  this.route('pages', { 
    path: '/pages',
    layoutTemplate: 'standardLayout',
    yieldTemplates: {
      'header': {to: 'header'}
    },
    
    waitOn: function(){         
      return [Meteor.subscribe('pages')]
    },
    data: function(){
      return {
          pages: Pages.find().fetch() 
          //groups: Groups.find().fetch()
        }
    },
    action: function(){
      if(this.ready()){
        this.render()
      }
    }
    
  })  

  this.route('redirect', { 
    path: '/:_number',
    template: "home",
    layoutTemplate: 'standardLayout',
    yieldTemplates: {
      'header': {to: 'header'}
    },
    waitOn: function(){         
      var number = this.params._number * 1
      console.log(number)
      return [Meteor.subscribe('pagesByNumber', number)]
    },
    data: function(){
      return {
          comments: Comments.find().fetch(), 
          groups: Groups.find().fetch()
        }
    },
    action: function(){
      if(this.ready()){
        var number = this.params._number * 1
        var page = Pages.findOne({number: number})
        console.log(page)
        var id = page._id
        Router.go("page", {_id: id})
        this.render()
      }
    }
  })  
  
})