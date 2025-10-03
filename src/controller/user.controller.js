import mongoose from "mongoose";
import User from "../modal/user.modal.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken'

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(400, "User not found");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken
    await user.save({runValidators:false})
    // console.log(accessToken,refreshToken)
    return {
      refreshToken,
      accessToken,
    };
  } catch (error) {
    console.log(error);
  }
};

export const register = asyncHandler(async (req, res) => {
  const { fullName, userName, password, email } = req.body;

  if ([fullName, userName, password, email].some((p) => !p || p.trim() == "")) {
    throw new ApiError(401, "All fields are required");
  }

  const existUser = await User.findOne({
    $or: [{ email, userName }],
  });

  if (existUser) {
    throw new ApiError(401, "User already exists");
  }

  const avatarPath = await req.files?.avatar[0]?.path;

  if (!avatarPath) {
    throw new ApiError(401, "error while upload image");
  }

  let coverImagePath;
  if (req.files && req.files?.coverImage && req.files?.coverImage[0]?.path) {
    coverImagePath = await req.files?.coverImage[0]?.path;
  }

  const avatar = await uploadOnCloudinary(avatarPath);
  if (!avatar) {
    throw new ApiError(400, "Error while uploading image");
  }
  const coverImage = await uploadOnCloudinary(coverImagePath);

  const user = await User.create({
    fullName,
    userName,
    password,
    email,
    avatar: avatar?.secure_url,
    coverImage: coverImage,
  });

  if (!user) {
    throw new ApiError(400, "faild to create user");
  }
  //    const userCopy = {...user}
  //    delete userCopy.password
  //    delete userCopy.refreshToken
  //    console.log(userCopy)

  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .json(new ApiResponse(200, "User Created", { user: createUser }));
});

export const login = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!(userName || email) || !password) {
    throw new ApiError(400, "All field are required");
  }

  const existUser = await User.findOne({
    $or: [{ email }, { userName }],
  });
  if (!existUser) {
    throw new ApiError(400, "email, userName or password is incorrect");
  }

  const checkPassword = await existUser.isPasswordCorrect(password);

  if (!checkPassword) {
    throw new ApiError(400, "email, userName or password is incorrect");
  }

  const { refreshToken, accessToken } = await generateAccessTokenAndRefreshToken(
    existUser._id
  );

//   console.log("Token---------",refreshToken,accessToken)
  const option ={
    //  signed: true,
      httpOnly: true
    }
  

  res
    .status(200)
    .cookie("access_token", accessToken,option)
    .cookie("refresh_token", refreshToken,option)
    .json(new ApiResponse(200, "User login", { user: existUser }));
});

export const logout = asyncHandler(async (req, res) => {
  // const user = User.findById(req.user?.userId)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      // $set: {
      //   refreshToken: "",
      // },
      $unset:{
        refreshToken:1
      }
    },
    {
      new: true,
      runValidators: false,
    }
  );
  if (!user) {
    throw new ApiError(400, "User alredy logout");
  }
  const option ={
    //  signed: true,
      httpOnly: true
    }
  
    res.status(200)
    .clearCookie('access_token',option)
    .clearCookie('refresh_token',option)
    .json(new ApiResponse(200,'User logout'))
    

});

export const getRefreshToken =  asyncHandler(async(req,res)=>{
    const token = req.cookies?.refresh_token || req.body?.refreshToken

    // console.log(token)

    if(!token) {  
        throw new ApiError(400,'Token is not availiable')
    }
     const decoded = await  jwt.verify(token,process.env.ACCESS_TOKEN)

     if(!decoded){
        throw new ApiError(400,'Token is not valid')
     }

     const user = await User.findById(decoded.id)
     if(!user){
        throw new ApiError(400,'user not avialabe')
     }
  
     const {refreshToken,accessToken}  = await generateAccessTokenAndRefreshToken(user._id)
     user.refreshToken = refreshToken
     await user.save()

     res.status(200)
     .cookie('refresh_token',refreshToken)
     .cookie('access_token',accessToken)
     .json(new ApiResponse(200,'Access token upadate'))




})


