const db=require('../config/connection')


module.exports={
addUsers:(userData)=>{
    return new Promise(async(resolve,reject)=>{
        let users= await db.users(userData)
        users.save()
        resolve(users)
    })
},
getAllUsers:()=>{
    return new Promise(async(resolve,reject)=>{
      let Users=await db.users.find({})
      resolve(Users)
  
    })
  },

  blockUser:(userId)=>{
   return new Promise((resolve,reject)=>{
    try{
        db.users.updateOne({_id:userId},
            {
                $set:{
                    status:false
                }
            }
            ).then((data)=>{
                resolve(data)
            })
    }catch(error){
        console.log(error);
    }
   })
  },
  
  unblockUser:(userId)=>{
    return new Promise((resolve,reject)=>{
        try{
            db.users.updateOne({_id:userId},
                {
                    $set:{
                        status:true
                    }
                }
                ).then((data)=>{
                    resolve(data)
                })
        }catch(error){
           console.log(error);
        }
    })
  }
}