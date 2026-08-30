import { asyncHandler } from "../utils/asynchandler.js"
import { apiError } from "../utils/apierror.js";
import { User } from "../models/user.models.js";
import { Uploadon } from "../utils/cloundinary.js";
import { apiResponse } from "../utils/apiresponse.js";
const registerUser=asyncHandler( async(req,res)=>{
    // res.status(200).json({
    //     message:"ok"
    // });

    //get user deatils from frontend 
    // validation-not empty
    //check if user exists or not:username or email
    //check for images,avatar
    //upload them on multer-->cloudinary ,avatar check
    //create user object -- create entry in db
    //in response remove refresh token and password
    //response check for user creation 
    //return response or error
// for url we use something else 

    const { fullname,email,username,password }=req.body
    // if(fullname===""){
    //     throw new apiError(400,"fullname is required")
    // }
    if(
       [fullname,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new apiError(400,"All fields are required")
    }
    //checking user exists 
    const existUser=User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser) throw new apiError(409,"User Already exists wit same username and password")
    const avatarLocalpath= req.files?.avatar[0]?.path
    const coverimageLocalpath= req.files?.coverimage[0].path
    if(!avatarLocalpath) throw new apiError(400,"Avatar is required")
    const avatar=await Uploadon(avatarLocalpath)
    const converimage=await Uploadon(coverimageLocalpath)
    if(!avatar) throw new apiError(400,"Avatar is required")
    const user =await User.create({
        fullname,
        avatar:avatar.url,
        coverimage:coverimage?.url||"",
        email,
        password,
        username:username.toLowerCase()

    })
    const checkuser=await User.findById(user._id).select(
        "-password -refreshtoken"
    )//check user and also deselect password etc

    if(!checkuser)  throw new apiError(400,"something get wrong")
    return res.status(201).json(
        new apiResonse(200,checkuser,"user got register succesfully")
    )
    // wean also send simple user but for structure we do this way
});

export { registerUser }