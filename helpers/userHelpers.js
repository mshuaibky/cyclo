const db = require('../config/connection')
const bcrypt = require('bcrypt')
const { Promise } = require('mongoose')
const { response } = require('express')
const ObjectId = require('mongodb').ObjectID;

module.exports = {

    doSignup: (userData) => {


        return new Promise(async (resolve, reject) => {
            db.users.find({ email: userData.email }).then(async (data) => {
                let response = {}
                if (data.length != 0) {
                    resolve({ status: false })
                } else {
                    userData.password = await bcrypt.hash(userData.password, 10)
                    let data = await db.users(userData)
                    data.save()
                    response.value = userData
                    response.status = true
                    response.data = data.insertedId
                    resolve(response)
                }
            })
        })
        // return new Promise(async (resolve, reject) => {
        //     userData.password = await bcrypt.hash(userData.password,10)
        //    const data = db.users(userData)
        //    data.save()

        // resolve(data._id)



        // })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.users.findOne({ email: userData.email })
            // console.log(userData.email +" "+ user.email)
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status && user.status) {
                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    }
                    else {
                        console.log("login failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("login failed");
                resolve({ status: false })
            }



        })
    },
    check: (number) => {
        return new Promise(async (resolve, reject) => {
            let data = await db.users.find({ phone: number.phone })
            resolve(data)
            console.log(data);
        })

    },

    addToCart: (proId, userId) => {
        let proObj = {
            item: proId,
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let usercart = await db.cart.findOne({ user: userId })
            if (usercart) {
                let proExist = usercart.products.findIndex(products => products.item == proId)
                console.log(proExist);
                if (proExist != -1) {

                    db.cart.updateOne({ user: userId, 'products.item': proId },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()
                    })
                } else {
                    db.cart.updateOne({ user: userId },
                        {

                            $push: { products: proObj }

                        }
                    ).then((response) => {
                        resolve()
                    })

                }
            }
            else {
                let cartobj = {
                    user: userId,
                    products: [proObj]


                }
                let data = db.cart(cartobj)

                data.save((err, data) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        resolve(data)
                    }
                })

            }
        })
    },
    getCartProducts: (userId) => {

        return new Promise((resolve, reject) => {

            db.cart.aggregate([
                {
                    $match: { "user": userId }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',

                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).then((cartItems) => {

                resolve(cartItems)
            })






        })
    },
    getCartCount: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let cart = await db.cart.findOne({ user: userId })
            let count = 0
            if (cart) {
                for (i = 0; i < cart.products.length; i++) {
                    count += cart.products[i].quantity
                }
            }
            count = parseInt(count)
            resolve(count)

        })
    },

    changeProductCount: (details) => {

        count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {


            db.cart.updateOne({ _id: details.cart, 'products.item': (details.product) },
                {
                    $inc: { 'products.$.quantity': count }
                }
            ).then((data) => {

                resolve({ status: true })
            })

        })
    },

    deleteProductInCart: (data) => {

        return new Promise((resolve, reject) => {
            db.cart.updateOne({ _id: data.cartid },
                {
                    $pull: { products: { item: data.productid } }
                }).then((response) => {
                    resolve(response)
                })
        })
    },
    getTotalAmount: (userId) => {
        return new Promise((resolve, reject) => {

            db.cart.aggregate([
                {
                    $match: { user: userId }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        name: '$products.name',
                        price: '$product.price'

                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }
                }


            ]).then((totalamount) => {

                resolve(totalamount[0]?.total)
            })



        })


    },

    placeOrder: (order, total) => {
        console.log('total' + total);
        return new Promise(async (resolve, reject) => {
            let components = await db.cart.aggregate([
                {
                    $match: { user: order.userId }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'cartItemsResult'
                    }
                },
                {
                    $unwind: '$cartItemsResult'
                },
                {
                    $set: { 'cartItemsResult': { status: true } }
                },
                {
                    $project: {
                        _id: '$cartItemsResult._id',
                        quantity: 1,
                        productsName: '$cartItemsResult.name',
                        productPrice: '$cartItemsResult.price',
                        status: '$cartItemsResult.status'
                    }
                },



            ])


            let Address = {
                firstname: order.firstname,
                lastname: order.lastname,
                country: order.country,
                street: order.street,
                city: order.city,
                state: order.state,
                pincode: order.pincode,
                phone: order.phone,
                email: order.email
            }

            let addressesObj = {
                user: order.userId,
                address: Address
            }

            let addr = await db.address.findOne({ userId: order.userId })
            if (addr) {

                db.address.find({ 'address.phone': order.phone }).then((res) => {
                    if (res.length == 0) {
                        db.address.updateOne({ userId: order.userId },
                            {
                                $push: {
                                    address: Address
                                }
                            }
                        ).then((res) => {

                        })
                    }
                })

            } else {

                db.address(addressesObj).save().then(() => {
                    resolve()
                })
            }
            let orderAddress = {
                street: order.street,
                city: order.city,
                state: order.state,
                pincode: order.pincode,
                phone: order.phone,
                email: order.email
            }

            let orderObj = {
                firstname: order.firstname,
                lastname: order.lastname,
                phone: order.phone,
                paymentMethod: order.paymentMethod,
                productDetails: components,
                totalPrice: total,
                shippingAddress: orderAddress
            }
            let orderdata = {
                userId: order.userId,
                orders: orderObj
            }

            let orderExist = await db.order.find({ userId: order.userId })

            if (!orderExist.length == 0) {

                db.order.updateOne(
                    {
                        userId: order.userId
                    },
                    {
                        $push: {
                            orders: [{
                                firstname: order.firstname,
                                lastname: order.lastname,
                                phone: order.phone,
                                paymentMethod: order.paymentMethod,
                                productDetails: components,
                                totalPrice: total,
                                shippingAddress: orderAddress
                            }]

                        }
                    }
                ).then(() => {
                    db.cart.deleteOne({}).then((res) => {
                        resolve({ status: 'success' })
                    })
                })
            } else {
                db.order(orderdata).save()
                db.cart.deleteOne({}).then((res) => {
                    resolve({ status: 'success' })
                })
            }


            db.cart.deleteMany({}).then((res) => {
                resolve({ status: 'success' })
            })
        })


    },
    getorders: (userId) => {

        return new Promise(async (resolve, reject) => {
            let orders = await db.order.findOne({ user: userId })

            resolve(orders)
        })
    },
    cancel: (data) => {
        console.log("jhvbjhbjbj=>", data.orderId);
        let orderIds = data.orderId.trim()
        return new Promise(async (resolve, reject) => {
            let order = await db.order.find({ 'orders._id': `${orderIds}` })

            if (order) {
                let orderIndex = order[0].orders.findIndex(order => order._id == `${orderIds}`)
                console.log(orderIndex);
                let productIndex = order[0].orders[orderIndex].productDetails.findIndex(product => product._id == data.proId)
                console.log(productIndex);
                
                db.order.updateOne({'orders._id':`${orderIds}`},{
                    $set:{
                        ['orders.'+orderIndex+'.productDetails.'+productIndex+'.status']:false
                    }
                }).then((e)=>{
                    console.log(e);
                    resolve({status:true})
                })
            }
        })

    },
    getAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let data = await db.address.findOne({ user: userId })

            resolve(data)

        })
    },

    addressFill: (userId, addressId) => {
        return new Promise((resolve, reject) => {

            db.address.aggregate([
                {
                    $match: { user: userId }
                },

                {
                    $unwind: '$address'
                },
                {
                    $match: { 'address._id': ObjectId(addressId) }
                }
            ]).then((data) => {

                resolve(data)
            })
        })
    }
}