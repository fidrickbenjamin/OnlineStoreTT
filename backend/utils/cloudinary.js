import cloudinary from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFile = process.env.NODE_ENV === "PRODUCTION"
    ? path.resolve(__dirname, "../../.env.production")
    : path.resolve(__dirname, "../config/config.env");

dotenv.config({ path: envFile });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    
})


export const upload_file = (file, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload( file, (result) => {
                resolve({
                    public_id: result.public_id,
                    url: result.url,
                });
            }, {
                resource_type: "auto",
                folder,
            }
        );
    });
};


export const delete_file = async (file) => {
  const res = await cloudinary.uploader.destroy(file);
  if(res?.result === "ok") return true;
};

