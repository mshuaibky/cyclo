const data=require('../config/admindetails')
const bcrypt = require('bcrypt');
const db = require('../config/connection')

module.exports={
 
    adminlogin:(adminData)=>{
        return new Promise((resolve,reject)=>{
            if(data.email==adminData.email){
                bcrypt.compare(adminData.password, data.password).then((loginTrue)=>{
                    let response={}
                    if(loginTrue){
                        response.admin=data
                        response.status=true
                        resolve(response)

                    }
                    else{
                        console.log('login failed invalid password');
                        resolve({status:false})
                    }
                })
            }
            else{
                console.log('email is not valid');
                resolve({status:false})
            }
        })
    },
    getorders:(userId)=>{
       
        return new Promise(async(resolve,reject)=>{
        let orders=await db.order.find({})
               resolve(orders)
         
        })
    },

    
}