var path = require('path');
var Account = require(path.join(__dirname, '..', '/models/account'));
var Token = require(path.join(__dirname, '..', '/models/account')).Token;

module.exports = function (app, passport){
    
    app.get('/test', function(req, res){
        res.status(200).send("WORKING!!");
        console.log("Test route fired");
    });
};
