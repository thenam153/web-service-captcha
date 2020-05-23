var express = require('express')
var router = express.Router()
var keyController = require("../controllers/keyController")
var models = require("../models")
var checkAuth = require('../config/auth')
var bCrypt = require('bcrypt-nodejs')
var isValidPassword = function(userPassword, password) {
    return bCrypt.compareSync(password, userPassword)
}
var generateHash = function(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(12), null)
}

router.get('/', checkAuth.auth, (req, res) => {
    res.render('key')
})

router.get('/trang-chu', checkAuth.auth, (req, res) => {
    res.render('key')
})

router.get('/cai-dat', checkAuth.auth, (req, res) => {
    res.render('caidat')
})

router.post('/user/password', checkAuth.api, (req, res) => {
    let {password, newPassword, reNewPassword} = req.body

    if(!password || !newPassword || !reNewPassword || newPassword != reNewPassword) {
        return res.status(400).json({error: true, message: "Bad request"})
    }

    models.user.findById(req.user.id)
    .then(user => {
        if(isValidPassword(user.password, password)) {
            user.password = generateHash(newPassword)
            user.save()
            .then(() => {
                res.json({message: "success"})
            })
        }else {
            return res.status(400).json({error: true, message: "Bad request"})
        }
    })
    .catch(() => {

    })

})
// router.get('/key', checkAuth.auth, (req, res) => {
//     res.render('key')
// })

// router.get('/lichsukey', checkAuth.auth, (req, res) => {
//     res.render('lichsu')
// })

router.post('/create/key', checkAuth.api, (req, res) => {
    if(!req.body || isNaN(Number.parseInt(req.body.captcha)) || Number.parseInt(req.body.captcha) < 0) {
        return res.status(400).json({error: true, message: "Bad request 1"})
    }
    models.user.findById(req.user.id)
    .then(async (user) => {
        if(user.captcha >= Number.parseInt(req.body.captcha)) {
            user.captcha -= Number.parseInt(req.body.captcha)
            await user.save()

            models.key.create({
                captcha: Number.parseInt(req.body.captcha),
                description: req.body.description,
                key: keyController.randomKey(50),
                userId: req.user.id
            })
            .then(key => {
                key.dataValues.userCaptcha = user.captcha;
                res.json({key: key})
            })
            .catch(err => {
                res.status(500).json({error: true, message: "Server get error"})
            })
        }else {
            res.status(400).json({error: true, message: "Bad request"});
        }
    })
    .catch(() => {
        res.status(400).json({error: true, message: "Bad request"});
    })
})
router.post('/edit/key', checkAuth.api, (req, res) => {
    if(!req.body.key || !req.body.key.id) {
        return res.status(400).json({error: true, message: "Bad request"})
    }
    let  myKey = req.body.key;
    models.key.findOne({where: {
        id: myKey.id,
        key: myKey.key,
        userId: req.user.id
    }})
    .then(async key => {
        if(!isNaN(Number.parseInt(myKey.captcha)) && req.user.captcha + key.captcha > Number.parseInt(myKey.captcha) && Number.parseInt(myKey.captcha) >= 0) {
            let user = await key.getUser();

            user.captcha = user.captcha + key.captcha - Number.parseInt(myKey.captcha)
            user.save()
            .then(() => {
                key.captcha = Number.parseInt(myKey.captcha)
                key.description = myKey.description
                return key.save()
            })
            .then(key => {
                let dataValues = key.get();
                console.log(dataValues)
                dataValues.userCaptcha = user.captcha;
                res.json({key: dataValues})
            })
        }
    })
})

router.post('/delete/key', checkAuth.api, (req, res) => {
    if(!req.body.key || !req.body.key.id) {
        return res.status(400).json({error: true, message: "Bad request"})
    }
    let  myKey = req.body.key;
    models.key.findOne({where: {
        id: myKey.id,
        key: myKey.key,
        userId: req.user.id
    }})
    .then(async key => {
        let user = await key.getUser();

        user.captcha = user.captcha + key.captcha;
        user.save()
        .then(() => {
            return key.destroy()
        })
        .then(id => {
            res.json({id: id, userCaptcha: user.captcha})
        })
    })
    .catch(() => {

    })
})

router.post('/reload/key', checkAuth.api, (req, res) => {
    if(!req.body.key || !req.body.key.id) {
        return res.status(400).json({error: true, message: "Bad request"})
    }
    let  myKey = req.body.key;
    models.key.findOne({where: {
        id: myKey.id,
        key: myKey.key,
        userId: req.user.id
    }})
    .then(key => {
        key.key = keyController.randomKey(50)
        key.save()
        .then(key => {
            res.json({key: key})
        })
    })
    .catch(() => {
        
    })
})

router.post('/get/key',  checkAuth.api, (req, res) => {
    models.user.findById(req.user.id)
    .then(user => {
        user.getKeys()
        .then(keys => {
            res.json({keys: keys})
        })
    })
})

router.post('/user/key', checkAuth.api, (req, res) => {
    let captcha = req.user.captcha;
    return res.json({captcha: captcha});
})


module.exports = router