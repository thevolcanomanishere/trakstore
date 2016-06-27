var mongoose = require('mongoose'),
    _ = require('underscore')._,
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    crypto = require('crypto'),
    jwt = require('jwt-simple'),
    tokenSecret = "ChangeThisAtSomePoint?";
    
var Token = new Schema({
    token: {type: String},
    date_created: {type: Date, default: Date.now}
});

//time in ms for token to expire
var TokenTimeToLive = 36000000

//time give to use reset token in mins
//not finished yet
var ResetTokenTime = 20;

Token.statics.hasExpired = function(created){
    var now = new Date();
    var diff = (now.getTime() - created);
    return diff > TokenTimeToLive * 100;
};

var TokenModel = mongoose.model('Token', Token);

//GridFS setup here

var Account = new Schema({
    email: {type: String, required: true, index: {unique: true}},
    username: {type: String, required: true},
    date_created: {type: Date, default: Date.now},
    token: {type: Object}
});

Account.plugin(passportLocalMongoose, {usernameField: 'email'});

Account.statics.encode = function(data){
    return jwt.encode(date, tokenSecret);
};

Account.statics.decode = function(data){
    return jwt.decode(data, tokenSecret);
};

Account.statics.findUser = function(email, token, cb) {
    var self = this;

    this.findOne({email: email}, function(err, usr) {
        if(err || !usr) {
            cb(err, null);
        } else if (usr.token && usr.token.token && token === usr.token.token){
            cb(false, {email: usr.email, username: usr.username, token: usr.token, date_created: usr.date_created});
        } else {
            cb(new Error('Token does not exist or does not match.'), null);
        }
    });
};

//find single user using email decoded from token
Account.statics.findUserByEmailOnly = function(email, cb) {
    var self = this;
    this.findOne({email: email}, function(err, usr){
        if(err || !usr){
            cb(err, null);
        } else {
            cb(false, usr);
        }
    });
};



//use jwt to create a token and add to user model
Account.statics.createUserToken = function(email, cb){
    var self = this;
    this.findOne({email: email}, function(err,usr){
        if(err || !usr){
            console.log('error = ' + err.message);
        }
        
        //create the user token and add to user
        var token = self.encode({email: email});
        usr.token = new TokenModel({token: token});
        usr.save(function(err, usr){
            if(err){
                cb(err, null);
            } else {
                console.log("about to cb with usr.token.token: " + usr.token.token);
                cb(false, usr.token.token);
            }
        });
    });
};

//used for logut
Account.statics.invalidateUserToken = function(email, cb) {
    var self = this;
    this.findOne({email: email}, function(err, usr) {
        if(err || !usr) {
            console.log('err');
        }
        usr.token = null;
        usr.save(function(err, usr) {
            if (err) {
                cb(err, null);
            } else {
                cb(false, 'removed');
            }
        });
    });
};

module.exports = mongoose.model('Account', Account);
module.exports.Token = TokenModel;