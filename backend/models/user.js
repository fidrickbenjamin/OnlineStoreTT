import mongoose from "mongoose";
import bcrypt from "bcryptjs"; 
import  jwt  from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter Your Name"],
        maxLength: [50, "Your name cannot exceed 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Please enter Your email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please enter Your password"],
        minLength: [6, "Your password must be longer than 6 characters"],
        select: false,
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    contactPhone: {type:String,maxlength:40,default:""},
    countryOfResidence: {type:String,maxlength:80,default:""},
    shippingInfo: {type:new mongoose.Schema({address:String,city:String,phoneNo:String,zipCode:String,country:String,landmark:String,deliveryNotes:String},{_id:false}),default:undefined},
    savedRecipients: {type:[new mongoose.Schema({label:{type:String,maxlength:40},recipientName:{type:String,maxlength:80},address:String,city:String,phoneNo:String,zipCode:String,country:String,landmark:String,deliveryNotes:String})],default:[]},
    defaultRecipientId: {type:String,default:"self"},
    recipientRevision: {type:Number,default:0},
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, 
{ timestamps: true}
);

// Encrypting Password before saving the user
userSchema.pre("save", async function () {
     if(!this.isModified("password")) return;
     this.password = await bcrypt.hash(this.password, 10);
});

//Return JWT Token
userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRES_TIME,
    }); 
};

// Compare user password 
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {

    // generate token
    const resetToken = crypto.randomBytes(20).toString("hex")

    // hash and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    
    return resetToken;
};

export default mongoose.model("User", userSchema);