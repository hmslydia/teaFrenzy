Comments = new Meteor.Collection("comments");
/*
user_id
comment: //html
time:
group_id
*/

Groups = new Meteor.Collection("groups")
/*
Name
comment_ids; []
time:
*/

CommentLikes = new Meteor.Collection("commentLikes")
/*
comemnt_id:
user_id:
time:
*/

