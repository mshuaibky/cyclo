const { product } = require('../config/connection')
const db=require('../config/connection')
const { proppatch } = require('../routes')
const {ObjectId}=require('mongoose')
const { ActivityInstance } = require('twilio/lib/rest/taskrouter/v1/workspace/activity')

var voucher_codes = require('voucher-code-generator');
module.exports={


addproduct:(product)=>{
    return new Promise(async(resolve,reject)=>{
      let data=await db.product(product)
    
      data.save()
      resolve(data)
    })
},


 getAllProducts:()=>{
  return new Promise(async(resolve,reject)=>{
    let Products=await db.product.find({})
    resolve(Products)

  })
},

getproductdetails:(proId)=>{
  return new Promise((resolve,reject)=>{
   db.product.findOne({_id:proId}).then((product)=>{
    resolve(product)  
   })
  })
},


deleteProducts:(proId)=>{
  return new Promise((resolve,reject)=>{
    db.product.deleteOne({_id:proId}).then(()=>{
      resolve()
    })
  })
},

updateProduct:(proId,proDetails)=>{
  return new Promise(async(resolve,reject)=>{
   await db.product.updateOne({_id:proId},
     {
      $set:{
        name:proDetails.name,
        discription:proDetails.description,
        catagory:proDetails.catagory,
        price:proDetails.price,
      }
     } 
      )
      console.log(proDetails);
      resolve()
  })
},

addCatagory:(catagoryFromUser)=>{

  catagoryFromUser.name= catagoryFromUser.name.toLowerCase()
 return new Promise(async(resolve,reject)=>{
 
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
})
},

getallCatagory:()=>{
  return new Promise((resolve,rejuct)=>{
    let cata=db.catagory.find({})
    resolve(cata)
  })
},

deleteCatagory:(cataId)=>{
 return new Promise((resolve,rejuct)=>{
  db.catagory.deleteOne({_id:cataId}).then(()=>{
    resolve()
  })
 })
},

getCatdetails:(cataId)=>{
return new Promise(async(resolve,reject)=>{
  await db.catagory.findOne({_id:cataId}).then((catagories)=>{
    resolve(catagories)
  })
 
})
},
updateCatagory:(cataId,cataDetails)=>{
return new Promise(async(resolve,reject)=>{
 await db.catagory.updateOne({_id:cataId},
    {
      $set:{
        name:cataDetails.name
      }
    }
    )
    console.log(cataDetails)
    resolve()
})
},

addbaners:(data)=>{
  return new Promise(async(resolve,reject)=>{
    let baner=await db.banner(data)
    console.log(baner,'banerssssssssss');
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
}
}