getTime = function(){
  return (new Date()).getTime()
}

submitNewComment = function(){
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

Template.addComment.events({
  'click #submitNewComment': function(){
    submitNewComment()
  },
  
  'keypress #newComment': function(e){
    if(e.charCode == 13){
      e.stopPropagation()
      submitNewComment()
    }
  } 
})

function getCommentData(comment){
  //userName
  var username = comment.username
  comment.isGroup = false
  comment.user = username
  comment.selected = (
    ( Session.get('mode') == 'addToGroup') && (Session.get('selected_comment_id') == comment._id)
    ||
    ( Session.get('mode') == 'moveFromGroup') && (Session.get('selected_comment_id') == comment._id)    
    )
  
  comment.addToTarget = (
    ( Session.get('mode') == 'addToGroup') && (Session.get('selected_comment_id') != comment._id)
    ||
      (Session.get('mode') == 'moveFromGroup')
    
    ) 
  
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
  
    var comments = Comments.find({group_id: null}, {sort: {time: -1}}).fetch()
    //fetch the usernames from the userId
    _.map(comments, function(comment){
      return getCommentData(comment)
      
    })
    
    var allComments = groups.concat(comments)
   allComments =  _.sortBy(allComments, function(obj){ return -1 * obj.time; });
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
  
  'click .moveToGroup': function(){
    //console.log(this)
    var comment_id = this._id
    Session.set('mode', 'addToGroup')
    Session.set('selected_comment_id', comment_id)
  },
  
  'click .moveFromGroup': function(){
    //console.log(this)
    var comment_id = this._id
    Session.set('mode', 'moveFromGroup')
    Session.set('selected_comment_id', comment_id)
  },
  
  'click .ungroup': function(){
    var comment_id = this._id
    ungroup(comment_id)
  },
  
  'click .unselect': function(){
    var comment_id = this._id
    Session.set('mode', 'list')
    Session.set('selected_comment_id', comment_id)    
  },
  
  'click .createGroup': function(){
    //singleton target, singleton source
    var target_comment_id = this._id
    var mode = Session.get('mode')
    var source_comment_id = Session.get('selected_comment_id') 
    
    //figure out if the comments are strays or in groups
    var targetComment = Comments.findOne(target_comment_id)
    var sourceComment = Comments.findOne(source_comment_id)

    var targetCommentTime = targetComment.time

    if(mode == "addToGroup"){
      newGroup(target_comment_id, source_comment_id)

        
        Session.set('selected_comment_id', "") 
        Session.set('mode', "")  
    } 
    if (mode == "moveFromGroup"){
      var singleton_comment_id = this._id
      var mode = Session.get('mode')
      var group_comment_id = Session.get('selected_comment_id')       
      moveCommentFromGroupToSingleton(group_comment_id, singleton_comment_id)
    }     
  },
  
  'click .addToThisGroup': function(){
    var mode = Session.get('mode')
    var source_comment_id = Session.get('selected_comment_id') 
    var group_id = this._id   
    
    if(mode == "addToGroup"){
      //The source could be in a group or not, the target must be a group
      //if the source IS in a group, then we want to remvoe it from that group, and if that group is now empty, to destroy that group.
      //CURRENTLY source comments cannot be from groups, so we don't need to worry about that
      moveCommentToGroup(source_comment_id, group_id)       
    } 
    if(mode == "moveFromGroup"){
      //The source could be in a group or not, the target must be a group
      //if the source IS in a group, then we want to remvoe it from that group, and if that group is now empty, to destroy that group.
      //CURRENTLY source comments cannot be from groups, so we don't need to worry about that
      moveCommentFromGroupToGroup(source_comment_id, group_id)       
    } 
       
  },
  
  'click .editThisGroup': function(){
    var group_id = this._id
    Session.set('mode', 'editingGroup')
    Session.set('selected_group_id', group_id)    
  } 
})

newGroup = function(target_comment_id, source_comment_id, targetCommentTime){
  var numGroups = Groups.find().count()
  var group_id = Groups.insert({
    name: "Group "+numGroups,
    comment_ids: [target_comment_id, source_comment_id],
    time: targetCommentTime || getTime()
  })
  //add both comments to that new group
  Comments.update(target_comment_id, {$set: {group_id: group_id}})
  Comments.update(source_comment_id, {$set: {group_id: group_id}})
}

moveCommentToGroup = function(comment_id, group_id){  
  //set the source comment's group_id 
  Comments.update(comment_id, {$set: {group_id: group_id}})
  
  //add source comment_id to the group
  Groups.update(group_id, {$push: {comment_ids: comment_id}} )
  Session.set('selected_comment_id', "")  
  Session.set('mode', "")            
}

moveCommentFromGroupToGroup = function(comment_id, group_id){  
  var comment = Comments.findOne(comment_id)
  var originalGroupId = comment.group_id
  //set the source comment's group_id 
  Comments.update(comment_id, {$set: {group_id: group_id}})
  
  //add source comment_id to the group
  Groups.update(group_id, {$push: {comment_ids: comment_id}} )


  
  //IF THE GROUP THE COMMENT CAME FROM HAS NOTHING LEFT, 
  //GET RID OF THAT GROUP  
  var originalGroup = Groups.findOne(originalGroupId) 
     
  var numComments = originalGroup.comment_ids.length
  if (numComments == 1){
    Groups.remove({_id: originalGroupId}) 
  } else {
    Groups.update(originalGroupId, {$pull: {comment_ids: comment_id}})    
  } 
  
  Session.set('selected_comment_id', "")  
  Session.set('mode', "")         
}

moveCommentFromGroupToSingleton = function(group_comment_id, comment_id){
  var comment = Comments.findOne(group_comment_id)
  var originalGroupId = comment.group_id
  
  //add source comment_id to the group
  //Groups.update(group_id, {$push: {comment_ids: comment_id}} )
  newGroup(group_comment_id, comment_id)
  
  //IF THE GROUP THE COMMENT CAME FROM HAS NOTHING LEFT, 
  //GET RID OF THAT GROUP  
  //var originalGroup = Groups.findOne(originalGroupId) 
     
  removeCommentFromGroup(originalGroupId, group_comment_id)
  
  Session.set('selected_comment_id', "")  
  Session.set('mode', "")     
}

removeCommentFromGroup = function(originalGroupId, group_comment_id){
  console.log(originalGroupId)
  var originalGroup = Groups.findOne(originalGroupId)
  var numComments = originalGroup.comment_ids.length
  if (numComments == 1){
    Groups.remove({_id: originalGroupId}) 
  } else {
    Groups.update(originalGroupId, {$pull: {comment_ids: group_comment_id}})    
  }   
}

ungroup = function(group_comment_id){
  var comment = Comments.findOne(group_comment_id)
  var originalGroupId = comment.group_id  
  
  Comments.update(group_comment_id, {$set: {group_id: null}}) // set a time?  
  
  removeCommentFromGroup(originalGroupId, group_comment_id)
  
  Session.set('selected_comment_id', "")  
  Session.set('mode', "")    
}

Template.group.helpers({
  dropTarget: function(){
    return ( Session.get('mode') == 'addToGroup') || ( Session.get('mode') == 'moveFromGroup')
  },
  
  editing: function(){
    return ( Session.get('mode') == 'editingGroup') && ( Session.get('selected_group_id') == this._id)
  }
})






