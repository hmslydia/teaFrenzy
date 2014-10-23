Meteor.startup(function () {	
  if (Comments.find().count() === 0) {
    for (var i = 0; i < data.length; i++) {
      var commentObj = { 
        comment:data[i],
        user_id: null,
        username: null,
        time: i,
        group_id: null,
        likes: 0
      }
      Comments.insert(commentObj);
    }
  }
})