'use strict';

exports = module.exports = function(app, mongoose) {
    var userSchema = new mongoose.Schema({
        username: {type: String, unique: true, select: false },
        displayName: {type: String, unique: false, select: true },
        password: {type: String, unique: false, select: false },
        timeCreated: {type: Date, default: Date.now, select: false }
    });
};
