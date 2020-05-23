var bCrypt = require('bcrypt-nodejs')

module.exports = function(passport, User) {
    var LocalStrategy = require('passport-local').Strategy
    
    passport.serializeUser((user, done) => { done(null, user.id) })
    
    passport.deserializeUser((id, done) => {
        User.findById(id)
        .then((user) => {
            if(user) {
                return done(null, user.get())
            }
            done(user.errors, null)
        })
        .catch(err => {
            console.log(err)
            return done(err, null)
        })
    })

    passport.use('signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback : true
    }, (req, username, password, done) => {
        console.log('sign up')
        var generateHash = function(password) {
            return bCrypt.hashSync(password, bCrypt.genSaltSync(12), null)
        }
        User.findOne({where: {username: username}})
        .then(user => {
            if(user) {
                return done(null, false, {message: "Tên đăng nhập đã tồn tại"})
            }
            // if(password != req.body.repassword) {
            //     return done(null, false, {message: "Nhập lại mật khẩu không chính xác"})
            // }
            var userPassword = generateHash(password)
            var data = {
                email: req.body.email,
                username: username,
                password: userPassword,
                phone: req.body.phone
            }
            User.create(data)
            .then((newUser) => {
                if(!newUser) {
                    return done(null, false)
                }
                return done(null, newUser)
            })
        })
    }));

    passport.use('signin', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, (username, password, done) => {
        var isValidPassword = function(userPassword, password) {
            return bCrypt.compareSync(password, userPassword)
        }

        User.findOne({where: {username: username}})
        .then(user => {
            console.log("find user")
            if(!user) {
                console.log("error 1")
                return done(null, false, {message: 'Tài khoản không tồn tại'})
            }

            if(!isValidPassword(user.password, password)) {
                console.log("error 2")
                return done(null, false, {message: 'Mật khẩu không chính xác'})
            }

            var info = user.get()
            return done(null, info)
        })
        .catch(err => {
            return done(null, false, {message: "Good boy, lỗi rồi đấy"})
        })
    }))
}