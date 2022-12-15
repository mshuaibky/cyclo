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
    try {
      
      if(req.session.loggedIn){
        res.locals.loggedIn=true
      }
      let user = req?.session?.user
  
      let banners=await   productHelpers.getAllBaners()
    
        let cartcount = await userHelpers.getCartCount(req?.session?.user?._id)
        res.render('index', { user, nav: true, footer: true, cartcount,banners });
    } catch (error) {
      res.render('error',{error:error.message})
    }
  
    
    
  },

  shopPage: async (req, res) => {
    try {
      
      if(req.session.loggedIn){
        res.locals.loggedIn=true
      }
      let cartproducts = await userHelpers.getCartProducts(req?.session?.user?._id)
  
      let cartcount = await userHelpers.getCartCount(req?.session?.user?._id)
      productHelpers.getAllProducts().then((products) => {
     
          res.render('shop', { nav: true, footer: true, products, cartcount,cartproducts })
       
        
      
      })
    } catch (error) {
      res.render('error',{error:error.message})
    }
  },

  productPage: async (req, res) => {
    try {
      
      let cartcount = await userHelpers.getCartCount(req?.session?.user?._id)
      let product = req?.params?.id
      productHelpers.getproductdetails(product).then((productid) => {
  
      
          res.render('products', { nav: true, footer: true, productid, cartcount })
    
         
       
      }).catch((error)=>{
        res.render('error',{error:error.message})
      })
    } catch (error) {
      res.render('error',{error:error.message})
    }
  },


  aboutPages: function (req, res) {
   
      res.render('about', { nav: true, footer: true })
    
    
  },

  addTocartPage: function (req, res) {
    // console.log("api call");
    
      userHelpers.addToCart(req?.params?.id, req?.session?.user?._id).then(() => {

        res.json({ status: true })
      }).catch((error)=>{
        res.send({error:error.message})
      })

   
  },
  cartPage: async (req, res) => {
    try {
      
      let cartcount = await userHelpers.getCartCount(req?.session?.user?._id)
      let cartproducts = await userHelpers.getCartProducts(req?.session?.user?._id)
      totalAmount = await userHelpers.getTotalAmount(req?.session?.user?._id)
      res.render('cart', { totalAmount, cartproducts, cartcount, nav: true })
    } catch (error) {
      res.render('error',{error:error.message})
    }

    
  },


  // >>>>>>>>>>>>>>>  user login   <<<<<<<<<<<<<<<<<//

  userLoginGet: function (req, res, next) {
    try {
      
      if (req.session.loggedIn) {
        res.redirect('/')
      } else {
        res.render('userLogin', { nav: false, footer: false })
  
  
      }
    } catch (error) {
      res.render('error',{error:error.message})
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
    try {
      
      userHelpers.changeProductCount(req.body).then(async (response) => {
  
        response.total = await userHelpers.getTotalAmount(req?.session?.user?._id)
  
  
        res.json(response)
      })
    } catch (error) {
      res.json({error:error.message})
    }
  },
  deleteCartProduct: (req, res) => {
    try {
      
      userHelpers.deleteProductInCart(req.body).then((response) => {
        res.json(response)
      }).catch((error)=>{
       
        res.send({error:error.message})
      })
    } catch (error) {
      res.send({error:error.message})
    }
  },

  checkOut: async (req, res) => {
    try {
      
      let coupons=await couponHelpers.getAllCoupons()
       
      let cartproducts = await userHelpers.getCartProducts(req?.session?.user?._id)
      let address = await userHelpers.getAddress(req?.session?.user?._id)
     
      let totalamount = await userHelpers.getTotalAmount(req?.session?.user?._id)
  
      res.render('checkout', {coupons, totalamount, address, cartproducts,clientId:process.env.PAYPAL_CLIENT_ID })
    } catch (error) {
      res.render('error',{error:error.message})
    }
  },
  placeOrder: async (req, res) => {
try {
  
  let totalamount = await userHelpers.getTotalAmount(req?.session?.user?._id)
  totalamount=totalamount-couponAmount
  req.body.userId = req?.session?.user?._id
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
      }).catch((error)=>{
        res.send({error:error.message})
      })
    }
  }).catch((error)=>{
    res.send({error:error.message})
  })
} catch (error) {
  res.send({error:error.message})
}

  },



  orders: async (req, res) => {
try {
  let Orders=await userHelpers.getOneOrder()
  res.render('orders', { Orders })
  
} catch (error) {
  res.render('error',{error:error.message})
}
  //   userHelpers.getorders(req.session.user._id).then((orderDetails) => {
  // console.log(orderDetails,'orders of user');
  //     
  //   })
  },
  cancelOrder: (req, res) => {
    try {
      
      userId=req.session.user._id
      console.log(userId,'cancelOrder id ');
      userHelpers.cancel(req.body,userId).then((response) => {
  
        res.json(response)
      }).catch((error)=>{
        res.send({error:error.message})
      })
    } catch (error) {
      res.send({error:error.message})
    }

  },

  success: (req, res) => {
    res.render('success')
  },
  fillAddress: (req, res) => {
    try {
      
      userId = req.session.user._id
      addressId = req.params.id
  
      userHelpers.addressFill(userId, addressId).then((data) => {
        res.send(data[0].address)
      }).catch((error)=>{
        res.send({error:error.message})
      })
    } catch (error) {
      res.send({error:error.message})
    }
  },
  razorpay:async (req,res) => {
    let totalamount = await userHelpers.getTotalAmount(req.session.user._id)
    userHelpers.varifyPayment(req.body).then((response)=>{
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{

        res.json({status:true})
      })
    }).catch((err)=>{
      res.json({status:failed,totalamount:totalamount})
    })
    
  },

  userAccount:async(req,res)=>{
    try {
      userId = req.session.user._id
    let userDetails=await userHelpers.getUser(userId)
     userHelpers.userAddress(userId).then((address)=>{
       res.render('user',{address:address[0],userDetails})
     }).catch((error)=>{
      res.render('error',{error:error.message})
     })
      
    } catch (error) {
      res.render('error',{error:error.message})
    }
      
    
  },
  deleteAddress:(req,res)=>{
    try {
      
      userId = req?.session?.user?._id
      userHelpers.addressRemove(req.body.addressId,userId).then((response)=>{
       res.json({status:true})
      }).catch((error)=>{
        res.send({error:error.message})
      })
    } catch (error) {
      res.send({error:error.message})
    }

  },
  addressEdit:(req,res)=>{
    try {
      userId=req?.session?.user?._id
      
      userHelpers.editAddress(userId,req.body).then(()=>{
        res.json({status:true})
      }).catch((error)=>{
        res.send({error:error.message})
      })
      
    } catch (error) {
      res.send({error:error.message})
    }

  },
  addAddress:(req,res)=>{
    userId=req?.session?.user?._id
    userHelpers.addressAdd(req.body,userId).then((response)=>{
    res.json(response)
    })
  },

  changeUserDetails:async(req,res)=>{
  
     
    user= await db.users.findOne({_id:req?.session?.user?._id})
    console.log(user,'our user');
    userHelpers.editUserDetails(req.body,user).then((response)=>{
      if(response?.acknowledged){
      res.json({status:true})
      }else{
        res.json({status:false})
      }
    }).catch((error)=>{
      reject(error)
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
   

  },

  addtoWishlist:(req,res)=>{
    try {
      let proId=req.params.id
      let userId=req.session.user._id
       userHelpers.addWishlist(proId,userId).then((response)=>{
       
         res.send(response)
         
       }).catch((error)=>{
         res.send({error:error.message})
       })
      }
     
      
     catch (error) {
      res.send({error:error.message})
    }
  },

  wishlistpage:async(req,res)=>{
    
    let cartcount = await userHelpers.getCartCount(req.session.user._id)
    let wishProducts=await userHelpers.getwishCount(req.session.user._id)
    res.render('wishlist',{nav:true,cartcount,wishProducts})
  },

  deleteWish:(req,res)=>{
    try {
      userHelpers.deleteWishpro(req.body).then((response)=>{
        res.send({status:true})
      }).catch((error)=>{
        res.send({error:error.message})
      })
      
    } catch (error) {
      res.send({error:error.message})
    }
  }
}