import Tweets from "../modal/tweet.modal.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createTweets = asyncHandler(
    async(req,res)=>{
        const {content} = req.body;
        const owner = req.user;
        
        // console.log(!!content)
        if(!content || !owner){
            throw new ApiError(400,'content or user required')
        }

        const tweeet = await Tweets.create({
            content,
            owner
        })

          if(!tweeet){
            throw new ApiError(400,'Tweets not create')
          }


          console.log(tweeet)
        
        res.status(200).json(new ApiResponse(200,'tweets created',tweeet))
    })

export const getUserTweets = asyncHandler(async(req,res)=>{
    // console.log(first)
    const tweets = await Tweets.find({owner:req.user?._id})

    if(!tweets){
        throw new ApiError(200,'Cannt fetched tweets')
    }

    // console.log(tweets)
    res.status(200).json(new ApiResponse(200,'tweets fatched',tweets))
})

export const updateTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body;

    if(!content){
        throw new ApiError(400,'Content need to upadate')
    }

    const updatedTweet = await Tweets.findByIdAndUpdate(
        req.params?.id,{
        content,
    },
{
    new:true,
    runValidators:true
})

if(!updatedTweet){
    throw new ApiError(400,'for somereaon tweets not update')
}

res.status(200).json(new ApiResponse(200,'Tweets update',updateTweet))
})

export const deleteTweet = asyncHandler(async(req,res)=>{
    const {id} = req.params
    if(!id){
        throw new ApiError(400,'tweet need to delete tweet')
    }
   const tweeet = await Tweets.findByIdAndDelete(id)

   if(!tweeet){
    throw new ApiError(400,'Tweet not delete for somereason')
   }

   res.status(200).json(new ApiResponse(200,'Tweet delete',{}))

})