import { asyncHandler } from "../utils/asynchandler.js"
console.log("USER ROUTER LOADED");

const registerUser=asyncHandler( async(req,res)=>{
    res.status(200).json({
        message:"ok"
    });
});

export { registerUser }