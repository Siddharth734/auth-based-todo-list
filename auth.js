const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

function auth(req,res,next) {
    const token = req.headers.authorization;

    if(token){
        jwt.verify(token,JWT_SECRET,(err,decoded) => {
            if(err){
                res.status(401).send({
                    message: "Unauthorized User"
                })
            }else{
                req.id = decoded.id;
                next();
            }
        });

    }else{
        res.status(401).send({
            message: `Invalid User`
        })
    }
}

module.exports = {
    auth,
    JWT_SECRET
}