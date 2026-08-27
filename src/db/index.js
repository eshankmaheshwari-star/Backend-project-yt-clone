import mongoose from "mongoose";
import { Db } from "../constants";

const connectDb=async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB.URL}/${Db}`)
        app.on("error",(error)=>{
            console.log("ERROR: ",error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.port}`);
        })
    } catch(error){
        console.error("ERROR: ",error)
        throw error
    }
};

