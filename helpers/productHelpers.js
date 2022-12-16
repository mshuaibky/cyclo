const { product } = require('../config/connection')
const db=require('../config/connection')
const { proppatch } = require('../routes')
const {ObjectId}=require('mongoose')
const { ActivityInstance } = require('twilio/lib/rest/taskrouter/v1/workspace/activity')

var voucher_codes = require('voucher-code-generator');
module.exports={


addproduct:(product)=>{
    return new Promise(async(resolve,reject)=>{
      try {
        
        let data=await db.product(product)
      
        data.save()
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
},


 getAllProducts:()=>{
  return new Promise(async(resolve,reject)=>{
    try {
      let Products=await db.product.find({})
      resolve(Products)
      
    } catch (error) {
      reject(error)
    }

  })
},

getproductdetails:(proId)=>{
  return new Promise((resolve,reject)=>{
    
   db.product.findOne({_id:proId}).then((product)=>{
    resolve(product)  
   }).catch((error)=>{
    reject(error)
   })
  })
},


deleteProducts:(proId)=>{

  return new Promise((resolve,reject)=>{
    try {
      
      db.product.deleteOne({_id:proId}).then(()=>{
        resolve()
      }).catch((error)=>{
        reject(error)
      })
    } catch (error) {
     reject(error) 
    }
  })
},

updateProduct:(proId,proDetails)=>{
  return new Promise(async(resolve,reject)=>{
    try {
      let dropdata=await db.product.findOne({_id:proId})
      if(proDetails.image?.length==0){
        proDetails.image=dropdata?.image
      }
     await db.product.updateOne({_id:proId},
       {
        $set:{
          name:proDetails.name,
          description:proDetails.description,
          catagory:proDetails.catagory,
          price:proDetails.price,
          offerPercentage:proDetails.offerPercentage,
          Offerprice:proDetails.Offerprice,
          stock:proDetails.stock,
          image:proDetails.image
        }
       } 
        )
        
      
        resolve()
      
    } catch (error) {
      reject(error)
    }
  })
},

addCatagory:(catagoryFromUser)=>{

  catagoryFromUser.name= catagoryFromUser.name.toLowerCase()
 return new Promise(async(resolve,reject)=>{
   try {
    
     db.catagory.find({name:catagoryFromUser.name}).then( async(catagory)=>{
      
      console.log(catagory)
       let response={}
       if(catagory.length == 0){
       
         let cata= await db.catagory(catagoryFromUser)
  
  
        cata.save()
        response.data=cata
         response.status=true
  
        resolve(response)
  
      }else{
        resolve({status:false})
      }
  
   })
   } catch (error) {
    reject(error)
   }
})
},

getallCatagory:()=>{
  return new Promise((resolve,reject)=>{
    try {
      
      let cata=db.catagory.find({})
      resolve(cata)
    } catch (error) {
      reject(error)
    }
  })
},

deleteCatagory:(cataId)=>{
 return new Promise((resolve,reject)=>{
  try {
    db.catagory.deleteOne({_id:cataId}).then(()=>{
      resolve()
    })
    
  } catch (error) {
    reject(error)
  }
 })
},

getCatdetails:(cataId)=>{
return new Promise(async(resolve,reject)=>{
  try {
    await db.catagory.findOne({_id:cataId}).then((catagories)=>{
      resolve(catagories)
    })
    
  } catch (error) {
    reject(error)
  }
 
})
},
updateCatagory:(cataId,cataDetails)=>{
return new Promise(async(resolve,reject)=>{
  try {
    
    await db.catagory.updateOne({_id:cataId},
       {
         $set:{
           name:cataDetails.name
         }
       }
       )
       console.log(cataDetails)
       resolve()

  } catch (error) {
    reject(error)
  }
})
},

addbaners:(data)=>{
  return new Promise(async(resolve,reject)=>{
    let baner=await db.banner(data)
    baner.save()
    resolve(baner)
  })
},

getAllBaners:()=>{
 try {
  return new Promise(async(resolve,reject)=>{
    let banners=await db.banner.find({})
     resolve(banners)
  })
 } catch (error) {
  console.log(error);
 }
},

deletebanner:(bannerId)=>{
  try {
    return new Promise((resolve,reject)=>{
      db.banner.deleteOne({_id:bannerId}).then((response)=>{
        console.log(response,'response');
        resolve()
      })
    })
  } catch (error) {
    console.log(error);
  }
},

generateCoupon:()=>{
  try {
    return new Promise((resolve,reject)=>{
    let voucherCode= voucher_codes.generate({
        length: 8,
        count: 1,
        prefix:"cyclo-"

    })
    console.log(voucherCode,'vouchercode');
    resolve({voucherCode:voucherCode})
  })
  
  } catch (error) {
    console.log(error);
    reject({error:error})
  }
},

addCatabaner:(data)=>{
  return new Promise(async(resolve,reject)=>{
    let catabaner=await db.catabaner(data)
    catabaner.save()
    resolve(catabaner)
  })
},

getcataBaners:()=>{
  return new Promise(async(resolve,reject)=>{
    let catabanners= await db.catabaner.find({})
    console.log(catabanners,'namma databanners');
    resolve(catabanners)
  })
},

deleteCatabaner:(banerId)=>{
  return new Promise((resolve,reject)=>{
    db.catabaner.deleteOne({_id:banerId}).then((response)=>{
      console.log(response);
      resolve()
    })
  })
}
}