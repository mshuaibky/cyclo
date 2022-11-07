var express = require('express');
const { response } = require('../app');
var router = express.Router();
const userHelpers=require('../helpers/userHelpers')
var db = require('../config/connection');
var otp=require('../config/otp');
const productHelpers = require('../helpers/productHelpers');
var client=require('twilio')(otp.accountsId,otp.authToken)



/* GET home page. */
router.get('/', function(req, res) {
  
  let user=req.session.user
  console.log(req.session.loggedIn);
  if(req.session.loggedIn){
  res.render('index',{user,nav:true,footer:true});
  }else{
    res.redirect('/userLogin')
  }
});
router.get('/shop',(req,res)=>{
  productHelpers.getAllProducts().then((products)=>{
    console.log(products);
  if(req.session.loggedIn){
    res.render('shop',{nav:true,footer:true,products})
  }
  else{
    res.redirect('/userLogin')
  }
})
})



router.get('/products/:id',function(req,res,next){
  let product=req.params.id
  productHelpers.getproductdetails(product).then((productid)=>{

  if(req.session.loggedIn){
  res.render('products',{nav:true,footer:true,productid,})
  }else{
    res.redirect('/userLogin')
  }
})
})


router.get('/about',function(req,res,next){
  if(req.session.loggedIn){
  res.render('about',{nav:true,footer:true})
  }
  else{
    res.redirect('/userLogin')
  }
})


router.get('/cart',function(req,res,next){
  if(req.session.loggedIn){
  res.render('cart',{nav:true,footer:true})
  }
  else{
    res.redirect('/userLogin')
  }
})

router.get('/userLogin',function(req,res,next){
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
  res.render('userLogin',{nav:false,footer:false})
  

  }
})

router.post('/userLogin',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
  if(response.status){
    req.session.loggedIn=true
    req.session.user=response.user
   res.send({value:'success'})
  }else{
    res.send({value:'loginfailed'})
  }
  })
})

router.get('/signUp',(req,res)=>{
  res.render('signUp',{nav:false,footer:false})

})

router.post('/signUp',(req,res)=>{
  console.log(req.body);
userHelpers.doSignup(req.body).then((response)=>{
  
  if(response.status){
    req.session.loggedIn=true
    
 res.send({value:'success'})
  }
 else{
  res.send({value:'signUp failed'})
 }
})
})

router.get('/logout',(req,res)=>{
  req.session.loggedIn=false
  res.redirect('/');
})

//................... otp login......................>
router.get('/otp',(req,res)=>{
  res.render('otp',{nav:false,footer:false})
})

router.get('/otp-login',(req,res)=>{
  
 
  
  client.verify.services(otp.serviceId).verifications.create
({
  to:`+91${req.query.phonenumber.trim()}`,
  channel:'sms'
}).then((data)=>{
  res.status(200).send(data)
})
 

})

router.get('/otpVerify',(req,res)=>{
  
client.verify.services(otp.serviceId).verificationChecks.create({
  to:`+91${req.query.phonenumber}`,
  code:req.query.code

}).then((data)=>{
  if(data.valid){
    req.session.loggedIn=true
    res.status(200)
  res.send({value:'success'})
  }
  res.send({value:"failed"})
})
.catch(err=>{
  res.send(err)
})
  
})




module.exports = router;
