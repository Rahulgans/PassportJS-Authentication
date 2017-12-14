


//	MIDDLEWARE TO CHECK IF USER IS LOGGED IN
module.exports.checkLogin = function(req,res,next){

	if(req.isAuthenticated()){
		
		console.log(req.isAuthenticated());
		console.log(req.user);
		next();
		
	}

	else{
			console.log(req.isAuthenticated());
			console.log("middleware ran");
			
		req.session.destroy(function(err){
			res.redirect('/login');	
		});
		
	}

};


