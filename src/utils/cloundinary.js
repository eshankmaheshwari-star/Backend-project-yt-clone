import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"//file system
    cloudinary.config({ 
        cloud_name: process.env.cloud_name,
        api_key: process.env.cloud_api_key,
        api_secret: process.env.cloud_api_secret // Click 'View API Keys' above to copy your API secret
    });
    
const Uploadon=async(localfilepath)=>{
    try{
        if(!localfilepath) return null
        const response=await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        //console.log("file is uploaded on cloudinary",response.url)
        fs.unlinkSync(localfilepath)
        return response
    }catch(error){
        console.log("CLOUDINARY ERROR:", error);
        if (localfilepath && fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }
        // remove the locally saved temporary file as upload operation got failed
        return null;
    }
}
export { Uploadon }