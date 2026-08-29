import { asyncHandler } from "../utils/asynchandler.js"
console.log("USER ROUTER LOADED");

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

});

export { registerUser }