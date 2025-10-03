import express from 'express'
import { changCoverImage, chnageAvatar, getRefreshToken, getUser, login, logout, register, updateDetails } from '../controller/user.controller.js';
const route = express.Router()
import upload from '../middleware/multer.middleware.js';
import { protectedRoute } from '../middleware/protectRoute.js';


route.post('/register',upload.fields([
    {
        name:'avatar',
        maxCount:1
    },{
        name:'coverImage',
        maxCount:1
    }
]),register)

route.post('/login',login)

// secure route
route.post('/logout',protectedRoute,logout)
route.post('/get-user',protectedRoute,getUser)
route.post('update-detals',protectedRoute,updateDetails)

route.post('/change-avatar',protectedRoute,upload.single('avatar'),chnageAvatar)
route.post('/change-cover',protectedRoute,upload.single('coverImage'),changCoverImage)

route.post('/get-token',getRefreshToken)


export default route;