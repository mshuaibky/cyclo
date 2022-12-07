const data = require('../config/admindetails')
const db=require('../config/connection')

module.exports = {


    saveCoupon:(data)=>{
        try {
            return new Promise(async(resolve,reject)=>{
                let couponData= await db.coupon(data)
               
                couponData.save()
                resolve()
            })
        } catch (error) {
            console.log(error);
            reject(error)
        }

    },
    getAllCoupons:()=>{
        try {
          return new Promise(async(resolve,reject)=>{
            let allcoupons=await db.coupon.find({})
            resolve(allcoupons)
          })  
        } catch (error) {
            console.log(error);
            
        }
    },

    deleteCoupons:(couponId)=>{
        try {
           return new Promise(async(resolve,reject)=>{
          let response= await db.coupon.deleteOne({_id:couponId})
          console.log(response,'database response');
          resolve(response)
           }) 
        } catch (error) {
            
        }

    }

}