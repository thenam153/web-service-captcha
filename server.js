
var express = require('express')
var cors = require('cors')
var app = express()
var session    = require('express-session')
var passport = require('passport')
var bodyParser = require('body-parser')
var path = require('path');
var env       = process.env.NODE_ENV || "development";
var config    = require(path.join(__dirname, '.','app', 'config', 'config.json'))[env];
const port = config.server
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
// app.use(bodyParser.raw())
app.use(session({ secret: 'bo may thang ngu', resave: true, saveUninitialized:true })); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())
app.set('views', path.join(__dirname, 'public'))
app.set('view engine', '.ejs');


var models = require("./app/models");

models.user.hasMany(models.key)
models.key.belongsTo(models.user)

models.user.hasOne(models.token)
models.token.belongsTo(models.user)


require('./app/config/passport/passport.js')(passport, models.user);
// models.sequelize.sync({force: true}).then(function(){

models.sequelize.sync({}).then(function(){
    console.log('Nice! Database looks fine')
}).catch(function(err){
    console.log(err,"Something went wrong with the Database Update!")
});

var authentication = require('./app/routes/authentication');
var user = require('./app/routes')
var api = require('./app/routes/api')
app.use('/api', api)
app.use('/', authentication)
app.use('/', user)
app.use(function(req, res) {
    // res.set({ 'content-type': 'application/json; charset=utf-8' });
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }
    return res.redirect('/dangnhap')
    // res.status(404).end('Vào nhầm rồi bạn ơi');
});
app.listen(port, (err) => {
    if(err) console.log(err)
    console.log(`run in port ${port}`)
})
