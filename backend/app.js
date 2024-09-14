import express from "express";

const app = express();

import dotenv from "dotenv";

import cookieParser from "cookie-parser";

import { connectDatabase } from "./config/dbConnect.js";

import errorMiddleware from "./middlewares/errors.js"; 

import path from "path";
import {fileURLToPath} from "url";

import cartRoutes from "./routes/cartRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Handle Uncaught exceptions
process.on("uncaughtException", (err) => {
    console.log(`ERROR: ${err}`);
    console.log("Shutting down due to uncaught exception");
    process.exit(1);
});

if (process.env.NODE_ENV !== "PRODUCTION")
{ dotenv.config({ path: "backend/config/config.env"}); }

// Connectin to Database
connectDatabase();

app.use(express.json({limit : "10mb" }));
app.use(cookieParser());
app.use("/api", cartRoutes);

//Import All routes
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";


app.use("/api/v2", productRoutes);
app.use("/api/v2", authRoutes);
app.use("/api/v2", orderRoutes);
app.use("/api/v2", paymentRoutes);

if(process.env.NODE_ENV === "PRODUCTION") {
    app.use(express.static(path.join(__dirname, "../frontend/build")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
    } );
}

// Using Error Middlewares
app.use(errorMiddleware);

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});


//Handle unhandled Promise rejections
process.on("unhandledRejection", (err) => {
    console.log(`ERROR: ${err}`);
    console.log("Shutting down server due to unhandled promise rejection");
    server.close(() => { 
       process.exit(1);
    });
});