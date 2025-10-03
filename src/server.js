import dotenv from 'dotenv'

// dotenv.config({ path: '/custom/path/to/.env' })
dotenv.config({
    path:'./.env'
})
import app from './app.js'
import connectDB from './DB/connectDB.js'

const PORT = process.env.PORT || 5000;


connectDB().then(()=>{

    app.listen(PORT,()=>{
        console.log("Server is running")
    })
}).catch(()=>{
    console.log('Error while connecting DB',error.message)
})