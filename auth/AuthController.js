var express= require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var User = require('../user/User');
var config = require('../config');
var path = require('path');



var checkAuth = function (req, res, next) {
	if (!req.session || !req.session.isLoggin) {
		res.redirect('login');
		return;
	}

	next();
};

router.get('/homepage', checkAuth, function(req, res) {
  res.sendFile(path.join(__dirname, '../view/html', 'main.html'));
});


router.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, './view/html', 'signin.html'));
});
var Auth = function(req, res, next) {
  if (req.session && req.session.isLoggin === true) {
    res.redirect('/homepage');
    return;
  }
  next()
}
router.get('/',Auth ,function(req, res){
   res.redirect('/login');
});



router.get('/register', function(req,res) {
  res.sendFile(path.join(__dirname, '../', 'index.html'));
});
router.post('/register', function(req, res){
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);

    User.create({
        email: req.body.email,
        password: hashedPassword
    },
    function(err, user) {
        if (err) {
            return res.status(500).send('There some thing err when register.');}
        else {
        var token= jwt.sign({id: user._id}, config.secret, {
            expiresIn: 86400
        });
        res.status(200).send({ auth: true, token: token});
        }
    });
    req.session.isLoggin = true;
});

router.post('/login/auth',function(req, res){
    User.findOne({email:req.body.email}, function(err, user){
        if(err) return res.status(500).send('Error on sever.');
        if(!user) return res.status(404).send('Not found user');

        var passwordIsValid =bcrypt.compareSync(req.body.password, user.password);
        if(!passwordIsValid) return res.status(401).send({auth:false});
        req.session.isLoggin = true;
        res.redirect('/homepage');
    }); 
});
router.get('/logout', function(req, res, next) {
    if (req.session) {
      req.session.destroy(function(err) {
        if(err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
  });
  

module.exports = router;
