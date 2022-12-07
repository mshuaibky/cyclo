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
            
        }
    },
    getorders: () => {

        return new Promise(async (resolve, reject) => {
            let orders = await db.order.aggregate([
                {
                    $unwind: '$orders'
                }
            ])
            resolve(orders)

        })
    },

    orderDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
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
        })

    },
    shippingStatus: async (details) => {
        console.log(details,'detailsnnnnn');
        let orderId = details.orderId
        let value = parseInt(details.value)
        return new Promise(async (resolve, reject) => {
            let order = await db.order.find({ userId:details.userId })
            console.log(order,'myOrdersid');
            if (order) {
                let orderIndex = order[0].orders.findIndex(order => order._id == orderId)
                let productIndex = order[0]?.orders[orderIndex]?.productDetails.findIndex(product => product._id == details.proId)
                console.log(orderIndex, productIndex, 'itgaaanu');
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
                            console.log(response, 'habeeebyy');
                            resolve({status:true})
                        })
                }
                else {
                    resolve({ status: true })
                }
            }
        })
    },

    findMonthly:()=>{
        let month=new Date()
        let thisMonth=month.getMonth()
        return new Promise((resolve,reject)=>{
            db.order.aggregate([
                {
                    $unwind:'$orders'
                },
                {
                    $unwind:'$orders.productDetails'
                },
                {
                    $match:{'orders.productDetails.shippingStatus':4}
                },
                {
                    $match:{
                        
                            $expr:{
                                $eq:[
                                    {
                                        $month:'$orders.createdAt'
                                    },
                                    thisMonth+1
                                ]
                            }
                        
                    }
                    
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:'$orders.totalPrice'},
                        orders:{$sum:'$orders.productDetails.quantity'},
                        totalOrders:{$sum:'$orders.totalQuantity'},
                        count:{$sum:1}

                    }
                }

            ]).then((monthlydata)=>{
                
                resolve(monthlydata)
            })
        })
    },

    findEveryMonthly:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let data=[]
                for(let i=0;i<12;i++){
                    await db.order.aggregate([
                        {
                            $unwind:'$orders'
                        },
                        {
                            $unwind:'$orders.productDetails'
                        },
                        {
                            $match:{'orders.productDetails.shippingStatus':4}
                        },
                        {
                            $match:{
                                $expr:{
                                    $eq:[{
                                        $month:'$orders.createdAt'
                                    },
                                    i+1
                                    ]
                                   
                                }
                            }
                        },

                  {
                    $group:{
                        _id:null,
                        total:{$sum:'$orders.totalPrice'},
                        orders:{$sum:'$orders.productDetails.quantity'},
                        count:{$sum:1}
                       }
                  }
                    ]).then((monthlydata)=>{
                     
                        data[i+1]=monthlydata[0]
                    })
                }
                for(i=0;i<12;i++){
                    if(data[i+1]==undefined){
                        data[i+1]={
                            total:0,
                            orders:0,
                            count:0,
                        }
                    }else{
                        data[i]
                    }
                }
                
                resolve({status:true,data:data})
            }catch(err){

            }
        })
    },

    dailyData:()=>{
       try{
        let date=new Date()
         let thismonth=date.getMonth()
         let month=thismonth+1
         let year=date.getFullYear()
        
    return new Promise(async(resolve,reject)=>{
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
                    totalQuantity:{$first:'$orders.totalQuantity'}
                }
            },
            {
                $sort:{'_id':-1}
            }
           ]).then((data)=>{
                console.log(data);
            resolve(data)
           })
    })
         }catch(err){
            console.log(err);
         }
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
                                totalQuantity:{$first:'$orders.totalQuantity'}
                            }
                        },
                        {
                            $sort:{
                               _id:1
                            }
                        }
                    ])
                    // .then((data)=>{
                       
                        resolve(data)
                    // })
            })

        }
        catch(err){
            console.log(err);
        }
    }
   
}