const mongoose=require('mongoose')
const {ObjectId}=require('mongoose')
const db=mongoose.createConnection('mongodb://localhost:27017/cycles')


db.on('error',(err)=>{
    console.log(err);
})


db.once('open',()=>{
    console.log('data base connected');
})


const productschema= new mongoose.Schema({
    name:String,
    catagory:String,
    price:Number,
    description:String
})

const Userschema= new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    phone:Number,
    status:{
        type:Boolean,
        default:true
    }
    
})

const catagoryschema= new mongoose.Schema({
    name:String
})

const cartschema=new mongoose.Schema({
user:mongoose.Types.ObjectId,
products:[{
    item: mongoose.Types.ObjectId,
    quantity: Number,
    name:String

}]
})


const addressschema=new mongoose.Schema({
  user:mongoose.Types.ObjectId,
  address:[{
    firstname:String,
    lastname:String,
    country:String,
    street:String,
    city:String,
    state:String,
    pincode:Number,
    phone:Number,
    email:String,
  }]
})

const orderschema=new mongoose.Schema({
    userId:mongoose.Types.ObjectId,
   orders:[
    {
        firstname:String,
        lastname:String,
        phone:Number,
        paymentMethod:String,
        productDetails:Array,
        totalPrice:Number,
        shippingAddress:Object,
        createdAt:{
            type:Date,
            default:new Date()
        },
        status:{
            type:Boolean,
            default:true
        }
    }
   ]
}) 

module.exports={
    product:db.model('products',productschema),
    users:db.model('Users',Userschema),
    catagory:db.model('catagory',catagoryschema),
    cart:db.model('cart',cartschema),
    address:db.model('address',addressschema),
    order:db.model('order',orderschema)
}


