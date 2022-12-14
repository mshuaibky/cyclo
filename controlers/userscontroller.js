require('dotenv').config()
var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/userHelpers')
var db = require('../config/connection');
var otp = require('../config/otp');
const productHelpers = require('../helpers/productHelpers');
var client = require('twilio')(otp.accountsId, otp.authToken)
let couponHelpers=require('../helpers/couponHelpers')
const { v4: uuidv4 } = require('uuid');

const paypal = require("@paypal/checkout-server-sdk")
const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
)
let couponAmount=0
module.exports = {
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>   pages   <<<<<<<<<<<<<<<<<<<<<<<<//

 

  landingPage: async (req, res) => {
    if(req.session.loggedIn){
      res.locals.loggedIn=true
    }
    let user = req.session.user

    let banners=await   productHelpers.getAllBaners()
  
      let cartcount = await userHelpers.getCartCount(req.session.user._id)
      res.render('index', { user, nav: true, footer: true, cartcount,banners });
  
    
    
  },

  shopPage: async (req, res) => {
    if(req.session.loggedIn){
      res.locals.loggedIn=true
    }
    let cartproducts = await userHelpers.getCartProducts(req.session.user._id)
    console.log(cartproducts,'namma carts products');
    let cartcount = await userHelpers.getCartCount(req.session.user._id)
    productHelpers.getAllProducts().then((products) => {
   
        res.render('shop', { nav: true, footer: true, products, cartcount,cartproducts })
     
      
    
    })
  },

  productPage: async (req, res) => {
    let cartcount = await userHelpers.getCartCount(req.session.user._id)
    let product = req.params.id
    productHelpers.getproductdetails(product).then((productid) => {

    
        res.render('products', { nav: true, footer: true, productid, cartcount })
  
       
     
    })
  },


  aboutPages: function (req, res) {
   
      res.render('about', { nav: true, footer: true })
    
    
  },

  addTocartPage: function (req, res) {
    // console.log("api call");
    
      userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {

        res.json({ status: true })
      })

   
  },
  cartPage: async (req, res) => {
    
      let cartcount = await userHelpers.getCartCount(req.session.user._id)
      let cartproducts = await userHelpers.getCartProducts(req.session.user._id)
      totalAmount = await userHelpers.getTotalAmount(req.session.user._id)
      res.render('cart', { totalAmount, cartproducts, cartcount, nav: true })

    
  },


  // >>>>>>>>>>>>>>>  user login   <<<<<<<<<<<<<<<<<//

  userLoginGet: function (req, res, next) {
    if (req.session.loggedIn) {
      res.redirect('/')
    } else {
      res.render('userLogin', { nav: false, footer: false })


    }
  },

  userLoginPost: (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true
        res.locals.loggedIn=true
        req.session.user = response.user
        res.send({ value: 'success'})
      } else {
        res.send({ value: 'loginfailed' })
      }
    })
  },


  userSignUpGet: (req, res) => {
    res.render('signUp', { nav: false, footer: false })

  },

  userSignUpPost: (req, res) => {
    console.log(req.body);
    userHelpers.doSignup(req.body).then((response) => {

      if (response.status) {
        req.session.loggedIn = true

        res.send({ value: 'success' })
      }
      else {
        res.send({ value: 'signUp failed' })
      }
    })
  },

  userLogout: (req, res) => {
    req.session.loggedIn = false
    res.redirect('/userLogin');
  },

  userOtpGet: (req, res) => {
    res.render('otp', { nav: false, footer: false })
  },
  userOtpPost: (req, res) => {

    userHelpers.check(req.query.phonenumber).then((data) => {

      if (data.length) {
        client.verify.services(otp.serviceId).verifications.create
          ({
            to: `+91${req.query.phonenumber.trim()}`,
            channel: 'sms'
          }).then((data) => {
           
            // res.status(200).send(data)
            res.send({ value: 'success' })
          })
      } else {
        res.send({ value: 'failed' })
      }


    })


  },
  otpVarifyGet: (req, res) => {

    client.verify.services(otp.serviceId).verificationChecks.create({
      to: `+91${req.query.phonenumber}`,
      code: req.query.code

    }).then((data) => {
      if (data.valid) {
        req.session.loggedIn = true
        res.status(200)
        res.send({ value: 'success' })
      }
      res.send({ value: "failed" })
    })
      .catch(err => {
        res.send(err)
      })

  },
  changeproductquntity: (req, res) => {
    userHelpers.changeProductCount(req.body).then(async (response) => {

      response.total = await userHelpers.getTotalAmount(req.session.user._id)


      res.json(response)
    })
  },
  deleteCartProduct: (req, res) => {

    userHelpers.deleteProductInCart(req.body).then((response) => {
      res.json(response)
    })
  },

  checkOut: async (req, res) => {
    let coupons=await couponHelpers.getAllCoupons()
      console.log(coupons,'checkout coupons');
    let cartproducts = await userHelpers.getCartProducts(req.session.user?._id)
    let address = await userHelpers.getAddress(req.session.user?._id)
   
    let totalamount = await userHelpers.getTotalAmount(req.session.user?._id)

    res.render('checkout', {coupons, totalamount, address, cartproducts,clientId:process.env.PAYPAL_CLIENT_ID })
  },
  placeOrder: async (req, res) => {

    let totalamount = await userHelpers.getTotalAmount(req.session.user._id)
    totalamount=totalamount-couponAmount
    req.body.userId = req.session.user._id
    userHelpers.placeOrder(req.body, totalamount,req.session.coupon).then(async(response) => {
     
   
      if (req.body.paymentMethod == 'cash') {
        couponAmount=0
        req.session.coupon=''
        res.json({ cod: true })
        
      }else if(req.body.paymentMethod=='paypal'){
            couponAmount=0
            req.session.coupon=''
            res.json({paypal:true})
      } 
      else {
        userHelpers.generateRazorpay(req.body,totalamount).then((response) => {
          couponAmount=0
          req.session.coupon=''
          res.json(response)
        })
      }
    })

  },



  orders: async (req, res) => {

    let Orders=await userHelpers.getOneOrder()
    res.render('orders', { Orders })
  //   userHelpers.getorders(req.session.user._id).then((orderDetails) => {
  // console.log(orderDetails,'orders of user');
  //     
  //   })
  },
  cancelOrder: (req, res) => {
    userId=req.session.user._id
    console.log(userId,'cancelOrder id ');
    userHelpers.cancel(req.body,userId).then((response) => {

      res.json(response)
    })

  },

  success: (req, res) => {
    res.render('success')
  },
  fillAddress: (req, res) => {
    userId = req.session.user._id
    addressId = req.params.id

    userHelpers.addressFill(userId, addressId).then((data) => {
      res.send(data[0].address)
    })
  },
  razorpay:async (req,res) => {
    let totalamount = await userHelpers.getTotalAmount(req.session.user._id)
    console.log(totalamount,'total amounttt');
    userHelpers.varifyPayment(req.body).then((response)=>{
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{

        res.json({status:true})
      })
    }).catch((err)=>{
      res.json({status:failed,totalamount:totalamount})
    })
    
  },
  userAccount:async(req,res)=>{
    userId = req.session.user._id
  let userDetails=await userHelpers.getUser(userId)
   userHelpers.userAddress(userId).then((address)=>{
     res.render('user',{address:address[0],userDetails})
   })
      
    
  },
  deleteAddress:(req,res)=>{
    userId = req.session.user._id
    console.log(req.body.addressId,userId,'users,add');
    userHelpers.addressRemove(req.body.addressId,userId).then((response)=>{
     res.json({status:true})
    })

  },
  addressEdit:(req,res)=>{
    userId=req.session.user._id
    console.log(req.body.addressId,'jhhjhjhj');
    userHelpers.editAddress(userId,req.body).then(()=>{
      res.json({status:true})
    })

  },
  addAddress:(req,res)=>{
    userId=req.session.user._id
    console.log(req.body,'new addresssss');
    userHelpers.addressAdd(req.body,userId).then((response)=>{
    res.json(response)
    })
  },

  changeUserDetails:async(req,res)=>{
  
    user= await db.users.findOne({_id:req.session.user._id})
    console.log(user,'our user');
    userHelpers.editUserDetails(req.body,user).then((response)=>{
      if(response?.acknowledged){
      res.json({status:true})
      }else{
        res.json({status:false})
      }
    })
   
  },

  paypalOrder:async(req,res)=>{
    const request = new paypal.orders.OrdersCreateRequest()
    const total = 1000

    request.prefer("return=representation")
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: total,
                    breakdown: {
                        item_total: {
                            currency_code: "USD",
                            value: total,
                        },
                    },
                }
            },
        ],
    })

    try {
        const order = await paypalClient.execute(request)
        res.json({ id: order.result.id })
    } catch (e) {
      
        res.status(500).json({ error: e.message })
    }
  },
  paypalSuccess:async(req,res)=>{
    console.log('paypal');
    const orderDetails=await db.order.find({userId:req.session.user._id})
    let orders=orderDetails[0].orders.reverse()
    let orderId=orders[0]._id
    
    userHelpers.changePaymentStatus(orderId).then((response)=>{
     
      res.json({status:true})
    })
  },
  productQuantity:(req,res)=>{
    userId=req.session.user._id
    proId=req.params.id
  
    userHelpers.findProductQuantity(proId,userId).then((quantity)=>{
      res.send(quantity)
    })
  },
  returnOrder:(req,res)=>{
    userId=req.session.user._id
    
   userHelpers.orderReturn(req.body,userId).then((response)=>{
    console.log(response,'ith verre response');
    res.send(response)
   })
  
  },
  findOrder:(req,res)=>{
    userId=req.session.user._id
    
   userHelpers.findOrder(req.params).then((data)=>{
    res.json({data:data[0]})
   })
  },
  detailOrder:async(req,res)=>{
    allOrders=await userHelpers.detailOrder(req.params)
    res.render('detailOrder',{allOrders })
  },

  applyCoupon:async(req,res)=>{
  req.session.coupon=req.body.couponId
 let couponId=req.body.couponId
  let totalamount = await userHelpers.getTotalAmount(req.session.user?._id)
    
 couponHelpers.couponApply(couponId,totalamount).then((data)=>{
   

   if(totalamount>=data.minPurchased){
    couponHelpers.addUserCoupon(req.session.user._id,couponId).then((e)=>{
      if(totalamount*data.discountPercentage/ 100 <= data.maxCount) {
        let couponTotal=(totalamount*data.discountPercentage/100)
        couponAmount=couponTotal

        res.send({status:true,couponAmount:couponAmount,totalamount:totalamount-couponAmount})
      }
      else{
        couponAmount=data.maxCount
        totalamount=totalamount-couponAmount

        res.send({
          status:true,
          couponAmount:couponAmount,
          totalamount:totalamount
        })
      }
    }).catch((e)=>{
      res.send({status:false,message:e})
    })
   }
   else{
    res.send({status:false,message:'Purchase More'})
   }
 })
  },
  findOfferdProduct:async(req,res)=>{
   
   let products=await userHelpers.offeredProduct(req.query)
   let cartcount = await userHelpers.getCartCount(req.session.user._id)

   let cartproducts = await userHelpers.getCartProducts(req.session.user._id)
      res.render('shop', { nav: true, footer: true,products,cartproducts,cartcount})
   

  }

}