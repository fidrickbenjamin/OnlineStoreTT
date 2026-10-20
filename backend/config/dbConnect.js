import mongoose from "mongoose";
export const connectDatabase = () => {
    let DB_URI = ""
    if (process.env.NODE_ENV === "DEVELOPMENT") DB_URI = process.env.DB_LOCAL_URI;
    if (process.env.NODE_ENV === "PRODUCTION") DB_URI = process.env.DB_URI;
    if (!DB_URI) throw new Error("Database URI is not configured for the current environment");
    mongoose.connect(DB_URI).then((con) => { 
        console.log(`MongoDB Database connected with HOST: ${con?.connection?.host}`);
    }).catch((error) => { console.error("MongoDB connection failed:", error.message); process.exit(1); });
};
