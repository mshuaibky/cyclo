const db = require('../config/connection')
const bcrypt = require('bcrypt')
const { Promise } = require('mongoose')

module.exports = {

    doSignup: (userData) => {
        console.log(userData)

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
                console.log(cartobj);
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

        return new Promise( (resolve, reject) => {
            console.log(userId);
            db.cart.aggregate([
                {
                    $match: { "user":userId }
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
    
            ]).then((cartItems)=>{
                console.log(cartItems);
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
                console.log(data);
                resolve({ status: true })
            })

        })
    },

    deleteProductInCart: (data) => {
        
        return new Promise((resolve,reject)=> {
            db.cart.updateOne({ _id: data.cartid },
                {
                    $pull: { products: { item:data.productid } }
                }).then((response) => {
                    resolve(response)
                    })
        })
    },
    getTotalAmount:(userId)=>{
     return new Promise((resolve,reject)=>{

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
                $group:{
                    _id:null,
                total:{    $sum:{$multiply:['$quantity','$product.price']}}
                }
            }
           

        ]).then((totalamount)=>{
            console.log(totalamount);
            resolve(totalamount[0]?.total)
        })



    })
        
   
    }
}