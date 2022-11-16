var express = require('express');
const controller=require('../controlers/userscontroller')
var router = express.Router();
const userHelpers=require('../helpers/userHelpers')
var db = require('../config/connection');
var otp=require('../config/otp');
const productHelpers = require('../helpers/productHelpers');
var client=require('twilio')(otp.accountsId,otp.authToken)



/* GET home page. */


router.get('/',controller.landingPage);


router.get('/shop',controller.shopPage);



router.get('/products/:id',controller.productPage)


router.get('/about',controller.aboutPages)


router.get('/cart',controller.cartPage)

router.get('/addtocart/:id',controller.addTocartPage)

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

router.get('/checkout',controller.checkOut)

router.post('/checkout',controller.placeOrder)

router.get('/orders',controller.orders)

router.post('/cancelOrder',controller.cancelOrder)

router.get('/success',controller.success)

router.get('/filladdres/:id',controller.fillAddress)


module.exports = router;
