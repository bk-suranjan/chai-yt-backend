import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors'


const app = express();

app.use(cookieParser())
app.use(cors('*'))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static('public'))

// console.log(express.static('public'))

import userRoute from './route/user.route.js'

app.use('/api/user',userRoute)

app.get('/',(req,res)=>{
    res.status(200).json({message:'Hello world'})
})

export default app;