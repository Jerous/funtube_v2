var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
 
var adminuserSchema = new mongoose.Schema({
    username: {type: String, unique: true, select: true },
    password: {type: String, unique: false, select: true },
    timeCreated: {type: Date, default: Date.now, select: true },
    lastlogin: { type: Date }
});

adminuserSchema.methods.verifyPassword = function( pwd ) {
    var passwordsha1 = crypto.createHash('sha1').update(pwd).digest("hex");
    return ( this.password === passwordsha1 );
};
 
module.exports = mongoose.model('adminuser', adminuserSchema);