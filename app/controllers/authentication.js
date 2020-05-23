module.exports = {
    dangnhap: function(req, res) {
        res.render('login', {title: "Tesst"})
    },
    dangky: function(req, res) {
        res.render('register', {title: "Đăng ký"})
    },
    dangxuat: function(req, res) {
        req.logout();
        res.redirect('/');
    }
}