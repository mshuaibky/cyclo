var express = require('express');
const controller=require('../controlers/userscontroller')
var router = express.Router();
const userHelpers=require('../helpers/userHelpers')
var db = require('../config/connection');
var otp=require('../config/otp');
const productHelpers = require('../helpers/productHelpers');
var client=require('twilio')(otp.accountsId,otp.authToken)



/* GET home page. */

 const varifyLogin= (req,res,next)=>{
    if(req.session?.loggedIn){
       res.locals.loggedIn=true
        next()
    }else{
      res.redirect('/userLogin')
    }
}


router.get('/',controller.landingPage);


router.get('/shop',controller.shopPage);



router.get('/products/:id',varifyLogin,controller.productPage)


router.get('/about',varifyLogin,controller.aboutPages)


router.get('/cart',varifyLogin,controller.cartPage)

router.get('/addtocart/:id',varifyLogin,controller.addTocartPage)

router.get('/wishlist',varifyLogin,controller.wishlistpage)

router.post('/deletewish',controller.deleteWish)

router.get('/addtowishlist/:id',varifyLogin,controller.addtoWishlist)

router.get('/userLogin',controller.userLoginGet)

router.post('/userLogin',controller.userLoginPost)

router.get('/signUp',controller.userSignUpGet)

router.post('/signUp',controller.userSignUpPost)

router.get('/logout',controller.userLogout)

//................... otp login......................>
router.get('/otp',controller.userOtpGet)

router.get('/otp-login',controller.userOtpPost)

router.get('/otpVerify',controller.otpVarifyGet)

router.post('/changeProductQuantity',controller.changeproductquntity)

router.post('/deleteCartProduct',controller.deleteCartProduct)

router.get('/checkout',varifyLogin,controller.checkOut)

router.post('/checkout',controller.placeOrder)

router.get('/orders',varifyLogin,controller.orders)

router.post('/cancelOrder',controller.cancelOrder)

router.get('/success',controller.success)

router.get('/filladdres/:id',controller.fillAddress)

router.post('/varifyPayment',controller.razorpay)

router.get('/useraccount',varifyLogin,controller.userAccount)

router.post('/deleteAddress',controller.deleteAddress)

router.post('/addressedit',controller.addressEdit)

router.post('/addNewAddress',controller.addAddress)

router.post('/changeUserDetails',controller.changeUserDetails)

router.post('/create-order',controller.paypalOrder)

router.get('/paypalSuccess',controller.paypalSuccess)

router.get('/produnct-quantity/:id',controller.productQuantity)

router.post('/returnOrder',controller.returnOrder)

router.post('/downloadInvoice/:id',controller.findOrder)

router.get('/detailOrder/:id',controller.detailOrder)

router.post('/applycoupon',controller.applyCoupon)

router.get('/Shopnow',controller.findOfferdProduct),

router.get('/catagory',controller.cataProdect)

router.get('/cata',controller.cataproduct)






module.exports = router;
