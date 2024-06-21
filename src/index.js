// require('dotenv').config({path :'./env'})
import  dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express"
const app=express()
dotenv.config({
    path : './env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on PORT: ${process.env.PORT} `);
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed !! ",err);
})

/*
const app=express()

//Approach 1
//Connecting DataBase using Async await to handle errors


(async()=>{
    try {
        await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("app is not able to talk to database",error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("ERROR",error)
        throw err
    }
})()
    */