export const updateDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!(fullName || email || newPassword)) {
    throw new ApiError(400, 'At least one field required to update');
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');


  if (fullName) user.fullName = fullName;
  if (email) user.email = email;

  const updatedUser = await user.save({ runValidators: true });

  res.status(200).json(new ApiResponse(200, { user: updatedUser }, 'User updated'));
});

export const chnageAvatar = asyncHandler(async(req,res)=>{
 const avatarPath =  req?.file?.path
 if(!avatarPath){
  throw new ApiError(400,'avatar are required')
 }

 const avatar = await uploadOnCloudinary(avatarPath)

 if(!avatar){
  throw new ApiError(400,'error while uploading image')
 }



 const user = await User.findByIdAndUpdate(req.user?._id,{
  avatar:avatar?.url,
 },{
  new:true
 }).select('-password')
 if(!user){
  throw new ApiError(400,'You need to login first')
 }


res.status(200).json(new ApiResponse(200,'Avatar changed',user))


})

export const changCoverImage = asyncHandler(async(req,res)=>{

   const coverPath =  req?.file?.path
 if(!coverPath){
  throw new ApiError(400,'Cover image is required')
 }

 const coverImage = await uploadOnCloudinary(coverPath)

 if(!coverImage){
  throw new ApiError(400,'error while uploading image')
 }



 const user = await User.findByIdAndUpdate(req.user?._id,{
  coverImage:coverImage?.url,
 },{
  new:true
 }).select('-password')
 if(!user){
  throw new ApiError(400,'You need to login first')
 }


res.status(200).json(new ApiResponse(200,'coverImage changed',user))

})

export const getUser = asyncHandler(async (req,res)=>{
  const user=req.user;
  res.status(200).json(new ApiResponse(200,user,'Api is fetch'))
})

export const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const {userName} = req.params;

  if(!userName?.trim()){
    throw new ApiError(400,'User name is required')
  }

  const channel = await User.aggregate([
    {
      $match:userName?.trim()
    },
    {
      $lookup:{
        from:'subscriptions',
        localField:'_id',
        foreignField:'channel',
        as:'$subscribers'
      }
    },{
      $lookup:{
        from:'subscriptions',
        localField:'_id',
        foreignField:'subscribers',
        as:'$subscribeTo'
      }
    },
    {
      $addFields:{
        subscriberCount:{
          $size:'$subscribers'

        },
        subscribeToCount:{
          $size:'$subscribeTo'
        },
        isSubscribed:{
          $cond:{
            if:{$in:[req.user?._id,'$subscribers.subscribers'] },
            then:true,
            else:false
          }
        }


      }
    },
    {
      $project:{
         fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
      }
    }
  ])

   
  if(!channel.length){
    throw new ApiError(400,'Channel not found')
  }

  res.status(200).json(new ApiResponse(200,channel[0],'channel data fetched'))

})


export const getWatchHistory = asyncHandler(async(req,res)=>{
  const userId = req.user._id;

  const user = await User.aggregate([
    {
      $match: new mongoose.Types.ObjectId(userId) 
    },
    {
      $lookup:{
        from:'videos',
        localField:'watchHistory',
        foreignField:'_id',
        as:'watchHistory',

          $pipeLine:[
        {
          from:'users',
          localField:'owner',
          foreignField:'_id',
          as:'owner',
          $pipeLine:[
          {
            $project:{
               fullName: 1,
               username: 1,
               avatar: 1
            }
          }
          ]
        },
        
      ],

      },
    
    $addFields:{
      owner:{
        $first:'$owner'
      }
    }

   
    }
  ])

  if(!watchHistory){
    throw new ApiError(400,'Faild to calculate the watch history')
  }

  res.status(200).json(new ApiResponse(200,user[0].watchHistory))

})