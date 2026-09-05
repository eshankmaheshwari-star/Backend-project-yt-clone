import { asyncHandler } from "../utils/asynchandler.js"
import { apiError } from "../utils/apierror.js";
import { User } from "../models/user.models.js";
import { Uploadon } from "../utils/cloundinary.js";
import { apiResponse } from "../utils/apiresponse.js";
import  jwt  from "jsonwebtoken";
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

    const { fullname,email,username,password }=req.body
    // if(fullname===""){
    //     throw new apiError(400,"fullname is required")
    // }
    if(
       [fullname,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new apiError(400,"All fields are required")
    }

    //console.log("body: ",req.body);

    //checking user exists 
    const existUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existUser) throw new apiError(409,"User Already exists wit same username and password")

    //console.log("EXISTING USER:", existUser)

    const avatarLocalpath= req.files?.avatar?.[0]?.path
    // const coverimageLocalpath= req.files?.coverimage?.[0]?.path

    let coverimageLocalpath;
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length>0){
        coverimageLocalpath=req.files.coverimage[0].path
    }

    if(!avatarLocalpath) throw new apiError(400,"Avatar is required")

    //console.log("AVATAR PATH:", avatarLocalpath)

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
    //console.log("FILES:", req.files)
    return res.status(201).json(
        new apiResponse(200,checkuser,"user got register succesfully")
    )
    // wean also send simple user but for structure we do this way
})

const loginUser=asyncHandler( async(req,res)=>{
    //login details(not one is empty)
    //email based or u
    //database check-->result
    //access token and refresh token
    //send secure cookie

    const {email,username,password}=req.body

    //console.log("LOGIN BODY:", req.body)

    if(!(username|| email)) throw new apiError(400,"Username or password is required")
    const user=await User.findOne({
        $or: [{username},{email}]
    })
    if(!user)   throw new apiError(404,"User does not exists")


        //console.log("USER FROM DB:", user)

    const check=await  user.isPasswordcorrect(password);
    if(!check){
          throw new apiError(401,"Invalid user Creedentials")
    }

    // console.log("PASSWORD CORRECT:", check)

    const {accesstoken,refreshtoken}=await generateaccessandrefreshtoken(user._id)//only helps to save it in mongo db

        console.log("TOKENS:", accesstoken, refreshtoken)

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
    //console.log("LOGOUT USER:", req.user)
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

const refreshAccesstoken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshtoken || req.body.refreshtoken

    if (!incomingRefreshToken) {
        throw new apiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new apiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accesstoken, newRefreshToken} = await generateaccessandrefreshtoken(user._id)
    
        return res
        .status(200)
        .cookie("accesstoken", accesstoken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200, 
                {accesstoken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token")
    }
    //try catch for more cautious
})
const changecurrentPassword=asyncHandler(async(req,res)=>{
  const {oldpassword,newpassword,cpassword}=req.body
  if(cpassword!==newpassword)  throw new apiError(400,"both password do not match");
  const user=await User.findById(req.user?.id);
  const ispassword=await user.isPasswordcorrect(oldpassword);
  if(!ispassword) throw new apiError(400,"invalid old password");
  user.password=newpassword
  await user.save({validateBeforeSave:false})
  return res.status(200)
  .json(new apiResponse(200,{},"password changed successfully"));
})
const getCurrentuser=asyncHandler(async(req,res)=>{
  return res.status(200)
  .json(200,req.user,"current user fetched successfully")
})
// try to write files in such a way that updating text and files should seperate as text dont go again and again and congestion of our website is low 
const updateaccount=asyncHandler(async(req,res)=>{
  const {fullname,email}=req.body;
  if(!fullname || !email) throw new apiError(400,"all fields are required");
  const user=User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
            fullname,
            email:email
        }
    },
    {new:true}
  ).select("-password")
  return res
  .status(200)
  .json(new apiResponse(200,user,"Account detail updated successfully"))
})
const updateavatar=asyncHandler(async(req,res)=>{
//first we use multer to upload files and auth for checking
    const avatarlocalpath=req.file?.path
    //file as one is uploading previously we use files
    if(!avatarlocalpath)    throw new apiError(400,"files is required");
    const avatar=await Uploadon(avatarlocalpath)
    if(!avatar.url) throw new apiError(400,"error while uploading files of avatar");
    const user=await User.findByIdAndUpdate(req.user?._id
        ,
        {
            $set:{
                avatar:avatar.url//as we are updating it in db .url
            }
        },
        {new:true}
    ).select("-password")
    return res.status(200)
    .json(new apiResponse(200,user,"cover image updated successfully"))
})
const updatecoverimage=asyncHandler(async(req,res)=>{ 
    const coverimagelocalpath=req.file?.path
    //file as one is uploading previously we use files
    if(!coverimagelocalpath)    throw new apiError(400,"files is required");
    const coverimage=await Uploadon(coverimagelocalpath)
    if(!coverimage.url) throw new apiError(400,"error while uploading files of avatar");
    const user=await User.findByIdAndUpdate(req.user?._id
        ,
        {
            $set:{
                coverimage:coverimage.url//as we are updating it in db .url
            }
        },
        {new:true}
    ).select("-password")
    return res.status(200)
    .json(new apiResponse(200,user,"cover image updated successfully"))
})
const getuserchannelprofile=asyncHandler(async(req,res)=>{ 
    const {username}=req.params
    if(!username?.trim()) throw new apiError(400,"username is missing")
    //User.find({username}) can use this to find username.
    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"Subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers" 
            }
        },
        {
            $lookup:{
                from:"Subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedto" 
            }
        },
        {
            $addFields:{
                subscribercount:{
                    $size:"$subscribers"
                },
                channelsubscribedcount:{
                    $size:"$subscribedto"
                },
                issubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else :false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscribercount:1,
                channelsubscribedcount:1,
                issubscribed:1,
                avatar:1,
                coverimage:1,
                email:1,
            }
        }
    ])
    if(!channel?.length) throw new apiError(404,"channel is missing")
    //in return we got arrays

    return res.status(200)
    .json(
        new apiResponse(200,channel[0],"User channel fetched succesfully")
    )
})

// nested lookup for our watch history is important as we go (dont have owner) for owner we have to extra lookup
// users
//   │
//   │ watchHistory[]
//   ▼
// videos
//   │
//   │ owner
//   ▼
// users

const userwatchhistory=asyncHandler(async(req,res)=>{
    //req.user._id//actualy weget string ,as we use mongoose it will convert this into mongo db id
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"Videos",
                localField:"watchhistory",
                foreignField:"_id",
                as:"watchhistory",
                pipeline:[
                    {
                        
                        $lookup:{
                            from:"Users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1,
                                    }
                                },
                                {
                                    $addFields:{
                                        onwer:{
                                            $first:"$owner"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])
    return res.status(200)
    .json(new apiResponse(200,User[0].watchhistory,"watch history fetched successfully"))
})
export { 
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccesstoken,
    getCurrentuser,
    updateaccount,
    changecurrentPassword,
    updateavatar,
    updatecoverimage,
    getuserchannelprofile,
    userwatchhistory,
}

//$first:"autoher_details" can also be syntax for this one