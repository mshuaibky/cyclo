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


/* GET users listing. */
router.get('/', function (req, res, next) {
  if(req.session.adminlogin){
    res.render('admin/admindash', { layout: 'admin/adminLayout',nav:true,sidebar:true});

  }
  else{
    res.redirect('/admin/adminlogin')
  }
});
// displaying products

router.get('/allProduct', function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {

    res.render('admin/allProduct', { layout: 'admin/adminLayout', products,nav:true,sidebar:true });

  })
});


router.get('/allUsers', function (req, res) {
  if(req.session.adminlogin){
  adduserHelpers.getAllUsers().then((users)=>{
    res.render('admin/allUsers', { layout: 'admin/adminLayout', users,nav:true,sidebar:true});
  })
  }
});


router.get('/addUser', function (req, res, next) {
  if(req.session.adminlogin){
  res.render('admin/addUser', { layout: 'admin/adminLayout',nav:true,sidebar:true });
  }
});
router.post('/adduser',function(req,res){
adduserHelpers.addUsers(req.body).then((userData)=>{
  console.log(userData);
  res.redirect('/admin/allusers')
})
})




// add products form 
router.get('/addProduct',  function (req, res, next) {
  if(req.session.adminlogin){
  productHelpers.getallCatagory().then((catagory)=>{

  res.render('admin/addProduct', {catagory, layout: 'admin/adminLayout',nav:true,sidebar:true });
  
});
  }
})



router.post('/allProduct', function (req, res) {
  productHelpers.addproduct(req.body).then((insertedId) => {
    console.log(req.body);
    let Image = req.files.Image
    let imageName = insertedId
    Image.mv('./public/productimages/' + imageName + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/allProduct')
      }
      else {
        console.log(err);
      }
    })


  })
})






router.get('/editProduct/:id', async (req, res,next) =>{
  if(req.session.adminlogin){
  let product= await productHelpers.getproductdetails(req.params.id)
  console.log(product);
  productHelpers.getallCatagory().then((catagory)=>{


 
  res.render('admin/editProduct', { layout: 'admin/adminLayout' ,product,catagory,nav:true,sidebar:true});
  })
  }

  })



router.post('/editProduct/:id',(req,res)=>{


  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    let Image=req.files.Image
    let imageName=req.params.id
    Image.mv('./public/productimages/'+imageName+'.jpg',(err,done)=>{
      if(!err){
        res.redirect('/admin/allProduct')
      }
      else{
        console.log(err)
      }
    })
  })
  
  
})


router.get('/deleteProduct/:id',function(req,res){
  if(req.session.adminlogin){
 let proId=req.params.id
 console.log(proId);
 productHelpers.deleteProducts(proId).then((response)=>{
  res.redirect('/admin/allproduct')
 })
  }
})


router.get('/blockuser/:id',(req,res)=>{
adduserHelpers.blockUser(req.params.id).then((user)=>{
  console.log(user);
  res.redirect('/admin/allUsers')
})
})


router.get('/unblockUser/:id',(req,res)=>{
  adduserHelpers.unblockUser(req.params.id).then((user)=>{
    console.log(user);
    res.redirect('/admin/allUsers')
  })
})

// ..................catagory managment..................................>

router.get('/catagory',(req,res)=>{
  if(req.session.adminlogin){
  productHelpers.getallCatagory().then((catagory)=>{
    console.log(catagory);
    res.render('admin/catagory',{layout: 'admin/adminLayout',catagory,nav:true,sidebar:true})

  })
}
})

router.get('/addCatagory',(req,res)=>{
  res.render('admin/addCatagory',{layout: 'admin/adminLayout',nav:true,sidebar:true})
  })
  
router.post('/addCatagory',(req,res)=>{
  productHelpers.addCatagory(req.body).then((data)=>{
    console.log(data);
res.redirect('/admin/catagory')
  })
})


router.get('/deleteCatagory/:id',(req,res)=>{
let catagory=req.params.id
productHelpers.deleteCatagory(catagory).then((response)=>{
  res.redirect('/admin/Catagory')
  
})
})

router.get('/editCatagory/:id',async (req,res)=>{
  let catagory= await productHelpers.getCatdetails(req.params.id)
  console.log(catagory);
  res.render('admin/editCatagory',{layout: 'admin/adminLayout',catagory,nav:true,sidebar:true})
})

router.post('/editCatagory/:id',(req,res)=>{
  productHelpers.updateCatagory(req.params.id,req.body).then(()=>{
    res.redirect('/admin/catagory')
  })
 
})

//............... admin login...........................>

router.get('/adminlogin',(req,res)=>{
if(req.session.adminlogin){
  res.redirect('/admin')
}
else{
  res.render('admin/adminlogin',{layout:'admin/adminLayout'})
}
})

router.post('/adminlogin',(req,res)=>{
  console.log(req.body);
  adminHelpers.adminlogin(req.body).then((response)=>{
    if(response.status){
      req.session.adminlogin=true
      req.session.admin=data
      res.redirect('/admin')
    }else{
      req.session.loginErr=true
      res.redirect('/admin/adminlogin')
    }

  })
})

router.get('/adminlogout',(req,res)=>{
req.session.adminlogin=false
res.redirect('/admin')
})

module.exports = router;
