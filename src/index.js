// require('dontenv').config({path:'./env'}) worst code consistency
import dotenv from"dotenv"
import express from "express";
const app=express()
import connectDb from "./db/index.js";
dotenv.config({path:'./env'})
// function connectDb(){

// }
// connectDb() 

//more professional


// more complex it become

// ;( async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB.URL}/${Db}`)
//         app.on("error",(error)=>{
//             console.log("ERROR: ",error);
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`app is listening on port ${process.env.port}`);
//         })
//     } catch(error){
//         console.error("ERROR: ",error)
//         throw error
//     }
// })()

connectDb() 