import express from"express"
import cors from "cors"
import cookieParser from "cookie-parser"
//cookie parser to access user browser and set cookies by the server only for security 
const app= express()
app.use(cors({
    origin:process.env.CORS,
    credentials:true,
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.get("/test", (req, res) => {
    res.json({
        message: "APP IS WORKING"
    });
});
//routes
import userRouter from './routes/user.routes.js'
// routes decalration
app.use("/api/v1/users",userRouter)


export { app }