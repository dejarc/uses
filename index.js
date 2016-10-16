var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var path = require("path");
var http = require('http').Server(app);
var io = require('socket.io');
var Kandy = require('kandy');
var firebase = require('firebase');
var webpush = require('web-push');
var socket = io(http);
var temp = 0;
var connected = false;
var all_chat = [];
var app_title = '';
var all_users = {};
var port = process.env.PORT || 3000;
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}
http.listen(port, function(){
  console.log('listening on port ' + port);
});

firebase.initializeApp({
  serviceAccount: "siciothackathon-615e2f5c53d6.json",
  databaseURL: "https://siciothackathon.firebaseio.com"
});

// VAPID keys should only be generated only once. 
const vapidKeys = webpush.generateVAPIDKeys();
webpush.setGCMAPIKey('AIzaSyBXg0iMARMAPHsuo6iUPfIrPmUWUgHlDLE');
webpush.setVapidDetails(
  'mailto:nodejs@siciothackathon.iam.gserviceaccount.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/app/bower_components'));
app.use('/nm', express.static(__dirname + '/node_modules'));
app.use('/css', express.static(__dirname + '/public/templates/css'));
app.get('/home', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});
app.post('/sendKandyMsg',function(req,res) {
  console.log(req);
  if(!(req.body && req.body.message)) {
    console.log("the argument was " + req);
    handleError(res, "Invalid Input","You must submit a message!");
  } else {
    console.log("parameters sent were " + req.body);
    var apiKey = "hidden";//hardcoded for testing
    var userId = "hidden";
    var password = "hidden";
    var kandy = new Kandy(apiKey);
    var end_user = "hidden@hidden.com";
    console.log(req.body.message);
    console.log(typeof req.body.message);
    kandy.getUserAccessToken(userId, password, function (data, response) {
        var dataJson = JSON.parse(data);
        console.log(dataJson.result.user_access_token);
        if(dataJson) {
          userAccessToken = dataJson.result.user_access_token;
          kandy.sendIm(userAccessToken, end_user, req.body.message, function (data, response) {
            var dataJson = JSON.parse(data);
            if (dataJson.message == "success") {
                console.log("Sent to " + end_user + ": " + req.body.message);
                res.status(200).json({"msg": "message success"});
            } else {
                res.status(204).json({"msg": "couldn't send message"});
            }
          });
        } else {
          res.status(300).json({"msg": "couldn't get access token"});
        }
    });
  }
});
app.post('/nspCreate',function(req,res) {//to check for the existence of a unique user channel
  console.log("The req.body is: " + req.body);
  if(!(req.body && req.body.user_id)) {
    handleError(res, "no user information was sent", "please send valid user information");
  } else {
    var user_id = req.body.user_id;
    var spc_msg = "requested namespace " + user_id + " is active ";
    var send_res = function(msg) {
      console.log(msg);
      var num_keys = 0;
      var nsp_msg = "The current namespaces are: ";
      Object.keys(all_users).forEach(function(key) {
        num_keys++;
        nsp_msg += key + " ";
      })
      if(num_keys === 0) {
        nsp_msg += "none";
      }
      console.log(nsp_msg);//monitor the current conversations
      res.status(200).json({"active_socket": true});
    };
    //if namespace socket has not been created,must create now
    all_users[user_id] ? send_res(spc_msg) : initNameSpace(user_id,send_res);
  }
});
app.post('/createNewUser',function(req,res) {
  if(!(req.body && req.body.user_id)) {
    handleError(res, "Invalid Input","You must submit a valid account.");
  } else {
    //need to to handle the logic here
  }
});
app.get('/allUsers/:id',function(req,res) {//get the user account id
  //need to add body here
});
app.get('/testConnection',function(req,res) {
  res.status(200).json({msg: "You are now connected"});
});
app.get('/testing',function(req,res) {
  res.write('hello world');
  res.end();
});
function initNameSpace(user_id,send_res) {
  console.log("creating the namespace " + user_id);
  var spc_name = "/" + user_id;
  var nsp = socket.of(spc_name);
  nsp.total_users = 0;
  all_users[user_id] = nsp;//hold a reference to this namespace
  nsp.on('connection', function(client){
    console.log('someone connected to namespace ' + user_id);
    this.total_users += 1;
    console.log("the total users in this namespace are " + this.total_users);
    client.on('storeData',function(msg) {//store data for the session
      console.log('storing game ' + msg.game_id);
      nsp.game_id = msg.game_id;
    });
    client.on('gameMessage',function(msg) {//send a message back to the client
      client.emit('newMessage',msg);
    });
    client.on('newMessage', function(msg){//broadcast an update to everyone listening
      console.log('message sent was ' + msg);
      client.broadcast.emit('newMessage',msg);

    });
    client.on('timeoutCheck',function() {//notify the client that user they are still connected
      client.emit('timeoutCheck');
    });
    client.on('disconnect', function(){
      nsp.total_users -= 1;
      console.log('user disconnected there are now ' + nsp.total_users + ' users');
    });

    client.on('notificationSubscription', function(data) {
      console.log("Notification Subscription Activated.");
      console.log(JSON.stringify(data));
    });
  });
  send_res("requested namespace " + user_id + " has been created.");
}
// socket.on('connection',function(client) {
//   console.log("someone connected");
// });
