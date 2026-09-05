import { Router } from "express";
import { logoutUser,loginUser,registerUser,refreshAccesstoken, changecurrentPassword, getCurrentuser ,updateaccount,updateavatar,updatecoverimage,getuserchannelprofile,userwatchhistory} from "../controller/user.controller.js";
import { upload } from "../midddleware/multer.middleware.js";
import { verifyjwt } from "../midddleware/auth.middleware.js";
const router =Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"coverimage",
            maxCount:1
        }
    ]),
    registerUser)
router.route("/login").post(loginUser)

//secure routes
router.route("/logout").post(verifyjwt,logoutUser)

router.route("/refresh-token").post(refreshAccesstoken)

router.route("/changepassword").post(verifyjwt,changecurrentPassword)
router.route("/current-user").get(verifyjwt,getCurrentuser)
router.route("/updatedetails").patch(verifyjwt,updateaccount)
router.route("/avatar").patch(verifyjwt,upload.single("avatar"),updateavatar)
router.route("/cover-image").patch(verifyjwt,upload.single("coverimage"),updatecoverimage)
router.route("/c/:username").get(verifyjwt,getuserchannelprofile)
router.route("/history").get(verifyjwt,getwatchhistory)
export default router 