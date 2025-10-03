import User from "../modal/user.modal.js"
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import jwt from 'jsonwebtoken'


export  const protectedRoute =asyncHandler( async (req,_,next) =>{
    try {
        // console.log(req.cookies.access_token)
        const token = req?.cookies?.access_token || req.header('Authorization')?.replace('Bearer ','')

        if(!token){
            throw new ApiError(400,'token not availabe')
        }

           const decode = await jwt.verify(token,process.env.ACCESS_TOKEN)
           if(!decode)  {
          throw new ApiError(400,'token not vaild')
        }
            //  console.log('decoded -------------',decode)
           const user  = await User.findById(decode.id)

           if(!user){
            throw new ApiError(400,'User not found')
           }

           req.user = user
      next()
    } catch (error) {
        console.log(error)
        throw new ApiError(401,'Token is missing')
    }
})