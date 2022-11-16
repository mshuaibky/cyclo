var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/productHelpers')
var adduserHelpers = require('../helpers/addingUserHelpers')
var db = require('../config/connection');
const { product, users } = require('../config/connection');
var adminHelpers=require('../helpers/adminHelpers')
const data=require('../config/admindetails');
const { DayInstance } = require('twilio/lib/rest/bulkexports/v1/export/day');
const { TrustProductsEvaluationsList } = require('twilio/lib/rest/trusthub/v1/trustProducts/trustProductsEvaluations');
const adminController=require('../controlers/admincontroller');



 
/* GET users listing. */
router.get('/',adminController.adminDashBoard);


router.get('/allProduct',adminController.adminAllProducts );


router.get('/allUsers',adminController.adminUsers );


router.get('/addUser',adminController.adminAddUsersGet );



router.post('/adduser',adminController.adminAddUsersPost)




// add products form 
router.get('/addProduct',adminController.adminAddProductGet  )



router.post('/allProduct',adminController.adminAllProductsPost )






router.get('/editProduct/:id',adminController.editProducts)



router.post('/editProduct/:id',adminController.editProductsPost)


router.get('/deleteProduct/:id',adminController.deleteProductsGet)


router.get('/blockuser/:id',adminController.blockUser)


router.get('/unblockUser/:id',adminController.unblockUser)

// ..................catagory managment..................................>

router.get('/catagory',adminController.catagory)

router.get('/addCatagory',adminController.addCatagoryGet)
  
router.post('/addCatagory',adminController.addCatagoryPost)


router.get('/deleteCatagory/:id',adminController.deleteCatagry)

router.get('/editCatagory/:id',adminController.editCatagoryGet)

router.post('/editCatagory/:id',adminController.editCatagoryPost)

//............... admin login...........................>

router.get('/adminlogin',adminController.adminLoginGet)

router.post('/adminlogin',adminController.adminLoginPost)

router.get('/adminlogout',adminController.adminLogout)

router.get('/adminOrders',adminController.adminOrders)




module.exports = router;
