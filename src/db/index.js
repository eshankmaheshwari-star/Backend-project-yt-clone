import mongoose from "mongoose";
import { Db } from "../constants.js";

const connectDb=async()=>{
    try{
        const connectionResponse=await mongoose.connect(`${process.env.MONGODB_URI}/${Db}`)
        console.log(`\n MongoDB connected|| DB HOST:{connectionResponse.connection.host}`);
    } catch(error){
        console.log("Mongodb Connection ERROR: ",error)
        process.exit(1)
    }
};

export default connectDb