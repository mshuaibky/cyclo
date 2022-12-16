
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
        
            res.render('admin/admindash', { layout: 'admin/adminLayout', nav: true, sidebar: true });

     
    },


    adminAllProducts: (req, res, next) => {
        productHelpers.getAllProducts().then((products) => {

            res.render('admin/allProduct', { layout: 'admin/adminLayout', products, nav: true, sidebar: true });

        }).catch((error)=>{
            res.render('error',{error:error.message})
        })
    },


    adminAddProductGet: (req, res, next) => {
      
            productHelpers.getallCatagory().then((catagory) => {

                res.render('admin/addProduct', { catagory, layout: 'admin/adminLayout', nav: true, sidebar: true });

            }).catch((error)=>{
                res.render('error',{error:error.message})
            })
      
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
 }).catch((error)=>{
    res.render('error',{error:error.message})
 })

      
       
    },

    adminUsers: (req, res) => {
       
            adduserHelpers.getAllUsers().then((users) => {
                res.render('admin/allUsers', { layout: 'admin/adminLayout', users, nav: true, sidebar: true });
            }).catch((error)=>{
                res.render('error',{error:error.message})
            })
        
    },


    adminAddUsersGet: (req, res, next) => {
       
            res.render('admin/addUser', { layout: 'admin/adminLayout', nav: true, sidebar: true });
        
    },

    adminAddUsersPost: (req, res) => {
        adduserHelpers.addUsers(req.body).then((userData) => {
            console.log(userData);
            res.redirect('/admin/allusers')
        }).catch((error)=>{
         res.render('error',{error:error.message})
        })
    },

    editProducts: async (req, res, next) => {
      
            let product = await productHelpers.getproductdetails(req.params.id)
            console.log(product);
            productHelpers.getallCatagory().then((catagory) => {



                res.render('admin/editProduct', { layout: 'admin/adminLayout', product, catagory, nav: true, sidebar: true });
            }).catch((error)=>{
                res.render('error',{error:error.message})
            })
        

    },

    editProductsPost: (req, res) => {

     console.log(req.params.id,req.boby,'ith vanjandaaa');
       

            const files=req.files
             const filename=files.map((file)=>{
                return file.filename
             })

             const product=req.body
             product.image=filename
             productHelpers.updateProduct(req.params.id, req.body).then(() => {
                          
                res.redirect('/admin/allproduct')
             }).catch((error)=>{
                res.render('error',{error:error.message})
             })
    


    },

    deleteProductsGet: (req, res) => {
        if (req.session.adminlogin) {
            let proId = req.params.id
            console.log(proId);
            productHelpers.deleteProducts(proId).then((response) => {
                res.redirect('/admin/allproduct')
            }).catch((error)=>{
                res.render('error',{error:error.message})
            })
        }
    },

    blockUser: (req, res) => {
        adduserHelpers.blockUser(req.params.id).then((user) => {
            req.session.loggedIn=false
            console.log(user);
            res.redirect('/admin/allUsers')
        }).catch((error)=>{
            res.render('error',{error:error.message})
        })
    },

    unblockUser: (req, res) => {
        adduserHelpers.unblockUser(req.params.id).then((user) => {
            console.log(user);
            res.redirect('/admin/allUsers')
        }).catch((error)=>{
            res.render('error',{error:error.message})
        })
    },

    catagory: (req, res) => {
      
            productHelpers.getallCatagory().then((catagory) => {
                //   console.log(catagory);
                res.render('admin/catagory', { layout: 'admin/adminLayout', catagory, nav: true, sidebar: true })

            }).catch((error)=>{
                res.render('error',{error:error.message})
            })
        
    },

    addCatagoryGet: (req, res) => {
        res.render('admin/addCatagory', { layout: 'admin/adminLayout', nav: true, sidebar: true })
    },
    addCatagoryPost: (req, res) => {
        productHelpers.addCatagory(req.body).then((data) => {
            if (data.status) {
                res.send({ value: 'success' })
            } else {
              
                res.send({ value: "failed" })
            }

        }).catch((error)=>{
            res.send({error:error.message})
        })
    },


    deleteCatagry: (req, res) => {
        let catagory = req.params.id
        productHelpers.deleteCatagory(catagory).then((response) => {
            res.redirect('/admin/Catagory')

        }).catch((error)=>{
            res.render('error',{error:error.message})
        })
    },

    editCatagoryGet: async (req, res) => {
        try {
            
            let catagory = await productHelpers.getCatdetails(req.params.id)
            
            res.render('admin/editCatagory', { layout: 'admin/adminLayout', catagory, nav: true, sidebar: true })
        } catch (error) {
            res.render('error',{error:error.message})
        }
    },

    editCatagoryPost: (req, res) => {
        productHelpers.updateCatagory(req.params.id, req.body).then(() => {
            res.redirect('/admin/catagory')
        }).catch((error)=>{
            res.render('error',{error:error.message})
        })

    },

    // >>>>>>>>>>>>>>>>>>>  admin pages   <<<<<<<<<<<<<<<//

    adminLoginGet: (req, res) => {
        try {
            
            if (req.session.adminlogin) {
                res.redirect('/admin')
            }
            else {
                res.render('admin/adminlogin', { layout: 'admin/adminLayout' })
            }
        } catch (error) {
          res.render('error',{error:error.message})  
        }
    },

    adminLoginPost: (req, res) => {
       
        adminHelpers.adminlogin(req.body).then((response) => {
            if (response.status) {
                req.session.adminlogin = true
                req.session.admin = data
                res.redirect('/admin')
            } else {
                req.session.loginErr = true
                res.redirect('/admin/adminlogin')
            }

        }).catch((error)=>{
              res.render('error',{error:error.message})
        })
    },

    adminLogout: (req, res) => {
        req.session.adminlogin = false
        res.redirect('/admin')
    },

    adminOrders:async(req,res)=>{
        // let userId=req.session.user._id
        try {
            
            let orderitems= await adminHelpers.getorders()
             
                     res.render('admin/orders',{ layout: 'admin/adminLayout',orderitems,nav: true })
        } catch (error) {
           res.render('error',{error:error.message}) 
        }
    
    },
    viewMore:async(req,res)=>{
       try {
        
           let allOrders=await adminHelpers.orderDetails(req.params._id)
          
           res.render('admin/viewmore',{allOrders,layout: 'admin/adminLayout',nav:true})
       } catch (error) {
        res.render('error',{error:error.message})
       }
    },
    changeShippingStatus:(req,res)=>{
        
        console.log(req.body,'namma respoonseee');
       
        adminHelpers.shippingStatus(req.body).then((response)=>{
            res.json(response)
        }).catch((error)=>{
            res.json({status:false,error:error.message})
        })
    },

    salesReport:async(req,res)=>{
        try {
            
            let dailydata=await adminHelpers.dailyData()
            console.log(dailydata,'dailydata');
        //    let monthlydata = await adminHelpers.findMonthly()
         
           let EveryMonthly=await adminHelpers.findEveryMonthly()
           
           let yearlyData=await adminHelpers.yeardata()
    
            res.render('admin/salesReport',{layout:'admin/adminLayout' ,sidebar:true,EveryMonthly:EveryMonthly,dailydata:dailydata,yearlyData:yearlyData})
        } catch (error) {
            res.render('error',{error:error.message})
        }
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
        
        const files=req.files
        const filesname=files.map((file)=>{
            return file.filename
        })
        const baner=req.body
        
        baner.image=filesname
        productHelpers.addbaners(baner).then((insertedId)=>{
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
     newArrival:async(req,res)=>{
        let catabaners=await  productHelpers.getcataBaners()
        res.render('admin/newarrivals',{layout:'admin/adminLayout' ,sidebar:true,catabaners})
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
     },
     catabanner:(req,res)=>{
        res.render('admin/catabaner',{layout:'admin/adminLayout' ,sidebar:true})
     },
     
     catabanerPost:(req,res)=>{
        console.log(req.body,'cata body');
        console.log(req.files,'cata pics');
        const files=req.files
        const filesname=files.map((file)=>{
            return file.filename
        })
        const catabaner=req.body
        
        catabaner.image=filesname
        productHelpers.addCatabaner(catabaner).then((response)=>{
            res.redirect('/admin/newarrivals')
        })
        
     },

     deletecataBanner:(req,res)=>{
        let banerId=req?.params?.id
         console.log(banerId,'fjfjfj');
        productHelpers.deleteCatabaner(banerId).then((response)=>{
          res.redirect('/admin/newarrivals')
        })
        
      }
    
}