Pages = new Meteor.Collection("pages");
/*
id:
number:
*/

Comments = new Meteor.Collection("comments");
/*
page_id:
user_id:
comment: //html
time:
group_id: 
*/

Groups = new Meteor.Collection("groups")
/*
page_id:
Name
comment_ids; []
time:
//color: 
*/

CommentLikes = new Meteor.Collection("commentLikes")
/*
page_id:
comemnt_id:
user_id:
time:
*/

