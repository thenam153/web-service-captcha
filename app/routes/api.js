var express = require('express')
var router = express.Router()
var models = require("../models")
var checkAuth = require('../config/auth')
const axios = require('axios');

const formUrlEncoded = x =>
   Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')
   
router.post('/captcha', (req, res) => {

    if(req.body && req.body.key) {
        models.key.findOne({where: {
            key: req.body.key
        }})
        .then(key => {
            if(key.captcha <= 0) {
                return res.send("Key is invalid!")
            }
            axios({
                method: 'post',
                url: 'http://localhost:4000/postnow',
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
                res.send(""+response.data)
            })
            .catch(() => {
                res.send("error")
            })
        })
        .catch(() => {
            res.send("Key is invalid 1")
        })
    }else {
        res.send("Key is invalid 2")
    }
})

router.get("/check", (req, res) => {
    return res.render('checkkey')
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
module.exports = router