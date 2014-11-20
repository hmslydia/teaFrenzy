Meteor.startup(function () {	
  if (Pages.find().count() === 0) {
    var page_id = Pages.insert({number: 0})
  
    for (var i = 0; i < data.length; i++) {
      var commentObj = { 
        comment:data[i],
        user_id: null,
        username: null,
        time: i,
        group_id: null,
        likes: 0,
        page_id: page_id
      }
      Comments.insert(commentObj);
    }
  }
})