
// defining a mongoose schema 
// including the module

var mongoose = require('mongoose');

var bcrypt   = require('bcrypt-nodejs');

var Schema = mongoose.Schema;


var userSchema = new Schema({

	local:{

			firstName  			: {type:String,default:''},
			lastName  			: {type:String,default:''},
			email	  			: {type:String,default:''},
			password			: {type:String,default:''}
	},

	google:{

	        id           : {type:String,default:''},
	        token        : {type:String,default:''},
	        email        : [
	        				{type:String,default:''}
	        				],
	        name         : {type:String,default:''}
	}
   

	
},{timestamps:true});

	// Hashing passwords suing bcrypt

	userSchema.methods.generateHash = function(password) {
    	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	};

	userSchema.methods.validPassword = function(password){

		return bcrypt.compareSync(password,this.local.password);
	};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
