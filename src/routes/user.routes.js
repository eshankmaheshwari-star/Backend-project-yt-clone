import { Router } from "express";
import { logoutUser,loginUser,registerUser } from "../controller/user.controller.js";
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

export default router 