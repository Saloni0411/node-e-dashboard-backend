const express = require('express')
const router = express.Router()
const User = require('../Models/userModel')
const Product = require('../Models/productModel')
const Jwt = require('jsonwebtoken');
const jwtKey = 'e-com'

router.post('/register', async(req, res)=>{
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    Jwt.sign({result}, jwtKey,{expiresIn: '2h'}, (err, token) => {
        if(err) {
            res.send({result: "Something went wrong"});
        }
        res.send({result, token: token})
    })
})

router.post('/login', async(req, res) => {
    let user = await User.findOne(req.body).select("-password");
    if(req.body.password && req.body.email) {
        if(user) {
            Jwt.sign({user}, jwtKey,{expiresIn: '2h'}, (err, token) => {
                if(err) {
                    res.send({result: "Something went wrong"});
                }
                res.send({user, token: token})
            })
        } else {
            res.status(404).send({result: 'No user found'})
        }
    } else {
        res.status(404).send({result: 'No user found'})
    }
})

router.post("/add-product", verifyToken, async(req, res) => {
    let product = new Product(req.body);
    let result = await product.save()
    res.send(result)
})

router.get("/products", verifyToken, async(req, res)=> {
    let products = await Product.find();
    if(products.length > 0) {
        res.send(products)
    } else {
        res.send({result: "No product found"})
    }
})

router.delete("/product/:id",verifyToken, async(req, res)=>{
    const result = await Product.deleteOne({_id: req.params.id });
    res.send(result)
})

router.get("/product/:id", verifyToken, async(req, res) => {
    let result = await Product.findOne({_id: req.params.id});
    if(result) {
        res.send(result)
    } else {
        res.status(404).send({result: "No record found."})
    }
})

router.put("/product/:id", verifyToken, async(req, res) => {
    let result = await Product.updateOne(
        {_id: req.params.id},
        {
            $set : req.body
        }
        )
        res.send(result);
})

router.get('/search/:key',verifyToken, async(req, res) => {
    let result = await Product.find({
        "$or": [
            {name: {$regex: req.params.key}},
            {company: {$regex: req.params.key}},
            {category: {$regex: req.params.key}},
        ]
    });
    res.send(result)
})

function verifyToken(req, res, next) {
    let token = req.headers['authorization'];
    if(token) {
        token = token.split(' ')[1];
        Jwt.verify(token, jwtKey, (err, valid)=> {
            if(err) {
                res.status(401).send({result: "Please provide valid token"});
            }else {
                next();
            }
        })
    } else {
        res.status(403).send({result: "Please add token with header"});
    }
}

module.exports = router;

