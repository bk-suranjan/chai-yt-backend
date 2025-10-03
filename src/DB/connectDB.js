import mongoose from "mongoose";

const connectDB = async () =>{
    // console.log(process.env.DB)
    try {
        await mongoose.connect(process.env.DB).then(()=>{
            console.log('DB is connected')
        })
    } catch (error) {
        console.log(error.message)
    }
}

export default connectDB