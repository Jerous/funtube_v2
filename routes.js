'use strict';

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.set('X-Auth-Required', 'true');
  req.session.returnUrl = req.originalUrl;
  res.redirect('/login/');
}

exports = module.exports = function(app, passport) {
  
  //front end 
  app.use('/', require('./routes/index'));
  /*app.use('/users', require('./routes/users'));*/

  //sign up
  //app.get('/signup/', require('./routes/signup/index').init);
  /*app.post('/signup/', require('./routes/signup/index').signup)

  //route not found
  app.all('*', require('./routes/http/index').http404);*/
};
