import { asyncHandler } from "../utils/asyncHandler";

const registerUser=asyncHandler(async(req,res)=>{
    return res.status(400).json({
        message:"okkk"
    })
})

export {
    registerUser,
}