const express = require("express");
require("./db/config");

const cors = require("cors");

const User = require("./db/User");
const Product = require('./db/Product')

const app = express();
const Jwt  = require('jsonwebtoken');
const jwtKey = 'e-comm';

app.use(express.json());
app.use(cors());


// APIs for register
app.post("/register", async (req, resp) => {
  let user = new User(req.body); // take data from postman
  let result = await user.save();

  result = result.toObject();
  delete result.password;
  Jwt.sign({result},jwtKey,{expiresIn:'2h'},(error , token)=>{
    if(error){
      resp.send({result :"something went wrong , please try after some time"})
    }
    resp.send({result,auth: token});

  })
});

// APIs for login 
app.post("/login", async (req, resp) => {
  console.log(req.body);
  if (req.body.email && req.body.password) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({user},jwtKey,{expiresIn:'2h'},(error , token)=>{
        if(error){
          resp.send({result :"something went wrong , please try after some time"})
        }
        resp.send({user,auth: token});

      })
     
    } else {
      resp.send({ result: "User Not Found " });
    }
  } else {
    resp.send({ result: "please enter email and passowrd " });
  }
});

// APIs for adding the product
app.post('/add-product' ,verifyToken ,async(req,resp)=>{
  let product = new Product(req.body);
  let result = await product.save();
  resp.send(result)
})

// APIs for  get the product
app.get('/products',verifyToken,async(req,resp)=>{
  let products = await Product.find();
  if(products.length>0) {
    resp.send(products)
  }
  else{
    resp.send({result:"No products found"})
  }
})

// APIs for  delete the product
app.delete('/product/:id',verifyToken ,async(req,resp)=>{

  const result =await Product.deleteOne({_id:req.params.id});
  resp.send(result);
})

// APIs for  update the product - use first get method to show prefil data in update components
app.get("/product/:id",verifyToken,async(req , resp)=>{
  let result = await  Product.findOne({_id:req.params.id});
  if(result){
    resp.send(result)
  }
  else{
    resp.send({resutl:"No record Found."})
  }
})

// APIs for update the product 
app.put('/product/:id' ,verifyToken,async(req ,resp)=>{
let result =  await Product.updateOne(
  {_id:req.params.id},
  {
    $set:req.body
  }
)
resp.send(result)
});


//Search API for Product
app.get('/search/:key' ,verifyToken, async(req,resp)=>{
  let result = await Product.find({
    "$or":[
      {name:{$regex:req.params.key}},
      {company:{$regex:req.params.key}},
      {category:{$regex:req.params.key}}
    ]
  })
  resp.send(result)

})


function verifyToken(req,resp ,next){
  let token = req.headers['authorization']
  if (token){
    token = token.split(' ')[1];
    Jwt.verify(token , jwtKey,(error , valid)=>{
      if(error){
        resp.status(401).send({result: "Please provide valid token"})
      }else{
        next();
      }
    })
  }else{
    resp.status(403).send({result: "Please add token with header"})
  }
  

}

app.listen(5000);
