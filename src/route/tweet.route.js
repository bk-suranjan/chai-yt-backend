import express from 'express'
import { createTweets, deleteTweet, getUserTweets, updateTweet } from '../controller/tweet.controller.js'
import { protectedRoute } from '../middleware/protectRoute.js'
const route = express.Router()


route.use(protectedRoute)


route.post('/create',createTweets)
route.get('/get-user-tweet',getUserTweets)
route.patch('/tweet-update/:id',updateTweet)
route.delete('/tweet-delete/:id',deleteTweet)
export default route