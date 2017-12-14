

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

// requiring passport
var passport = require('passport');

//Flash Messages for USER
var flash    = require('connect-flash');


// client side socket library
const client = require('socket.io').listen(4000).sockets;


app.use(logger('dev'));

app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(cookieParser());

//built-in Node-module to get path. No installation required
var path = require("path");


app.set("view engine", "ejs");

// setting path for our views
app.set('views', './app/views');


// accessing public directory
app.use(express.static(path.join(__dirname, 'public')));

//Passing passport object to config path

require('./config/passport')(passport);	

app.use(session({
  name :'myCustomCookie',
  secret: 'mySecret', // encryption key 
  resave: true,
  httpOnly : true,  // to prevent cookie-forgery
  saveUninitialized: true,
  cookie: { secure: false }  // make true incase of SSL certificate
}));

//StackOverflow-IDEA to not CACHE
 app.use(function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'); 
 	next(); 
 });
  
// passport.initialize middleware is invoked on every request. 
// It ensures the session contains a passport.user object, which may be empty.
app.use(passport.initialize());

app.use(passport.session());

// initialize flash for sending messages
app.use(flash());

//ESTABLISHING DATABASE CONNECTION

// using mlab's database account -for heroku purpose
var dbPath = "mongodb://chaton:chat@ds135196.mlab.com:35196/letchat";


db = mongoose.connect(dbPath);

mongoose.connection.once('open',function(){
	console.log(dbPath);
	console.log("Success! Database connection open");
});


// fs module, by default module for file management in nodejs
var fs = require('fs');

// include all our model files
fs.readdirSync('./app/models').forEach(function(file){
	// check if the file is js or not
	if(file.indexOf('.js'))
		// if it is js then include the file from that folder into our express app using require
		require('./app/models/'+file);

});// end for each

// include controllers
fs.readdirSync('./app/controllers').forEach(function(file){
	if(file.indexOf('.js')){
		// include a file as a route variable
		var route = require('./app/controllers/'+file);
		//call controller function of each file and pass your app instance to it
		route.controllerFunction(app);

	}

});//end for each


// app.get('*',function(request,response,next){
		
// 	response.status = 404 ;

// 	//similar to next(err) i.e calling error

// 	next("Error in path");
// });


// //Error handling Middleware

// app.use(function(err,req,res,next){
// 	console.log("Custom Error handler used");
// 	if(res.status == 404){
// 		res.send("Invalid Path. Kindly make sure your URL is right");
// 	}
// 	else{
// 		res.send(err);
// 	}
// });


// PORT DECLARATION
const port = process.env.PORT || 3000 ;


app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});
