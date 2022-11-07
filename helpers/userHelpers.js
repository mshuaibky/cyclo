const db=require('../config/connection')
const bcrypt=require('bcrypt')

module.exports={

    doSignup:(userData) => {
        console.log(userData)

        return new Promise(async(resolve,reject)=>{
      db.users.find({email:userData.email}).then(async(data)=>{
        let response={}
        if(data.length!=0){
            resolve({status:false})
        }else{
            userData.password=await bcrypt.hash(userData.password,10)
            let data=await db.users(userData)
            data.save()
            response.value=userData
            response.status=true
            response.data=data.insertedId
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
                        response.user=user
                        response.status=true
                        resolve(response)
                    }
                    else {
                        console.log("login failed");
                        resolve({status:false})
                    }
                })
            } else {
                console.log("login failed");
                resolve({status:false})
            }



        })
    }
}