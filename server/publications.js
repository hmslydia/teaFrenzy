Meteor.publish('pages', function(){
  return Pages.find({})
})

Meteor.publish('pagesByNumber', function(page_number){
  return Pages.find({number:page_number})
})

Meteor.publish('comments', function(page_id){
  return Comments.find({page_id: page_id})
})

Meteor.publish('groups', function(page_id){
  return Groups.find({page_id: page_id})
})

Meteor.publish('commentLikes', function(page_id){
  return CommentLikes.find({page_id: page_id})
})

