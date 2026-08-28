import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"//file system
    cloudinary.config({ 
        cloud_name:process.env.cloud_name, 
        api_key: process.env.cloud_api_key, 
        api_secret: process.env.clound_api_secret // Click 'View API Keys' above to copy your API secret
    });
    
const Uploadon=async(localfilepath)=>{
    try{
        if(!localfilepath) return null
        const response=await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        console.log("file is uploaded on cloudinary",response.url)
        return response
    }catch(error){
        fs.unlinkSync(localfilepath)
        // remove the locally saved temporary file as upload operation got failed
        return null;
    }
}
export { Uploadon }
    cloudinary.uploader.upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });