import { apiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
// if res is not used then in standard we can write _ in that place
export const verifyjwt= asyncHandler(async(req,_,next )=>{
//req has access to coookies which we gave by cookie parser
    try {
        const token=req.cookies?.accesstoken||req.header("Authorization")?.replace("Bearer ","")
        if(!token) throw new apiError(401,"Unauthorised request")
        //checking token
        const decodedtoken=await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedtoken?._id).select("-password -refreshtoke")
        if(!user) throw new apiError(401,"INvalid Access token")
        req.user=user;
        next()
    } catch (error) {
        throw new apiError(401,error?.message || "INvalid Access token")
    }
})