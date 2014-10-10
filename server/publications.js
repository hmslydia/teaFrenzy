Meteor.publish('comments', function(){
  return Comments.find({})
})

Meteor.publish('groups', function(){
  return Groups.find({})
})

Meteor.publish('commentLikes', function(){
  return CommentLikes.find({})
})