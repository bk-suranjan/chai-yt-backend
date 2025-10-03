import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema({
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:'Video'
    }],
    userName:{
        type:String,
        minLength:3,
        required:true,
        unique:true,
        lowercase:true
    },
    email:{
          type:String,
        minLength:3,
        required:true,
        lowercase:true
    },
    fullName:{
          type:String,
        minLength:3,
        required:true,
    },
    avatar:{
        type:String,
        required:true
    },
    coverImage:{
        type:String,
       
    },
    password:{
        type:String,
        required:true,
        minLength:6,
    },
    refreshToken:{
        type:String,
    }
})

userSchema.pre('save',async function (next){
    if(!this.isModified('password')) return next()
    try {
        this.password = await bcrypt.hash(this.password,10)
        next()
    } catch (error) {
        next(error)
    }
})

userSchema.methods.isPasswordCorrect = async function (password) {
    try {
      return  await bcrypt.compare(password,this.password)
    } catch (error) {
        console.log(error)
    }
}

userSchema.methods.generateAccessToken = function () {
    try { 
      return  jwt.sign(
            {
                id:this._id,
                email:this.email,
                userName:this.userName
            },
            process.env.ACCESS_TOKEN,
            {
                expiresIn:process.env.ACCESS_TOKEN_EXPIRE

            }
        )
    } catch (error) {
        console.log(error)
    }
}

userSchema.methods.generateRefreshToken =  async function () {
    try {
        return  jwt.sign(
            {
                id:this._id,
                email:this.email
            },
            process.env.REFRESH_TOKEN,
            {
                expiresIn:process.env.REFRESH_TOKEN_EXPIRE
            }
        )
        
    } catch (error) {
        console.log(error)
    }
}

const User = mongoose.model('User',userSchema)
export default User;