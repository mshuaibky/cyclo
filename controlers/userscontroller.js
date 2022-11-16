var express = require('express');

var router = express.Router();
const userHelpers=require('../helpers/userHelpers')
var db = require('../config/connection');
var otp=require('../config/otp');
const productHelpers = require('../helpers/productHelpers');
var client=require('twilio')(otp.accountsId,otp.authToken)


module.exports={
//>>>>>>>>>>>>>>>>>>>>>>>>>>>   pages   <<<<<<<<<<<<<<<<<<<<<<<<//
landingPage:async (req, res) =>{
  
    let user=req.session.user
    
    if(req.session.loggedIn){
      console.log(req.session.id);
    let cartcount= await userHelpers.getCartCount(req.session.user._id)
    res.render('index',{user,nav:true,footer:true,cartcount});
    }else{
      res.redirect('/userLogin')
    }
  },

shopPage:async(req,res)=>{
 
  let cartcount= await userHelpers.getCartCount(req.session.user._id)
  productHelpers.getAllProducts().then((products)=>{
    if(req.session.loggedIn){
      console.log(cartcount);
      res.render('shop',{nav:true,footer:true,products,cartcount})
    }
    else{
      res.redirect('/userLogin')
    }
  })
  },

  productPage: async(req,res)=>{
    let cartcount= await userHelpers.getCartCount(req.session.user._id)
    let product=req.params.id
    productHelpers.getproductdetails(product).then((productid)=>{
  
    if(req.session.loggedIn){
    res.render('products',{nav:true,footer:true,productid,cartcount})
    }else{
      res.redirect('/userLogin')
    }
  })
  },


aboutPages:function(req,res,next){
    if(req.session.loggedIn){
    res.render('about',{nav:true,footer:true})
    }
    else{
      res.redirect('/userLogin')
    }
  },

addTocartPage:function(req,res){
  // console.log("api call");
    if(req.session.loggedIn){
      userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
        
       res.json({status:true})           
      })
    
    }
    else{
      res.redirect('/userLogin')
    }
  },
cartPage:async(req,res)=>{
  if(req.session.loggedIn){
    let cartcount= await userHelpers.getCartCount(req.session.user._id)
    let cartproducts=await userHelpers.getCartProducts(req.session.user._id)
    totalAmount= await  userHelpers.getTotalAmount(req.session.user._id)
  res.render('cart',{totalAmount,cartproducts,cartcount,nav:true})

  }else{
    res.redirect('/userLogin')
  }
},


// >>>>>>>>>>>>>>>  user login   <<<<<<<<<<<<<<<<<//
 
  userLoginGet:function(req,res,next){
    if(req.session.loggedIn){
      res.redirect('/')
    }else{
    res.render('userLogin',{nav:false,footer:false})
    
  
    }
  },

  userLoginPost:(req,res)=>{
    userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
     res.send({value:'success'})
    }else{
      res.send({value:'loginfailed'})
    }
    })
  },


  userSignUpGet:(req,res)=>{
    res.render('signUp',{nav:false,footer:false})
  
  },

  userSignUpPost:(req,res)=>{
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
  },

  userLogout:(req,res)=>{
    req.session.loggedIn=false
    res.redirect('/');
  },

  userOtpGet:(req,res)=>{
    res.render('otp',{nav:false,footer:false})
  },
userOtpPost:(req,res)=>{
  
 userHelpers.check(req.query.phonenumber).then((data)=>{

    if(data){
    client.verify.services(otp.serviceId).verifications.create
    ({
      to:`+91${req.query.phonenumber.trim()}`,
      channel:'sms'
    }).then((data)=>{
      res.status(200).send(data)
      res.send({value:'success'})
    })
}else{
    res.send({value:'failed'})
} 
    

 })
  
   
  },
  otpVarifyGet:(req,res)=>{
  
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
      
    },
    changeproductquntity:(req,res)=>{
      userHelpers.changeProductCount(req.body).then(async(response)=>{

      response.total= await  userHelpers.getTotalAmount(req.session.user._id)
          
        
        res.json(response)   
      })
    },
    deleteCartProduct:(req,res)=>{
      
      userHelpers.deleteProductInCart(req.body).then((response)=>{
        res.json(response)
      })
    },

    checkOut:async(req,res)=>{
      let cartproducts=await userHelpers.getCartProducts(req.session.user._id)
 let address=await   userHelpers.getAddress(req.session.user._id)
    let totalamount= await userHelpers.getTotalAmount(req.session.user._id)
    
      res.render('checkout',{totalamount,address,cartproducts})
    },
    placeOrder:async(req,res)=>{
let totalamount=await userHelpers.getTotalAmount(req.session.user._id)

     req.body.userId=req.session.user._id
    userHelpers.placeOrder(req.body,totalamount).then((response)=>{
      res.json(response)
    })
 
    },

    orders:async(req,res)=>{
     
      userHelpers.getorders(req.session.user._id).then((ordersitems)=>{

       res.render('orders',{ordersitems})
     })
    },
    cancelOrder:(req,res)=>{
      console.log("data",req.body);
      userHelpers.cancel(req.body).then((response)=>{
        
          res.json(response)
      })
        
    },

success:(req,res)=>{
  res.render('success')
},
fillAddress:(req,res)=>{
  userId=req.session.user._id
  addressId=req.params.id
 
  userHelpers.addressFill(userId,addressId).then((data)=>{
    res.send(data[0].address)
  })
}
}