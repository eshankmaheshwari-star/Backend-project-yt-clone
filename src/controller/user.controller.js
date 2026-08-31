import { asyncHandler } from "../utils/asynchandler.js"
import { apiError } from "../utils/apierror.js";
import { User } from "../models/user.models.js";
import { Uploadon } from "../utils/cloundinary.js";
import { apiResponse } from "../utils/apiresponse.js";

//asyncHandler is used for webrequest as this func handled internally that why async
const generateaccessandrefreshtoken=async(userid)=>{
    try{
        const user=await User.findById(userid)
        const accesstoken=user.generateAccesstoken()
        const refreshtoken=user.generateRefreshtoken()
        user.refreshtoken=refreshtoken
        await user.save({ validateBeforeSave:false })
        return {accesstoken,refreshtoken}
    }catch(error){
        throw new apiError(500,"something went wrong while generating refrresh and access token")
    }
}


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
    const existUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existUser) throw new apiError(409,"User Already exists wit same username and password")
    const avatarLocalpath= req.files?.avatar[0]?.path
    // const coverimageLocalpath= req.files?.coverimage[0]?.path

    let coverimageLocalpath;
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length>0){
        converimagelocalpath=req.files.coverimage[0].path
    }

    if(!avatarLocalpath) throw new apiError(400,"Avatar is required")
    const avatar=await Uploadon(avatarLocalpath)
    const coverimage=await Uploadon(coverimageLocalpath)
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
        new apiResponse(200,checkuser,"user got register succesfully")
    )
    // wean also send simple user but for structure we do this way
});

const loginUser=asyncHandler( async(req,res)=>{
    //login details(not one is empty)
    //email based or u
    //database check-->result
    //access token and refresh token
    //send secure cookie

    const {email,username,password}=req.body
    if(!(username|| email)) throw new apiError(400,"Username or password is required")
    const user=await User.findOne({
        $or: [{username},{email}]
    })
    if(!user)   throw new apiError(404,"User does not exists")

    const check=await  user.isPasswordcorrect(password);
    if(!check){
          throw new apiError(401,"Invalid user Creedentials")
    }
    const {accesstoken,refreshtoken}=await generateaccessandrefreshtoken(user._id)//only helps to save it in mongo db

    const loggedinuser=await User.findById(user._id).select("-password -refreshtoken")
    
    const options={
        httpOnly:true,//only server modified
        secure:true
    }
    return res
    .status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(
        new apiResponse(
            200,
            {
                user:loggedinuser,accesstoken,refreshtoken
            },
            "User logged in Succcessfully"
        )
    )
})    

const logoutUser=asyncHandler( async(req,res)=>{
    //middleware can be used for finding the user id
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshtoken:undefined
            }
        },
        {
            new:true
        }
    )
        const options={
        httpOnly:true,//only server modified
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refreshtoken",options)
    .json(
        new apiResponse(
            200,
            {},
            "User logged out Succcessfully "
        )
    )
}) 
export { 
    registerUser, 
    loginUser,
    logoutUser
}