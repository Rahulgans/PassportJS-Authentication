
//Startegy is an constructor present inside strategy.js file

var mongoose = require('mongoose');

var LocalStrategy = require("passport-local").Strategy ;

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var authConfig = require('./oauth');

const userModel = require('../app/models/User');


// expose this function to our app using module.exports
module.exports = function(passport){


	// serialize the object when user is being sent by strategies
	passport.serializeUser(function(user,done){
			
			done(null,user.id);
		
	});

	//deserailize function stores the entire user object in req.user
	// It sort of takes care of revisits of the user after logging in
	passport.deserializeUser(function(id,done){

		userModel.findById({"_id":id},function(err,user){
		
			done(null,user);
		
		})
	});

// FIRST -- CONFIGURING STRATEGY. Here it is local-strategy

	passport.use('local-login',new LocalStrategy({
	    usernameField: 'email',
	    passwordField: 'password',
	    passReqToCallback:true
	  },
	  function(req,email, password, done){
	    console.log(email);
	    console.log(password);

	    	//Dont search by password field also, since we have not hashed it yet.
		    userModel.findOne({"local.email":email},function(err,user){

		    	if(err){

		    		return done(err);
		    	}

		    	else if(!user){
		    		
		    		// Returns message and jumps back to the route
		    		return done(null,false,req.flash("loginMessage","Invalid credentials"));

		    	}

		    	else if(!user.validPassword(password)){

		    		return done(null,false,req.flash("loginMessage","Password is wrong!"));

		    	}

		    	else{
		    		
		    		return done(null,user);
		    	}
		    })
	   }))
		

	passport.use('local-signup',new LocalStrategy({
	    usernameField: 'email',
	    passwordField: 'password',
	    passReqToCallback:true
	  },
	  function(req,email, password, done){

	  	 process.nextTick(function() {
	    

			    userModel.findOne({"local.email":email},function(err,user){

			    	if(err){

			    		return done(err);
			    	}

			    	else if(user){

			    		console.log("NULL");
			    		return done(null,false,req.flash("signupMessage","E-Mail already Taken"));
			    	}

			    	else{
			    		      
		                 	var newUser = new userModel();
		    
			                    newUser.local.firstName = req.body.firstName ;
			                    newUser.local.lastName = req.body.lastName ;
			                    newUser.local.email = req.body.email;
			                    newUser.local.password = newUser.generateHash(req.body.password);                	

		                	newUser.save(function(err,result){
		                		if(err){
		                			return done(err);
		                		}
		                		else{
		                			
		                			// Returns user and jumbs back to the route
		                			console.log(newUser.local);
		                			console.log("jjashf");
		                			return done(null,newUser);
		                		}
		                	})
					}
			    	
			    })
	   })

	}));

	// --------- GOOGLE AUTHENTICATION STRATEGY -------

	passport.use('google',new GoogleStrategy({
	   	
	   	clientID        : authConfig.googleAuth.clientID,
        clientSecret    : authConfig.googleAuth.clientSecret,
        callbackURL     : authConfig.googleAuth.callbackURL,

	  },
	  function(token,refToken, profile, done){

	    console.log(token);

	    // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

	    	//Search for user with concerned profile-ID
	    	userModel.findOne({"google.id":profile.id},function(err,user){

		    	if(err){

		    		return done(err);
		    	}

		    	else if(user){
		    		
		    		// If user present, then log them in
		    		return done(null,user);

		    	}

		    	else{
		    		
		    		// if the user isnt in our database, create a new user
                    var newUser          = new userModel();
                    
                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.google.name  = profile.displayName;

                    for(var i in profile.emails){

                    	newUser.google.email[i] = profile.emails[i].value;
                    	if(profile.emails.length>1){
                    		newUser.google.email.split(',');
                    	}
                    }
                              
                    newUser.save(function(err,finalResult) {
                        if (err){
                            throw err;
                        }

                        console.log('google');
                        console.log(newUser);
                        return done(null, newUser);
                    });
                }
		    	
		    })
	   	}); // process.nextTick ends
	}))
};