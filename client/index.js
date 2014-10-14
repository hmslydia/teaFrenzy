getTime = function(){
  return (new Date()).getTime()
}

Template.addComment.events({
  'click #submitNewComment': function(){
    var comment = $('#newComment').val().trim()
    
    if(comment != ""){
      $('#newComment').val("")
      
      var username = Meteor.users.findOne(Meteor.userId()).emails[0].address.split("@")[0] || "anonymous"
      Comments.insert({ 
        comment:comment,
        user_id: Meteor.userId(),
        username: username,
        time: getTime(),
        group_id: null,
        likes: 0
      })
    }
  } 
})

function getCommentData(comment){
  //userName
  var username = comment.username
  comment.isGroup = false
  comment.user = username
  comment.selected = (( Session.get('mode') == 'addToGroup') && (Session.get('selected_comment_id') == comment._id))
  
  comment.addToTarget = (( Session.get('mode') == 'addToGroup') && (Session.get('selected_comment_id') != comment._id))
  
  //do you like this
  if(comment.likes > 0){
    var doIlikeThisCount = CommentLikes.find({comment_id: comment._id, user_id: Meteor.userId()}).count()
    if(doIlikeThisCount> 0){
      comment.iLike = true
      comment.likes = comment.likes //- 1
      comment.hasLikes = (comment.likes > 0)
      comment.oneLike = (comment.likes == 1)
    }else{
      comment.iLike = false
      comment.hasLikes = (comment.likes > 0)
      comment.oneLike = (comment.likes == 1)
    }
  }
  return comment  
}

Template.listComments.helpers({
  comments: function(){
    var groups = Groups.find().fetch()
    _.map(groups, function(group){
      group.isGroup = true
      var comment_ids = group.comment_ids
      
      group.comments = Comments.find({_id: {$in: comment_ids}}).fetch()
      _.map(group.comments, function(comment){
        return getCommentData(comment)
      })
      return group
    })
    console.log(groups)
  
    var comments = Comments.find({group_id: null}, {sort: {time: -1}}).fetch()
    //fetch the usernames from the userId
    _.map(comments, function(comment){
      return getCommentData(comment)
      
    })
    
    var allComments = groups.concat(comments)
    console.log(allComments)
    return allComments
  }
})

Template.listComments.events({
  'click .like': function(){
    //console.log(this)
    var comment_id = this._id
    var user_id = Meteor.userId()
    
    //var newLikes = this.likes + 1
    Comments.update(comment_id, {$inc: {likes: 1}})
    
    CommentLikes.insert({
      comment_id: comment_id,
      user_id: user_id
    })
  },
  
  'click .group': function(){
    //console.log(this)
    var comment_id = this._id
    Session.set('mode', 'addToGroup')
    Session.set('selected_comment_id', comment_id)
  },
  
  'click .unselect': function(){
    var comment_id = this._id
    Session.set('mode', 'list')
    Session.set('selected_comment_id', comment_id)    
  },
  
  'click .addToThisGroup': function(){
    var target_comment_id = this._id
    var mode = Session.get('mode')
    var source_comment_id = Session.get('selected_comment_id') 
    
    //figure out if the comments are strays or in groups
    var targetComment = Comments.findOne(target_comment_id)
    var sourceComment = Comments.findOne(source_comment_id)


    if(mode == "addToGroup"){
      //BOTH comments are strays
      if(targetComment.group_id == null && sourceComment.group_id == null){
        //create a group
        var numGroups = Groups.find().count()
        var group_id = Groups.insert({
          name: "Group "+numGroups,
          comment_ids: [target_comment_id, source_comment_id]
        })
        //add both comments to that new group
        Comments.update(target_comment_id, {$set: {group_id: group_id}})
        Comments.update(source_comment_id, {$set: {group_id: group_id}})
      }

      //One comment is stray
      if((targetComment.group_id == null && sourceComment.group_id != null) || (targetComment.group_id != null && sourceComment.group_id == null)){
        //create a group
        
        //For the group comment, find the group_id
        if(targetComment.group_id == null){
          var group_id = sourceComment.group_id
          var stray_comment_id = targetComment._id
          
          //set the target comment's group_id 
          Comments.update(target_comment_id, {$set: {group_id: group_id}})
          
          //add the comment_id to the group
          Groups.update(group_id, {$push: {comment_ids: target_comment_id}} )
          
        }

        if(sourceComment.group_id == null){
          var group_id = targetComment.group_id
          var stray_comment_id = sourceComment._id
          
          //set the target comment's group_id 
          Comments.update(stray_comment_id, {$set: {group_id: group_id}})
          
          //add the comment_id to the group
          Groups.update(group_id, {$push: {comment_ids: stray_comment_id}} )
        }        
        
      }
           
    }    
  } 
})
