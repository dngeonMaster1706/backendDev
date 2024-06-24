import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"

import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const refreshToken= user.generateRefressToken()
        const accessToken=user.generateAccessTokens()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generation tokens")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    //get user details from frontend
    //validation-not empty(details)
    //check if user already exists :: either from username or email
    //check for images , avatar
    //upload them to cloudinary,avatar
    //create user objet - create entry in db
    //remove password and refesh token field from response
    //check for user creation
    //return res;

    //1
    const {fullName,username,email,password}=req.body
    // console.log("email",email);

    // if(fullName===""){
    //     throw new ApiError(400,"FullName is required")
    // }


    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All Fields are required")
    }

    const existedUser=await User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path
    // const coverImageLocalPath=req.files?.coverImage[0]?.path
    // let avatarLocalPath;
    // if(req.files && Array.isArray(res.files.avatar)&&req.files.avatar.length>0){
    //     avatarLocalPath=req.files[0].path
    // }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File is required")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)

    const coverImage=await uploadOnCloudinary(coverImageLocalPath)


    if(!avatar){
        throw new ApiError(400,"Avatar File is required")
    }
   


    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went worng")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )
    // return res.status(200).json({ message: "works fine!" });
})

const loginUser=asyncHandler(async(req,res)=>{
    //req body -> data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie


    const {email,username,password}=req.body

    if(!username || !email){
        throw new ApiError(400,"username or password is required")
    }

    const user= User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(400,"user does not exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user cradentials")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
     
    const loggedInUser=await User.findById(user._id)
    select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User Logged in Successfully"
        )
    )
})


export {
    registerUser,
    loginUser
}
