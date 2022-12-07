
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/productHelpers')
var adduserHelpers = require('../helpers/addingUserHelpers')
var db = require('../config/connection');
const { product, users } = require('../config/connection');
var adminHelpers = require('../helpers/adminHelpers')
var couponHelpers = require('../helpers/couponHelpers')
const data = require('../config/admindetails');
// const { DayInstance } = require('twilio/lib/rest/bulkexports/v1/export/day');
// const { TrustProductsEvaluationsList } = require('twilio/lib/rest/trusthub/v1/trustProducts/trustProductsEvaluations');



module.exports = {

    //>>>>>>>>>>>>>>   adminpages    <<<<<<<<<<<<<<<<<//

    adminDashBoard: (req, res, next) => {
        if (req.session.adminlogin) {
            res.render('admin/admindash', { layout: 'admin/adminLayout', nav: true, sidebar: true });

        }
        else {
            res.redirect('/admin/adminlogin')
        }
    },


    adminAllProducts: (req, res, next) => {
        productHelpers.getAllProducts().then((products) => {

            res.render('admin/allProduct', { layout: 'admin/adminLayout', products, nav: true, sidebar: true });

        })
    },


    adminAddProductGet: (req, res, next) => {
        if (req.session.adminlogin) {
            productHelpers.getallCatagory().then((catagory) => {

                res.render('admin/addProduct', { catagory, layout: 'admin/adminLayout', nav: true, sidebar: true });

            });
        }
    },

    adminAddProductsPost: (req, res) => {

        console.log(req.body,'data bodyyyyy');
       console.log(req.files,'soorya');
    const files=req.files
    const filename=files.map((file)=>{
        return file.filename
    })
     
     const product=req.body
     product.image=filename
     productHelpers.addproduct(product).then((insertedId) => {
        console.log(insertedId,'test2');
       
         // let Image = req.files.Image
        
     res.redirect('/admin/allProduct')
 })

      
       
    },

    adminUsers: (req, res) => {
        if (req.session.adminlogin) {
            adduserHelpers.getAllUsers().then((users) => {
                res.render('admin/allUsers', { layout: 'admin/adminLayout', users, nav: true, sidebar: true });
            })
        }
    },


    adminAddUsersGet: (req, res, next) => {
        if (req.session.adminlogin) {
            res.render('admin/addUser', { layout: 'admin/adminLayout', nav: true, sidebar: true });
        }
    },

    adminAddUsersPost: (req, res) => {
        adduserHelpers.addUsers(req.body).then((userData) => {
            console.log(userData);
            res.redirect('/admin/allusers')
        })
    },

    editProducts: async (req, res, next) => {
        if (req.session.adminlogin) {
            let product = await productHelpers.getproductdetails(req.params.id)
            console.log(product);
            productHelpers.getallCatagory().then((catagory) => {



                res.render('admin/editProduct', { layout: 'admin/adminLayout', product, catagory, nav: true, sidebar: true });
            })
        }

    },

    editProductsPost: (req, res) => {


        productHelpers.updateProduct(req.params.id, req.body).then(() => {
           

            const files=req.files
             const filename=files.map((file)=>{
                return file.filename
             })

             const product=req.body
             product.image=filename
             productHelpers.addproduct(product).then((insertedId)=>{
               
                res.redirect('/admin/allproduct')
             })
        })


    },

    deleteProductsGet: (req, res) => {
        if (req.session.adminlogin) {
            let proId = req.params.id
            console.log(proId);
            productHelpers.deleteProducts(proId).then((response) => {
                res.redirect('/admin/allproduct')
            })
        }
    },

    blockUser: (req, res) => {
        adduserHelpers.blockUser(req.params.id).then((user) => {
            req.session.loggedIn=false
            console.log(user);
            res.redirect('/admin/allUsers')
        })
    },

    unblockUser: (req, res) => {
        adduserHelpers.unblockUser(req.params.id).then((user) => {
            console.log(user);
            res.redirect('/admin/allUsers')
        })
    },

    catagory: (req, res) => {
        if (req.session.adminlogin) {
            productHelpers.getallCatagory().then((catagory) => {
                //   console.log(catagory);
                res.render('admin/catagory', { layout: 'admin/adminLayout', catagory, nav: true, sidebar: true })

            })
        }
    },

    addCatagoryGet: (req, res) => {
        res.render('admin/addCatagory', { layout: 'admin/adminLayout', nav: true, sidebar: true })
    },
    addCatagoryPost: (req, res) => {
        productHelpers.addCatagory(req.body).then((data) => {
            if (data.status) {
                console.log('true');
                res.send({ value: 'success' })
            } else {
                console.log('false');
                res.send({ value: "failed" })
            }

        })
    },


    deleteCatagry: (req, res) => {
        let catagory = req.params.id
        productHelpers.deleteCatagory(catagory).then((response) => {
            res.redirect('/admin/Catagory')

        })
    },

    editCatagoryGet: async (req, res) => {
        let catagory = await productHelpers.getCatdetails(req.params.id)
        console.log(catagory);
        res.render('admin/editCatagory', { layout: 'admin/adminLayout', catagory, nav: true, sidebar: true })
    },

    editCatagoryPost: (req, res) => {
        productHelpers.updateCatagory(req.params.id, req.body).then(() => {
            res.redirect('/admin/catagory')
        })

    },

    // >>>>>>>>>>>>>>>>>>>  admin pages   <<<<<<<<<<<<<<<//

    adminLoginGet: (req, res) => {
        if (req.session.adminlogin) {
            res.redirect('/admin')
        }
        else {
            res.render('admin/adminlogin', { layout: 'admin/adminLayout' })
        }
    },

    adminLoginPost: (req, res) => {
        console.log(req.body);
        adminHelpers.adminlogin(req.body).then((response) => {
            if (response.status) {
                req.session.adminlogin = true
                req.session.admin = data
                res.redirect('/admin')
            } else {
                req.session.loginErr = true
                res.redirect('/admin/adminlogin')
            }

        })
    },

    adminLogout: (req, res) => {
        req.session.adminlogin = false
        res.redirect('/admin')
    },

    adminOrders:async(req,res)=>{
        // let userId=req.session.user._id
   let orderitems= await adminHelpers.getorders()
    
            res.render('admin/Orders',{ layout: 'admin/adminLayout',orderitems,nav: true })
    
    },
    viewMore:async(req,res)=>{
       
        let allOrders=await adminHelpers.orderDetails(req.params._id)
       
        res.render('admin/viewmore',{allOrders,layout: 'admin/adminLayout',nav:true})
    },
    changeShippingStatus:(req,res)=>{
        
        console.log(req.body,'shipping');
        adminHelpers.shippingStatus(req.body).then((response)=>{
            console.log(response,'the main response');
            res.json(response)
        })
    },

    salesReport:async(req,res)=>{
        
        let dailydata=await adminHelpers.dailyData()
        console.log(dailydata,'dailydata');
    //    let monthlydata = await adminHelpers.findMonthly()
     
       let EveryMonthly=await adminHelpers.findEveryMonthly()
       
       let yearlyData=await adminHelpers.yeardata()

        res.render('admin/salesReport',{layout:'admin/adminLayout' ,sidebar:true,EveryMonthly:EveryMonthly,dailydata:dailydata,yearlyData:yearlyData})
    },

    yearlyreport:async(req,res)=>{
    
        let dailydata=await adminHelpers.dailyData()
        
        let EveryMonthly=await adminHelpers.findEveryMonthly()
        let yearlyData=await adminHelpers.yeardata()
 
         res.send({EveryMonthly,dailydata,yearlyData} )
     },
     coupon:(req,res)=>{
        couponHelpers.getAllCoupons().then((allcoupons)=>{

            res.render('admin/couponmanagment',{layout:'admin/adminLayout' ,sidebar:true,allcoupons})

        })
     },

     addCoupon:(req,res)=>{
        res.render('admin/addcoupon',{layout:'admin/adminLayout' ,sidebar:true})
     },

     banermanagment:(req,res)=>{
        res.render('admin/banermanagment',{layout:'admin/adminLayout' ,sidebar:true})
     },

     banermain:(req,res)=>{
        res.render('admin/banermain',{layout:'admin/adminLayout' ,sidebar:true})
     },

     banermainpost:(req,res)=>{
          console.log(req.files,'photosos');
        console.log(req.body,'ith namma bodyyyyyyyy');
        const files=req.files
        const filesname=files.map((file)=>{
            return file.filename
        })
        const baner=req.body
        
        baner.image=filesname
        console.log(baner,'banerrrrrrr');
        productHelpers.addbaners(baner).then((insertedId)=>{
            console.log(insertedId,'insertedId');
            res.redirect('/admin/banermainTable')
        })
     },

     banertable:async(req,res)=>{
     let banners=await   productHelpers.getAllBaners()
            res.render('admin/banermainTable',{layout:'admin/adminLayout' ,sidebar:true,banners})
     
     },
     deleteBanner:(req,res)=>{
        let bannerId=req.params.id
        console.log(bannerId,'bannerId');
        productHelpers.deletebanner(bannerId).then((response)=>{
            
            res.redirect('/admin/banermainTable')
        })
     },
     newArrival:(req,res)=>{
        res.render('admin/newarrivals',{layout:'admin/adminLayout' ,sidebar:true})
     },


     gernerateCode:(req,res)=>{
        productHelpers.generateCoupon().then((response)=>{
            res.json(response)
        }).catch((error)=>{
              res.send({error:error})
        })
     },

     addCouponPost:(req,res)=>{
      
        couponHelpers.saveCoupon(req.body).then((response)=>{
          res.json({status:true})
        })
     },


     deleteCoupon:(req,res)=>{
        console.log(req.params.id,'iddddddddd');
        couponHelpers.deleteCoupons(req.params.id).then((response)=>{
            res.redirect('/admin/couponManagment')
        })
     }
     
}