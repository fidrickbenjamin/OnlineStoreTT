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
    const { name , email, password, shippingInfo } = req.body;

    const user = await User.create({
        name, email, password, shippingInfo,
    });





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
    const user = await User.findOne({ email}).select("+password");

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
    const avatarResponse = await upload_file(req.body.avatar, "onlinestore/avatars");

    // Remove previous avatar
    if(req?.user?.avatar?.url) 
    {
        await delete_file(req?.user?.avatar?.public_id);
    }

    const user = await User.findByIdAndUpdate(req?.user?._id, {
        avatar: avatarResponse,
    });

    res.status(200).json({
        user,
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

    res.status(200).json({
        user,
    });
});

// Update Password => /api/v2/password/update
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req?.user?._id).select("+password");

    // Check the previous user password
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched) {
        return next(new ErrorHandler(" Old password is incorrect", 400));
    }

    user.password = req.body.password;
    user.save();

    res.status(200).json({
        success: true, 
    });
});


// Update User Profile => /api/v2/me/update
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
   
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user._id, newUserData, { new: true, });

    res.status(200).json({
        user, 
    });
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
        user,
    });
});

export const updateShippingInfo = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { shippingInfo: req.body }, // Assuming req.body contains shippingInfo
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: user?.shippingInfo,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to update shipping info" });
    }
};