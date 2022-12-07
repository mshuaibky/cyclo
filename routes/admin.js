var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/productHelpers')
var adduserHelpers = require('../helpers/addingUserHelpers')
var db = require('../config/connection');
const { product, users } = require('../config/connection');
var adminHelpers = require('../helpers/adminHelpers')
const data = require('../config/admindetails');
const { DayInstance } = require('twilio/lib/rest/bulkexports/v1/export/day');
const { TrustProductsEvaluationsList } = require('twilio/lib/rest/trusthub/v1/trustProducts/trustProductsEvaluations');
const adminController = require('../controlers/admincontroller');

const multer = require('multer');

const storage = multer.diskStorage({
    // Destination to store image     
    destination: (req, file, cb) => {
        cb(null, 'public/product-images')
    },
    filename: (req, file, cb, error) => {
        if (error) {
            console.log(error);
        }
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage })

const storage2 = multer.diskStorage({
    // Destination to store image     
    destination: (req, file, cb) => {
        cb(null, 'public/assets/banner-images')
    },
    filename: (req, file, cb, error) => {
        if (error) {
            console.log(error);
        }
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload2 = multer({ storage: storage2 })



/* GET users listing. */
router.get('/', adminController.adminDashBoard);


router.get('/allProduct', adminController.adminAllProducts);


router.get('/allUsers', adminController.adminUsers);


router.get('/addUser', adminController.adminAddUsersGet);



router.post('/adduser', adminController.adminAddUsersPost)




// add products form 
router.get('/addProduct', adminController.adminAddProductGet)



// router.post('/addProduct',adminController.adminAddProductsPost )
router.post('/addProduct', upload.array('Image'),adminController.adminAddProductsPost)





router.get('/editProduct/:id', adminController.editProducts)



router.post('/editProduct/:id',upload.array('Image'), adminController.editProductsPost)


router.get('/deleteProduct/:id', adminController.deleteProductsGet)


router.get('/blockuser/:id', adminController.blockUser)


router.get('/unblockUser/:id', adminController.unblockUser)

// ..................catagory managment..................................>

router.get('/catagory', adminController.catagory)

router.get('/addCatagory', adminController.addCatagoryGet)

router.post('/addCatagory', adminController.addCatagoryPost)


router.get('/deleteCatagory/:id', adminController.deleteCatagry)

router.get('/editCatagory/:id', adminController.editCatagoryGet)

router.post('/editCatagory/:id', adminController.editCatagoryPost)

//............... admin login...........................>

router.get('/adminlogin', adminController.adminLoginGet)

router.post('/adminlogin', adminController.adminLoginPost)

router.get('/adminlogout', adminController.adminLogout)

router.get('/adminOrders', adminController.adminOrders)

router.get('/viewmore/:_id', adminController.viewMore)

router.post('/shippingStatus', adminController.changeShippingStatus)

router.get('/salesReport',adminController.salesReport)

router.get('/chartGraph',adminController.yearlyreport)

router.get('/couponmanagment',adminController.coupon)

router.get('/addcoupon',adminController.addCoupon)

router.post('/addcoupons',adminController.addCouponPost)

router.get('/deleteCoupon/:id',adminController.deleteCoupon)

router.get('/banermanagment',adminController.banermanagment)

router.get('/banermain',adminController.banermain)

router.post('/banersmain',upload2.array('image'),adminController.banermainpost)

router.get('/banermainTable',adminController.banertable)

router.get('/deletebanner/:id',adminController.deleteBanner)

router.get('/newarrivals',adminController.newArrival)


router.get('/generatecode',adminController.gernerateCode)



module.exports = router;
