const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: req.body.password
    });
    User.find({email: req.body.email})
    .exec()
    .then(usersFound => {
        if(usersFound.length >=1) {
            return res.status(409).json({
                message: 'User with same email exists'
            })
        }else{
            user.save()
            .then(result => {
                res.status(201).json({
                    message: 'User created'
                })
            })
            .catch(err => {
                res.status(500).json({error: err});
            });
        }
    });
});

router.get('/', (req, res, next) => {
    User.find()
    .select('_id email')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            users: docs.map(doc => {
                return {
                    id: doc._id,
                    email: doc.email
                }
            })
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
});

router.delete('/:userEmail', (req, res, next) => {
    const email = req.params.userEmail;
    User.remove({email: email}).exec()
    .then(result => {
        res.status(200).json({
            message: 'User deleted'
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email})
    .exec()
    .then(user => {
        if(user.length < 1){
            return res.status(404).json({
                message: 'Authorisation failed'
            });
        }else{
            if(user[0].password != req.body.password){
                return res.status(404).json({
                    message: 'Authorisation failed'
                });
            }else{
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id
                }, "bbJqUS9TSqB5H6sM", {
                    expiresIn: "1h"
                });
                res.status(200).json({
                    message: 'Auth successful',
                    token: token
                });
            }
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
});

module.exports = router;