const data = require('../config/admindetails')
const bcrypt = require('bcrypt');
const db = require('../config/connection')
var ObjectId = require('mongodb').ObjectID;
module.exports = {

    adminlogin: (adminData) => {
        try {
            return new Promise((resolve, reject) => {
                if (data.email == adminData.email) {
                    bcrypt.compare(adminData.password, data.password).then((loginTrue) => {
                        let response = {}
                        if (loginTrue) {
                            response.admin = data
                            response.status = true
                            resolve(response)
    
                        }
                        else {
                            console.log('login failed invalid password');
                            resolve({ status: false })
                        }
                    })
                }
                else {
                    console.log('email is not valid');
                    resolve({ status: false })
                }
            })
            
        } catch (error) {
            reject(error)
        }
    },
    getorders: () => {

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

    orderDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await db.order.aggregate([
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
                resolve(order)
                
            } catch (error) {
                reject(error)
            }
        })

    },
    shippingStatus: async (details) => {
        console.log(details,'jfjfjfj');
        return new Promise(async (resolve, reject) => {
            try {
                
                let orderId = details.orderId
                let value = parseInt(details.value)
    
                let order = await db.order.find({ userId:details.userId })
    
                if (order) {
                    let orderIndex = order[0].orders.findIndex(order => order._id == orderId)
                    let productIndex = order[0]?.orders[orderIndex]?.productDetails.findIndex(product => product._id == details.proId)
                    await db.order.updateOne({ 'orders._id': `${orderId}` },
                        {
                            $set: {
                                ['orders.' + orderIndex + '.productDetails.' + productIndex + '.shippingStatus']: value
                            }
                        })
                    if (value == 4) {
                        db.order.updateOne({ 'orders.id': `${orderId}` },
                            {
                                $set: {
                                    ['orders.' + orderIndex + '.productDetails.' + productIndex + '.deliveredAt']: new Date()
                                }
                            }).then((response) => {
                               
                                resolve({status:true})
                            })
                    }
                    else {
                        resolve({ status: true })
                    }
                }
            } catch (error) {
                console.log(error,'error catch');
               reject(error) 
            }
        })
    },

    // findMonthly:()=>{
    //     let month=new Date()
    //     let thisMonth=month.getMonth()
    //     return new Promise((resolve,reject)=>{
    //         db.order.aggregate([
    //             {
    //                 $unwind:'$orders'
    //             },
    //             {
    //                 $unwind:'$orders.productDetails'
    //             },
    //             {
    //                 $match:{'orders.productDetails.shippingStatus':4}
    //             },
    //             {
    //                 $match:{
                        
    //                         $expr:{
    //                             $eq:[
    //                                 {
    //                                     $month:'$orders.createdAt'
    //                                 },
    //                                 thisMonth+1
    //                             ]
    //                         }
                        
    //                 }
                    
    //             },
    //             {
    //                 $group:{
    //                     _id:null,
    //                     total:{$sum:'$orders.totalPrice'},
    //                     orders:{$sum:'$orders.productDetails.quantity'},
    //                     totalOrders:{$sum:'$orders.totalQuantity'},
    //                     count:{$sum:1}

    //                 }
    //             }

    //         ]).then((monthlydata)=>{
                
    //             resolve(monthlydata)
    //         })
    //     })
    // },

    findEveryMonthly:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                
                let date=new Date()
             let thismonth=date.getMonth()
             let month=thismonth+1
             let year=date.getFullYear()
                db.order.aggregate([
                    {
                        $unwind:'$orders'
                    },
                    {
                        $unwind:'$orders.productDetails'
                    },
                    {
                        $match:{'orders.createdAt':{$gt:new Date(`${year}-01-01`),$lt:new Date(`${year}-12-31`)}}
                    },
                    {
                        $match:{'orders.productDetails.shippingStatus':4}
                    },
                    {
                        $group:{
                            _id:{'$month':"$orders.createdAt"},
                          totalCount:{$sum:{$multiply:['$orders.productDetails.productPrice','$orders.productDetails.quantity']}},
                          orders:{$sum:1},
                          totalQuantity:{$sum:'$orders.productDetails.quantity'}
                        }
                    }
                ]).then((data)=>{
                    console.log(data,'data namma data');
                    resolve(data)
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    dailyData:()=>{
        
        return new Promise(async(resolve,reject)=>{
        try{
         let date=new Date()
          let thismonth=date.getMonth()
          let month=thismonth+1
          let year=date.getFullYear()
           await db.order.aggregate([
            {   
                $unwind:'$orders'
            },
            {
                $unwind:'$orders.productDetails'
            },
            {
                $match:{'orders.createdAt':{
                    $gt:new Date(`${year}-${month}-01`),
                    $lt:new Date(`${year}-${month}-31`)
            }}
            },
            {
                $match:{'orders.productDetails.shippingStatus':4}
            },
            {
                $group:{
                    _id:{'$dayOfMonth':'$orders.createdAt'},
                    totalRevenue:{$sum:{$multiply:['$orders.productDetails.productPrice','$orders.productDetails.quantity']}},
                    orders:{$sum:1},
                    totalQuantity:{$sum:'$orders.productDetails.quantity'}
                }
            },
            {
                $sort:{'_id':-1}
            }
           ]).then((data)=>{
        
            resolve(data)
           })
        }catch(err){
           reject(err)
        }
    })
    },
    yeardata:()=>{
        try{
           
                let date=new Date()
                let thismonth = date.getMonth()
                let month= thismonth+1
                let year = date.getFullYear()
                return new Promise(async(resolve,reject)=>{
                    let data= await db.order.aggregate([
                        {
                            $unwind:'$orders'
                        },
                        {
                            $unwind:'$orders.productDetails'
                        },
                        {
                            $match:{'orders.createdAt':{$gt:new Date(`${year-5}-${month}-01`),$lt:new Date((`${year}-${month}-31`))}}
                        },
                        {
                            
                            $match:{'orders.productDetails.shippingStatus':4}
                        },

                        {
                            $group:{
                                _id:{'$year':'$orders.createdAt'},
                                totalRevenue:{$sum:{$multiply:['$orders.productDetails.productPrice','$orders.productDetails.quantity']}},
                                orders:{$sum:1},
                                totalQuantity:{$sum:'$orders.productDetails.quantity'}
                            }
                        },
                        {
                            $sort:{
                               _id:1
                            }
                        }
                    ])
                  
                       
                        resolve(data)
                    
            })

        }
        catch(err){
            console.log(err);
        }
    }
   
}