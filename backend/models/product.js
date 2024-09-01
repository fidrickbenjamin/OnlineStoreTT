import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
      name:{
        type: String,
        required: [true, "Please enter product name"],
        maxLength: [200, "Product name cannot exceed 200 characters"],
      },

      price: {
        type: Number,  // Use Number instead of Float
        required: [true, "Please enter product price"],
        max: [99999.99, "Product price cannot exceed 5 digits"],
        default: 0.00,
        set: value => parseFloat(value.toFixed(2))  // Ensures 2 decimal places
      },

      description:{
        type: String,
        required: [true, "Please enter product description"],
      },

      ratings: {
        type: Number,
        default: 0,
      },
      images: [
        {    
        public_id: {
            type:String,
            required: true,
         }, 
        url: {
            type:String,
            required: true,
        },
    },

    ],
    category: {
        type: String,
        required: [true, "Please enter product category"],
        enum: {
            values: ["Electronics","Accessories","Laptops","Tablets","Smart Phones","Headphones","Desktops","Gaming Accessories"],
            message: "Please select the correct category",
        }
    },
    seller:{
        type: String,
        required: [true, "Please enter product seller"],
      },
      stock: {
        type: Number,
        required: [true, "Please enter product stock"],
      },
      numOfReviews: {
        type: Number,
        default: 0,
      },
      reviews: [
        {
             user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
             },

             rating: {
                type: Number,
                required: true,
             },

             comment: {
                type: String,
                required: true,
             },


        }
    ],

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
     },

}, { timestamps: true}
);

export default mongoose.model("Product", productSchema);