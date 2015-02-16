var express = require('express');
var router = express.Router();
var events = require('events');
var crypto = require('crypto');
    
var adminuser = require('../../schema/adminuser.js');

function isAuth(req, res, next){
	if (req.isAuthenticated()) {  
		next();
	} else {
		res.redirect('/administrator/login');
	}
}

router.get('/administrator/:user_id', isAuth, function(req, res) {
    var user_id = req.params.user_id;
    adminuser.findOne({_id: user_id}, function(err, user) {
        if(err){
            res.send({error: 'no user find'});
        }
		res.send({
			user: user   
		});
		res.end();
	});
});

router.post('/administrator/:user_id/changepassword', isAuth, function(req, res) {
    var workflow = new events.EventEmitter();  //建立狀態機物件
    var user_id = req.params.user_id;
    
    workflow.outcome = {
        success: false,
        message: {}
    };
    
    workflow.on('validate',function(){    //設立一個狀態 validation
        if (!req.body.password) {
            workflow.outcome.message.password = 'required';
            return workflow.emit('response');
        }

        if (!req.body.confirm) {
            workflow.outcome.message.confirm = 'required';
            return workflow.emit('response');
        }

        if (req.body.password !== req.body.confirm) {
            workflow.outcome.message.nomatch = 'Passwords do not match.';
            return workflow.emit('response');
        }
        
        workflow.emit('changepassword');
    });
    
    workflow.on('changepassword',function(){    //設立一個狀態 validation
        
        var newpassword = req.body.password;
        var newpasswordsha1 = crypto.createHash('sha1').update(newpassword).digest("hex");
        
        adminuser.update({_id: user_id}, {    
            password: newpasswordsha1
        }, function(err, numAffected) {  //修改成功後回傳修改筆數
            if(!err){
                workflow.outcome.success = true;
                workflow.outcome.message.numAffected = numAffected;
                workflow.emit('response');
            }
        });
    });
    
    workflow.on('response',function(){
        return res.send(workflow.outcome);
    });
    
    return workflow.emit('validate');
});


module.exports = router;
