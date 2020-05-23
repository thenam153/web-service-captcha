var express = require('express')
var router = express.Router()
var passport = require('passport')
var checkAuth = require('../config/auth')
var ctrlAuth = require('../controllers/authentication')


router.get('/dangky', checkAuth.forward, ctrlAuth.dangky)

router.post('/dangky', checkAuth.forward, passport.authenticate('signup', 
{ 
    successRedirect: '/trang-chu',
    failureRedirect: '/dangky'
}))
router.get('/dangnhap', checkAuth.forward, ctrlAuth.dangnhap)

router.post('/dangnhap', checkAuth.forward, passport.authenticate('signin', 
{ 
    successRedirect: '/trang-chu',
    failureRedirect: '/dangnhap'
}))

router.get('/dangxuat', checkAuth.auth, ctrlAuth.dangxuat)
router.post('/dangxuat', checkAuth.auth, ctrlAuth.dangxuat)


module.exports = router