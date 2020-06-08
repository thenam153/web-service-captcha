var express = require('express')
var router = express.Router()
var models = require("../models")
var checkAuth = require('../config/auth')
const axios = require('axios');
var env       = process.env.NODE_ENV || "development";
var config    = require('../config/config.json')[env];
const serverCaptcha = config["server-captcha"]
var server = 0;
var keyError = {};
var ipError = {};
let numKeyError = 0;
var bCrypt = require('bcrypt-nodejs')
var keyController = require("../controllers/keyController")

const formUrlEncoded = x =>
   Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')
   
router.post('/captcha/solve', (req, res) => {
    // console.log(req.body)
    var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);

    if(ipError[ip] && ipError[ip] > 5) {
        return res.send("Đm mày")
    }
    if(req.body && req.body.key) {
        if(keyError[req.body.key]) {
            if(ipError[ip] == undefined) {
                ipError[ip] = 0;
            }else {
                ipError[ip] ++;
            }
            numKeyError++;
            return res.send("error");
        }
        if(!req.body.key ||  !req.body.image) {
            if(ipError[ip] == undefined) {
                ipError[ip] = 0;
            }else {
                ipError[ip] ++;
            }
            keyError[req.body.key] = true;
            numKeyError++;
            return res.send("error");
        }
        models.key.findOne({where: {
            key: req.body.key
        }})
        .then(key => {
            if(key.captcha <= 0) {
                return res.send("error")
            }
            if(server < serverCaptcha.length - 1) {
                server++;
            }else {
                server = 0;
            }
            console.log(server)
            axios({
                method: 'post',
                url: `http://localhost:${serverCaptcha[server]}/postnow`,
                data: formUrlEncoded({
                    image: req.body.image
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                })
            .then(response => {
                if(response.data != 'error') {
                    key.captcha--;
                    key.save()
                }
                res.send("" + response.data)
            })
            .catch(() => {
                numKeyError++;
                res.send("error")
            })
        })
        .catch(() => {
            keyError[req.body.key] = true;
            res.send("error")
        })
    }else {
        res.send("error")
    }
})

router.post('/captcha', (req, res) => {
    // console.log(req.body)
    var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);

    if(ipError[ip] && ipError[ip] > 5) {
        return res.send("Đm mày")
    }
    if(req.body && req.body.key) {
        if(keyError[req.body.key]) {
            if(ipError[ip] == undefined) {
                ipError[ip] = 0;
            }else {
                ipError[ip] ++;
            }
            numKeyError++;
            return res.send("error");
        }
        if(!req.body.key ||  !req.body.image) {
            if(ipError[ip] == undefined) {
                ipError[ip] = 0;
            }else {
                ipError[ip] ++;
            }
            keyError[req.body.key] = true;
            numKeyError++;
            return res.send("error");
        }
        models.key.findOne({where: {
            key: req.body.key
        }})
        .then(key => {
            if(key.captcha <= 0) {
                return res.send("error")
            }
            if(server < serverCaptcha.length - 1) {
                server++;
            }else {
                server = 0;
            }
            console.log(server)
            axios({
                method: 'post',
                url: `http://localhost:${serverCaptcha[server]}/postnow`,
                data: formUrlEncoded({
                    image: req.body.image
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                })
            .then(response => {
                if(response.data != 'error') {
                    key.captcha--;
                    key.save()
                }
                res.send("" + response.data)
            })
            .catch(() => {
                numKeyError++;
                res.send("error")
            })
        })
        .catch(() => {
            keyError[req.body.key] = true;
            res.send("error")
        })
    }else {
        res.send("error")
    }
})

router.get("/check", (req, res) => {
    // var ip = req.headers['x-forwarded-for'] || 
    //  req.connection.remoteAddress || 
    //  req.socket.remoteAddress ||
    //  (req.connection.socket ? req.connection.socket.remoteAddress : null);
    // console.log(ip)
    return res.render('checkkey')
})
router.get("/number", (req, res) => {
    return res.send(numKeyError + " / " + Object.keys(ipError).length)
})
router.post("/check", (req, res) => {
    if(req.body.key) {
        models.key.findOne({where: {
            key: req.body.key
        }})
        .then(key => {
            return res.json({captcha: `Key captcha have ${key.captcha} request`})
        })
        .catch(() => {
            return res.json({captcha: "Key is invalid!"})
        })
    }else{
        return res.json({captcha: "Key is invalid!"})
    }
})

router.post("/create/key", (req, res) => {
    let username = req.body.username
    let password = req.body.password
    console.log(username, password)
    models.user.findOne({where: {username: username}})
    .then(async user => {
        if(!user || !bCrypt.compareSync(password, user.password)) return res.status(401).json({message: "Unauthorized"});
        if(user.captcha >= Number.parseInt(req.body.captcha)) {
            user.captcha -= Number.parseInt(req.body.captcha)
            await user.save()
            models.key.create({
                captcha: Number.parseInt(req.body.captcha),
                key: keyController.randomKey(64),
                userId: user.id,
                description: req.body.description
            })
            .then(key => {
                res.json({key: key.key, description: key.description})
            })
            .catch(err => {
                res.status(500).json({message: "Server get error"})
            })
        }else {
            res.status(400).json({message: "Bad request", captcha: user.captcha});
        }
    })
    .catch(err => {
        res.status(401).json({message: "Unauthorized"})
    })
})

router.post("/check/key", (req, res) => {
    if(req.body.key) {
        models.key.findOne({where: {
            key: req.body.key
        }})
        .then(key => {
            return res.json({number: key.captcha})
        })
        .catch(() => {
            return res.json({number: -1})
        })
    }else{
        return res.json({number: -1})
    }
})
module.exports = router