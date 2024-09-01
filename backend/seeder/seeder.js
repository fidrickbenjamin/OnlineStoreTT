import mongoose from "mongoose";
import products from "./data.js";
import Product from "../models/product.js";


const seedProducts = async () => {
    try {
           
        await mongoose.connect("mongodb+srv://Fidrick:Business4483278@onlinestore.maq8h.mongodb.net/onlinesore-v2?retryWrites=true&w=majority&appName=onlinestore");

        await Product.deleteMany();
        console.log("products are deleted");

        await Product.insertMany(products);
        console.log("Products are added");
        process.exit();
    } catch (error) {
        console.log(error.message);
        process.exit();
    }
};

seedProducts();