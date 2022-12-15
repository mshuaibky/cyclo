
const db = require('../config/connection')
const bcrypt = require('bcrypt')
const { Promise } = require('mongoose')
const { response } = require('express')
const ObjectId = require('mongodb').ObjectID;

const Razorpay = require('razorpay');
const { resolve } = require('path');
const { log } = require('console');
const { success } = require('../controlers/userscontroller');

var instance = new Razorpay({
    key_id: 'rzp_test_OGwUAcKVHVaenQ',
    key_secret: 'YJvwLzl8Iiv4Uh4oyrKVU4qR',
});


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
        console.log(number,'namma number');
        return new Promise(async (resolve, reject) => {
            let data = await db.users.find({ phone: number })
            console.log(data,'phone number varify');
            resolve(data)
        })

    },

    addToCart: (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let proObj = {
                    item: proId,
                    quantity: 1
                }
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
                
            } catch (error) {
              reject(error)  
            }
        })
    },
    getCartProducts: (userId) => {

        return new Promise((resolve, reject) => {
            try {
                
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
                            product: { $arrayElemAt: ['$product', 0] },
                            image:1
                        }
                    }
    
                ]).then((cartItems) => {
    
                    resolve(cartItems)
                }).catch((error)=>{
                    reject(error)
                })
            } catch (error) {
                reject(error)
            }







        })
    },
    getCartCount: (userId) => {
       
        return new Promise(async (resolve, reject) => {
            try {
                let cart = await db.cart.findOne({ user: userId })
                let count = 0
                if (cart) {
                    for (i = 0; i < cart.products.length; i++) {
                        count += cart.products[i].quantity
                    }
                }
                count = parseInt(count)
                resolve(count)
                
            } catch (error) {
                reject(error)
            }

        })
    },

    changeProductCount: (details) => {
        
        return new Promise((resolve, reject) => {
            try {
                
                count = parseInt(details.count)
                details.quantity = parseInt(details.quantity)
                      
    
                db.cart.updateOne({ _id: details.cart, 'products.item': (details.product) },
                    {
                        $inc: { 'products.$.quantity': count }
                    }
                ).then((data) => {
    
                    resolve({ status: true })
                }).catch((error)=>{
                    reject(error)
                })
            } catch (error) {
                reject(error)
            }

        })
    },

    deleteProductInCart: (data) => {

        return new Promise((resolve, reject) => {
            try {
                
                db.cart.updateOne({ _id: data.cartid },
                    {
                        $pull: { products: { item: data.productid } }
                    }).then((response) => {
                        resolve(response)
                    })
            } catch (error) {
                reject(error)
            }
        })
    },
    getTotalAmount: (userId) => {
        return new Promise((resolve, reject) => {
      try {
        
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
                      price: '$product.Offerprice'

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
                      total: { $sum: { $multiply: ['$quantity', '$product.Offerprice'] } }
                  }
              }


          ]).then((totalamount) => {

              resolve(totalamount[0]?.total)
          }).catch((error)=>{
            reject(error)
          })

      } catch (error) {
        reject(error)
      }


        })


    },

    placeOrder: (order, total,couponId) => {
    console.log(couponId,'in placeOrder');
    console.log(order);
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
                        quantity: '$products.quantity',
                       
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
                    $set: { 'cartItemsResult': { shippingStatus: 1 } }
                },
                
                {
                   $set:{'cartItemsResult': { returnStatus: false }}

                },
                {
                    $project: {
                        _id: '$cartItemsResult._id',
                        quantity: 1,
                        productsName: '$cartItemsResult.name',
                        productPrice: '$cartItemsResult.Offerprice',
                        status: '$cartItemsResult.status',
                        shippingStatus: '$cartItemsResult.shippingStatus',
                        returnStatus:'$cartItemsResult.returnStatus',
                        image:'$cartItemsResult.image'
                    }
                },

               

            ])
            
          
           
            let totalQuantity=0
            for(i=0;i<components.length;i++){
                totalQuantity+=components[i].quantity
            }
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

            for(i=0;i<components.length ;i++){
                await db.product.updateOne({
                      _id:components[i]?._id
                   },
               {
                   $inc:{stock:-components[i].quantity}
               })
               
               }

            let addr = await db.address.findOne({ user: order.userId })
            if (addr) {

                db.address.find({ 'address.phone': order.phone }).then((res) => {
                    if (res.length == 0) {
                        db.address.updateOne({ user: order.userId },
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
                totalQuantity:totalQuantity,
                totalPrice: total,
                shippingAddress: orderAddress,
                
              

            }
            let orderdata = {
                userId: order.userId,
                orders: orderObj,
               
            }

            let orderExist = await db.order.findOne({ userId: order.userId })

            if (orderExist) {

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
                                totalQuantity:totalQuantity,
                                shippingAddress: orderAddress
                            }]

                        }
                    }
                ).then(() => {
                
                })
            } else {
                await db.order(orderdata).save()
            }
            db.cart.deleteOne({user:order.userId}).then((res) => {
               if(couponId){
                db.users.updateOne({_id:order.userId,'coupon.couponId':couponId},
                {
                    $set:{'coupon.$.status':true}
                }
                ).then((data)=>{
                    console.log(data,'datassssssssss');
                    resolve({status:true})
                })
               }
                resolve({ status: 'success' })
                
            })
        })

    },
    // getorders: (userId) => {

    //     return new Promise(async (resolve, reject) => {
    //         let orders = await db.order.findOne({ userId: userId })
    //       console.log(orders,'ordersss');
    //         resolve(orders)
    //     })
    // },

    getOneOrder: () => {
    
        return new Promise(async (resolve, reject) => {
            try {
                
                let orders = await db.order.aggregate([
                    {
                        $unwind: '$orders'
                    }
                ])
               
                resolve(orders)
            } catch (error) {
                reject(error)
            }

        })
    },

    cancel: (data,userId) => {


        return new Promise(async (resolve, reject) => {
            try {
                
                let orderIds = data.orderId.trim()
                
                let order = await db.order.find({ 'orders._id': `${orderIds}` })
    
                if (order) {
                    let orderIndex = order[0].orders.findIndex(order => order._id == `${orderIds}`)
                    let productIndex = order[0].orders[orderIndex].productDetails.findIndex(product => product._id == data.proId)
    
    
                    db.order.updateOne({ 'orders._id': `${orderIds}` }, {
                        $set: {
                            ['orders.' + orderIndex + '.productDetails.' + productIndex + '.status']: false
                        }
                    }).then((e) => {
                        resolve({ status: true })
                    })
                   db.order.aggregate([
                    {
                    $match:{userId:ObjectId(userId)}
                   },
                  {
                    $unwind:'$orders'
                  },
                  {
                    $unwind:'$orders.productDetails'
                  },
                  {
                    $match:{$and:[{'orders._id':ObjectId(orderIds),'orders.productDetails._id':ObjectId(data.proId)}]}
                  }
                ]).then((datas)=>{
                console.log(datas,'cancelinta order ');
               
                    db.product.updateOne({_id:data.proId},
                        {
                            $inc:{stock:datas[0].orders.productDetails.quantity}
                        }
                        ).then((e)=>{
                            console.log(e,'cancel productinta response');
                        })
    
                        if(datas[0].orders.paymentMethod=='paypal'||datas[0].orders.paymentMethod=='Upi'){
                            let wallets=datas[0].orders.productDetails.productPrice*datas[0].orders.productDetails.quantity
                            db.users.updateOne({_id:userId},
                            {
                                $push:{
                                    wallet:wallets
                                }
                            }
                                
                                ).then((response)=>{
                                    console.log(response,'response of cancel order');
                                })
                        }
                }).catch((error)=>{
                    reject(error)
                })
    
                }
            } catch (error) {
                reject(error)
            }
        })

    },
    getAddress: (userId) => {
       
        return new Promise(async (resolve, reject) => {
            try {
                
                let data = await db.address.findOne({ user: userId })
                
                resolve(data)
            } catch (error) {
                reject(error)
            }

        })
    },

    addressFill: (userId, addressId) => {
        return new Promise((resolve, reject) => {
   try {
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
    
   } catch (error) {
    reject(error)
   }
        })
    },

    generateRazorpay: async (userId, total) => {
        console.log(userId, 'user id');
        let order = await db.order.findOne({ user: userId })
        console.log(order, 'this is order');
        let orderId = order.orders.slice().reverse()
        orderId = orderId[0]._id
        return new Promise((resolve, reject) => {

            var options = {
                amount: total * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {

                resolve(order)
            });
        })
    },

    varifyPayment: (details) => {
        return new Promise((resolve, reject) => {

            const cripto = require('crypto')

            let hmac = cripto.createHmac('sha256', 'YJvwLzl8Iiv4Uh4oyrKVU4qR')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve(response)
            }
            else {
                reject()
            }
        })
    },
    changePaymentStatus: (orderId1) => {
        let orderId="" +orderId1
       
        return new Promise(async (resolve, reject) => {
            let orders = await db.order.find({ 'orders.$._id': orderId })
            console.log(orders,'ith enja channanam');
            let orderIndex = orders[0].orders.findIndex((order) => order._id == orderId)
            console.log(orderIndex,'change payment status');

            let updateData = await db.order.updateOne({
                'orders._id': orderId
            },
                {
                    $set: {
                        ['orders.' + orderIndex + '.paymentStatus']: 1
                    }
                }
            ).then((data) => {
                console.log(data);
                resolve()
            })
        })
    },
    userAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let address = await db.address.find({ user: userId })
                console.log(address, 'address');
                resolve(address)
                
            } catch (error) {
                reject(error)
            }
        })
    },
    addressRemove: (addressId, userId) => {

        return new Promise(async (resolve, reject) => {
            
            db.address.updateOne({ user: userId }, {

                $pull: {
                    address: { _id: addressId }
                }

            }).then((e) => {
                console.log(e);
                resolve(e)
            }).catch((error)=>{
                reject(error)
            })
        })
    },
    editAddress: (userId, data) => {
      
        return new Promise(async (resolve, reject) => {
            try {
                
                            let addresses = await db.address.findOne({ user: userId })
                            let addressIndex = addresses.address.findIndex(addr => addr._id == data.addressId)
                
                
                
                            let addressData = {
                                firstname: data.firstname,
                                lastname: data.lastname,
                                country: data.country,
                                street: data.street,
                                city: data.city,
                                state: data.state,
                                pincode: data.pincode,
                                phone: data.phone,
                                email: data.email
                            }
                
                            db.address.updateOne({ user: userId },
                                {
                                    $set: {
                                        ['address.' + addressIndex]: addressData
                                    }
                                }).then((res) => {
                                    console.log(res);
                                    resolve(res)
                
                                }).catch((error)=>{
                                    reject(error)
                                })
                
            } catch (error) {
                reject(error)
            }
        })
    },
    addressAdd: (data, userId) => {
        return new Promise(async (resolve, reject) => {
            
            addressExist = await db.address.find({ user: userId })
            if (addressExist) {
                db.address.find({ 'address.pincode': data.pincode, 'address.phone': data.phone }).then((res) => {
                    console.log(res,'my response');
                    if (res.length==0) {
                        db.address.updateOne({ user: userId },
                            {
                                $push:{ address:data}
                            }).then((res)=>{
                               resolve({status:true})
                            })
                    }else{
                        console.log('this address already exist');
                        resolve({status:false})
                    }
                })

            }else{
              db.address(data).save().then(()=>{
                resolve({status:true})
              })

            }
        })
    },
    getUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                
                let user=await db.users.findOne({_id:userId})
                resolve(user)
            } catch (error) {
             reject(error)   
            }
        })
    },
    editUserDetails:(data,user)=>{
      
        return new Promise((resolve,reject)=>{
            try {
                bcrypt.compare(data.currentPassword,user.password).then(async(checkPassword)=>{
                   if(checkPassword){
                       data.newPassword=await bcrypt.hash(data.newPassword,10)
       
                       db.users.updateOne({_id:user._id},
                           {
                               $set:{
                                   password:data.newPassword,
                                   name:data.name,
                                   email:data.email
                               }
                           }).then((response)=>{
                               console.log(response);
                               resolve(response)
                           })
                   }
                   else{
                       resolve()
                       console.log('password not match');
                   }
                })
                
            } catch (error) {
                reject(error)
            }
        })
    },

    findProductQuantity:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
         
        let cartProducts= await db.cart.findOne({user:userId})
       if(cartProducts){
       let productIndex=cartProducts.products.findIndex(product=>product.item==proId)
        if(productIndex!=-1){
        let quantity=cartProducts.products[productIndex].quantity
        resolve({status:true,quantity:quantity})
        }else{
            let quantity=0
            resolve({status:true,quantity:quantity})
        }
       }
       else{
        resolve({status:false})
       }
        })
    },
    orderReturn:(data,userId)=>{
        let orderId=data.orderId
        let proId=data.proId
        return new Promise(async(resolve,reject)=>{
           let order=await db.order.find({'orders._id':orderId})
           
           if(order){
            let orderIndex=order[0].orders.findIndex(order=>order._id==orderId)
         let productIndex=order[0].orders[orderIndex].productDetails.findIndex(product=>product._id==proId)
           db.order.updateOne({'orders._id':orderId},
         {
            $set:{
                ['orders.'+orderIndex+'.productDetails.'+productIndex+'.returnStatus']:true
            }
         }
         ).then((response)=>{
         })
          
          db.order.aggregate([{
            $match:{userId:ObjectId(userId)}
          },
          {
            $unwind:'$orders'
          },
          {
            $unwind:'$orders.productDetails'
          },
          {
            $match:{$and:[{'orders._id':ObjectId(orderId),'orders.productDetails._id':ObjectId(proId)}]}
          }
        ]).then((data)=>{
            console.log(data,'dataaaaaaaaaaaaaaaa');
           let wallets= data[0]?.orders?.productDetails?.productPrice*data[0].orders.productDetails.quantity
            db.product.updateOne({_id:proId},
                {
                    $inc:{stock:data[0].orders.productDetails.quantity}
                }).then((response)=>{
                    console.log(response,'stockkkk return');
                })
           db.users.updateOne({_id:userId},{
            $push:{
                wallet:wallets
            }
           }).then((response)=>{
            resolve({status:true})
           })
        })

           }
        })
    },
    findOrder:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.order.aggregate([
                {
                    $match:{"userId":userId}
                },
                {
                    $unwind:'$orders'
                },
                {
                    $match:{'orders._id':ObjectId(orderId)}
                }
            ]).then((orders)=>{
                console.log(orders,'orderssss');
                resolve(orders)
            })
        })
    },

    detailOrder:(orderId)=>{
        return new Promise(async (resolve, reject) => {
            let orders = await db.order.aggregate([
                {
                    $unwind: '$orders'
                },
                {
                    $unwind: '$orders.productDetails'
                },
                {
                    $match: { 'orders._id': ObjectId(orderId) }
                }
            ])
            resolve(orders)
        })

    },

    offeredProduct:(query)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                console.log(query,'test');
             let data= await  db.product.find(query)
               
             resolve(data)
           

            } catch (error) {
                
            }
        })
    },

    addWishlist:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
               let proObj={
                item:proId
               } 
               let userWishlist=await db.wishlist.findOne({user:userId})
               if(userWishlist){
                let proExist=userWishlist.products.findIndex(products=>products.item==proId)
                console.log(proExist,'product exist');
                if(proExist==-1){
                    db.wishlist.updateOne({user:userId},
                        {
                        $push:{products: proObj}
                    }
                    ).then((response)=>{

                        resolve({status:true})
                    }).catch((error)=>{
                        console.log(error);
                        reject(error)
                    })
                }else{
                    resolve({status:false})

                }
               }else{
                let wishobj={
                    user:userId,
                    products:[proObj]
                }
                let data= db.wishlist(wishobj)
                data.save((err,data)=>{
                    if(err){
                        console.log(err);
                    }else{
                        resolve(data)
                    }
                })
               }
            } catch (error) {
                reject(error)
            }
        })
    },

    getwishCount:(userId)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.wishlist.aggregate([
                    {
                        $match:{"user":userId}
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:{
                            item:'$products.item',
                            quantity:'$products.quantity'
                        }
                    },
                    {
                        $lookup:{
                            from:'products',
                            localField:'item',
                            foreignField:'_id',
                            as:'product'
                        }
                    },
                    {
                        $project:{
                            item:1,
                            quantity:1,
                            product:{$arrayElemAt: ['$product',0]},
                            image:1,
                        }
                    }
                ]).then((wishItems)=>{
                    resolve(wishItems)
                }).catch((error)=>{
                    reject(error)
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    deleteWishpro:(data)=>{
        return new Promise((resolve,reject)=>{
            try {
                let wishId=data.wishId
                let proId=data.proId

                db.wishlist.updateOne({_id:wishId},
                    {
                        $pull:{products:{item:proId}}
                    }
                    ).then((response)=>{
                        console.log(response);
                        resolve()
                    }).catch((error)=>{
                        reject(error)
                    })
                
            } catch (error) {
                reject(error) 
            }


        })
    }
}