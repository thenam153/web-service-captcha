module.exports = {
    auth: function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/dangnhap')
    },
    authAdmin: function(req, res, next) {
        if(req.isAuthenticated()) {
            if(req.user && req.user.level === 'admin') {
                return next()
            }
        }
        return res.redirect('/trang-chu')
    },
    forward: function(req, res, next) {
        if(req.isUnauthenticated()) {
            console.log('run run ')
            return next()
        }
        return res.redirect('/trang-chu')
    },
    api: function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }
        return res.status(401).json({error: true, message: "Authentication"})
    }
}