const { product } = require('../config/connection')
const db=require('../config/connection')
const { proppatch } = require('../routes')

module.exports={


addproduct:(product)=>{
    return new Promise(async(resolve,reject)=>{
      let data=await db.product(product)
      console.log(product);
      data.save()
      resolve(data._id)
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
  return new Promise((resolve,rejuct)=>{
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

addCatagory:(catagory)=>{
 return new Promise(async(resolve,reject)=>{
 let cata=await db.catagory(catagory)
  cata.save()
  resolve(cata)
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

}