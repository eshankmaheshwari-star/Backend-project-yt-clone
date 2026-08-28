import mongoose,{model, Schema} from "mongoose"
import jwt from "jsonwebtoken"//it is like a key
const userSchema=new mongoose.Schema({
  username:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true,//optimise serach as this field uses for the seraching purpose more 
  },
  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true, 
  },
  fullname:{
    type:String,
    required:true,
    trim:true,
    index:true,
  },
  avatar:{
    type:String,
    required:true
  },
  coverimage:{
    type:String, 
  },
  watchhistory:{
    type:Schema.Types.ObjectId,
    ref:"Video",
    required:true,
  },
  password:{
    type:String,
    required:[true,'Password is required']
  },
  refreshtoken:{
    type:String,
  },
}, {timestamps:true})
// dont write it in callback function as this reference is not known
userSchema.pre("save",async function (next) {
  if(!this.atModified("password")) return next();
  this.password=bcrypt.hash(this.password,10)
  next()
})
userSchema.methods.isPasswordcorrect=async function(password){
  return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccesstoken=function(password){
  return jwt.sign(
    {
    _id:this._id,
    email:this.email,
    username:this.username,
    fullname:this.fullname,
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
  }
)
}
userSchema.methods.generateRefreshtoken=function(password){
  return jwt.sign(
    {
    _id:this._id,
  },
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
  }
  )
}
export const User=model("User",userSchema)