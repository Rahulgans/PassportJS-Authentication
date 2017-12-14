
var mongoose = require('mongoose');
var express = require('express');

var userRouter  = express.Router();

const userModel = require('./../../app/models/User');

var passport = require('passport');

var auth = require('./../../middlewares/authorization');

var responseGenerator = require("./../../libs/responseGenerator");


module.exports.controllerFunction = function(app){

	userRouter.get('/',function(req,res){

		res.render('index');


	});

	userRouter.get('/logout',function(req,res){

		req.session.destroy(function(err){
			res.redirect('/login');	
		});
		

	});

	userRouter.get('/signup',function(req,res){

		res.render('signup',{"message":req.flash("signupMessage")});


	});

	userRouter.get('/login',function(req,res){

		res.render('login',{"message":req.flash("loginMessage")});

	});

	userRouter.get('/profile',auth.checkLogin,function(req,res){

		delete req.user.local.password ;


		res.render('profile',{user:req.user});

	});

	 // Passport.authenticate invokes the strategy that we defined
	
	userRouter.post('/signup',passport.authenticate('local-signup',{
		successRedirect:'/profile',
		failureRedirect: '/signup',
		failureFlash: true
	}));


	userRouter.post('/login',passport.authenticate('local-login',{
		successRedirect:'/profile',
		failureRedirect: '/login',
		failureFlash: true
	}));

	// Google Authentication
    // profile gets us their basic information including their name
    // email gets their emails

	userRouter.get('/auth/google/get', passport.authenticate('google', {
	 scope : ['profile', 'email'] 
	}
	));

	// the callback after google has authenticated the user
    userRouter.get('/auth/google/callback',passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : 'http://localhost:3000/login'
            }));

app.use('/',userRouter);

}