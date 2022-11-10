
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/productHelpers')
var adduserHelpers = require('../helpers/addingUserHelpers')
var db = require('../config/connection');
const { product, users } = require('../config/connection');
var adminHelpers = require('../helpers/adminHelpers')
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

    adminAllProductsPost: (req, res) => {
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
            let Image = req.files.Image
            let imageName = req.params.id
            Image.mv('./public/productimages/' + imageName + '.jpg', (err, done) => {
                if (!err) {
                    res.redirect('/admin/allProduct')
                }
                else {
                    console.log(err)
                }
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
    }
}