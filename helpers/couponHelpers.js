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

    },
    couponApply:(couponId,total)=>{
        try {
          return new Promise(async(resolve,reject)=>{
          let coupon=await db.coupon.findOne({_id:couponId})
          
           
            resolve(coupon)
         
        
          })  
        } catch (error) {
            
        }
    },
    addUserCoupon:(userId,coupId)=>{
        return new Promise((resolve,reject)=>{
            db.users.findOne({_id:userId,'coupon.couponId':coupId}).then((data)=>{
                console.log(data,'users applied coupon');
                   if(!data){
                    let couponObj={
                        couponId:coupId,
                        status:false
                    }
                    db.users.updateOne({_id:userId},
                        {
                            $push:{coupon:couponObj},
                        }
                        ).then((response)=>{
                          console.log(response,'namma response');
                            resolve()
                        }).catch(()=>{
                            reject()
                        })
                   }
                   else{
                   
                    let couponIndex=data.coupon.findIndex(data=>data.couponId==""+coupId)
                  if(data.coupon[couponIndex].status){
                    reject('this coupon is already applied')
                  }else{
                    resolve()
                  }
                   }
            })
        })
    }

}