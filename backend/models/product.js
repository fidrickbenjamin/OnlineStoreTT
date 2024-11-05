import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
      name:{
        type: String,
        required: [true, "Please enter product name"],
        maxLength: [200, "Product name cannot exceed 200 characters"],
      },

      price: {
        type: Number,
        required: [true, "Please enter product price"],
        max: [99999.99, "Product price cannot exceed 5 digits"],
        default: 0.00,
        set: value => {
            if (typeof value === 'number' && !isNaN(value)) {
                return parseFloat(value.toFixed(2));  // Ensures 2 decimal places
            }
            return value;  // Returns the value as-is if it's not a valid number
        }
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
      main: {
        type: String,
        required: [true, "Please enter product category"],
        enum: ["Electronics", "Accessories", "Laptops", "Tablets", "Smart Phones", "Headphones", "Desktops", "Gaming Accessories", "Clothing", "Utilities"]
      },
      sub: {
        type: String,
        required: [true, "Please enter product subcategory"],
        validate: {
          validator: function(value) {
            const subCategoriesByCategory = {
              "Electronics": ["Audio", "Video", "Wearables", "Cameras", "Home Entertainment"],
              "Accessories": ["Chargers", "Cables", "Bags", "Screen Protectors", "Mounts"],
              "Laptops": ["Gaming Laptops", "Ultrabooks", "Business Laptops", "2-in-1", "Student Laptops"],
              "Tablets": ["Android Tablets", "iPads", "Windows Tablets", "Kids Tablets"],
              "Smart Phones": ["Android Phones", "iPhones", "5G Phones", "Refurbished Phones"],
              "Headphones": ["In-Ear", "Over-Ear", "Wireless", "Noise-Canceling", "Gaming Headsets"],
              "Desktops": ["Gaming Desktops", "All-in-One", "Mini PCs", "Workstations"],
              "Gaming Accessories": ["Controllers", "VR Headsets", "Gaming Mice", "Keyboards", "Gaming Chairs"],
              "Clothing": ["Men", "Women", "Kids", "Activewear", "Footwear", "Accessories"],
              "Utilities": ["Home Appliances", "Kitchen Gadgets", "Cleaning Tools", "Storage Solutions"]
            };
            const allowedSubCategories = subCategoriesByCategory[this.category.main];
            return allowedSubCategories ? allowedSubCategories.includes(value) : true;
          },
          message: "Invalid subcategory for the selected category",
        }
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