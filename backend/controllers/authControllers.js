import {cleanText,contactPhone,deliveryAddress,safeUser} from "../utils/accountRules.js";
import {decodeProof} from "../utils/orderRules.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/sendToken.js";
import sendEmail from "../utils/sendEmail.js";
import { getResetPasswordTemplate } from "../utils/emailTemplates.js";
import crypto from "crypto";
import {  delete_file, upload_file } from "../utils/cloudinary.js"

// Register user => /api/v2/register

export const registerUser = catchAsyncErrors (async (req, res, next) => {
    let data;
    try{
      const name=cleanText(req.body.name,"Name",50,true),email=cleanText(req.body.email,"Email",254,true).toLowerCase();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error("Enter a valid email address.");
      if(typeof req.body.password!=="string"||req.body.password.length<6||req.body.password.length>128)throw Error("Use a password between 6 and 128 characters.");
      data={name,email,password:req.body.password,contactPhone:contactPhone(req.body.contactPhone),countryOfResidence:cleanText(req.body.countryOfResidence||req.body.shippingInfo?.country||"Dominica","Country of residence",80,true)};
      if(req.body.shippingInfo?.address&&String(req.body.shippingInfo.country||"Dominica").toLowerCase()==="dominica")data.shippingInfo=deliveryAddress(req.body.shippingInfo);
    }catch(error){throw new ErrorHandler(error.message,400);}
    const user = await User.create(data);




   sendToken(user, 201, res);
});

const register = async (userData) => {
    const response = await fetch('/api/v2/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    return response.json();
};




// Login user => /api/v2/login

export const loginUser = catchAsyncErrors (async (req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return next(new ErrorHandler("Please enter email & password", 400));
    }


    // Find user in the database
    let user = await User.findOne({email:String(email).trim()}).select("+password");
    if(!user)user=await User.findOne({email:String(email).trim().toLowerCase()}).select("+password");

    if(!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }


    // Check if password is correct 

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }



    sendToken(user, 200, res);
});


// Logout user => /api/v2/logout
export const logout = catchAsyncErrors (async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
});

    res.status(200).json({
        message: "Logged Out",
    });
});


// Upload user avatar => /api/v2/me/upload_avatar
export const uploadAvatar = catchAsyncErrors(async (req, res, next) => {
    try{decodeProof(req.body.avatar);}catch(error){throw new ErrorHandler(error.message.replace(/Receipt/g,"Photo").replace(/receipt/g,"photo"),400);}
    const avatarResponse = await upload_file(req.body.avatar, "onlinestore/avatars");
    if(!avatarResponse?.url||!avatarResponse.public_id)throw new ErrorHandler("The photo service could not save your image. Please try again.",502);

    // Remove previous avatar
    if(req?.user?.avatar?.url) 
    {
        await delete_file(req?.user?.avatar?.public_id);
    }

    const user = await User.findByIdAndUpdate(req?.user?._id, {
        avatar: avatarResponse,
    },{new:true});

    res.status(200).json({
        user: safeUser(user),
    });
});



// forgot password => /api/v2/password/forgot
export const forgotPassword = catchAsyncErrors (async (req, res, next) => {
  
    // Find user in the database
    const user = await User.findOne({ email: req.body.email });

    if(!user) {
        return next(new ErrorHandler("User not found with this email", 404));
    }


    // Get reset password token

    const resetToken = user.getResetPasswordToken();

    await user.save();

    // Create reset password url 
const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;


    const message = getResetPasswordTemplate(user?.name, resetUrl);

    try {
            await sendEmail({
                email: user.email,
                subject: "Online Store TT Password Recovery",
                message,
            });
            res.status(200).json({
                message: `Email sent to: ${user.email}`,
            });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        return next(new ErrorHandler(error?.message, 500));
    } 
});


// Reset password => /api/v2/password/reset/:token

export const resetPassword = catchAsyncErrors (async (req, res, next) => {

    // Hash the URL Token
   const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");


   const user = await User.findOne( {
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
   });

   if(!user) {
    return next(new ErrorHandler("Password reset token is invalid or has been expired", 400));

}

    if(req.body.password != req.body.confirmPassword) {
        return next(new ErrorHandler("Passwords does not match", 400));
    }

    // Set the new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    
     sendToken(user, 200, res);
});


// Get current user profile => /api/v2/me
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req?.user?._id);

    res.set("Cache-Control","private, no-store").status(200).json({
        user: safeUser(user),
    });
});

// Update Password => /api/v2/password/update
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req?.user?._id).select("+password");

    // Check the previous user password
    if(typeof req.body.oldPassword!=="string"||!req.body.oldPassword)throw new ErrorHandler("Enter your current password.",400);
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched) {
        return next(new ErrorHandler(" Old password is incorrect", 400));
    }

    if(typeof req.body.password!=="string"||req.body.password.length<6||req.body.password.length>128)throw new ErrorHandler("Use a password between 6 and 128 characters.",400);
    user.password = req.body.password;
    await user.save();

    res.status(200).json({
        success: true, 
    });
});


// Update User Profile => /api/v2/me/update
export const updateProfile = catchAsyncErrors(async (req, res, next) => {

    const current=await User.findById(req.user._id).select("+password");
    let data;
    try{
      data={name:cleanText(req.body.name,"Name",50,true),email:cleanText(req.body.email,"Email",254,true).toLowerCase(),contactPhone:req.body.contactPhone===undefined?current.contactPhone||"":contactPhone(req.body.contactPhone),countryOfResidence:cleanText(req.body.countryOfResidence||current.countryOfResidence||"Dominica","Country of residence",80,true)};
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))throw Error("Enter a valid email address.");
    }catch(error){throw new ErrorHandler(error.message,400);}
    if(data.email.toLowerCase()!==current.email.toLowerCase()&&(!req.body.currentPassword||!await current.comparePassword(req.body.currentPassword)))throw new ErrorHandler("Enter your current password to change your email address.",400);
    const user=await User.findByIdAndUpdate(req.user._id,{$set:data},{new:true,runValidators:true});
    res.json({success:true,user:safeUser(user)});
});


// Get all Users - ADMIN => /api/v2/admin/users
export const allUsers = catchAsyncErrors(async (req, res, next) => {
   
  const users = await User.find();

    res.status(200).json({
        users, 
    });
});




  // Get Users details - ADMIN => /api/v2/admin/users/:id
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
   
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }
  
      res.status(200).json({
          user, 
      });
  });


// Update User Details - ADMIN => /api/v2/admin/users/:id
export const updateUser = catchAsyncErrors(async (req, res, next) => {
   
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, { new: true, });

    res.status(200).json({
        user, 
    });
});


  // Delete User - ADMIN => /api/v2/admin/users/:id
  export const deleteUser = catchAsyncErrors(async (req, res, next) => {
   
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }
    
    //  Remove user avatar from cloudinary

    if (user?.avatar?.public_id) {
        await delete_file(user?.avatar?.public_id);
    }

    await user.deleteOne();
  
      res.status(200).json({
          success: true, 
      });
  });


  // Update user profile => /api/v2/me/update
export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        shippingInfo: req?.body?.shippingInfo,
    };

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        user: safeUser(user),
    });
});

export const updateShippingInfo = catchAsyncErrors(async(req,res)=>{
 let shippingInfo;try{shippingInfo=deliveryAddress(req.body);}catch(error){throw new ErrorHandler(error.message,400);}
 const user=await User.findByIdAndUpdate(req.user._id,{$set:{shippingInfo}},{new:true,runValidators:true});
 res.json({success:true,data:user.shippingInfo,user:safeUser(user)});
});
