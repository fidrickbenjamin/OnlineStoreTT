import express from "express";
import { getFeaturedProducts, getProductDetails, getProducts, newProduct, updateProduct, deleteProduct, createProductReview, getProductReviews, deleteReview, canUserReview, getAdminProducts, uploadProductImages, deleteProductImage } from "../controllers/productControllers.js";
import { createPropertyInquiry, getPropertyInquiries, updatePropertyInquiryStatus } from "../controllers/propertyInquiryController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
import {listPromotions,savePromotion,promotionAction,previewPromotion,activePromotions,getDirectSale,saveDirectSale} from "../controllers/promotionControllers.js";
import {activeSeason,adminSeasons,saveSeasons,previewSeasons} from "../controllers/seasonalControllers.js";
const router = express.Router();
router.get("/appearance/active",activeSeason);
router.route("/admin/appearance").get(isAuthenticatedUser,authorizeRoles("admin"),adminSeasons).put(isAuthenticatedUser,authorizeRoles("admin"),saveSeasons);
router.post("/admin/appearance/preview",isAuthenticatedUser,authorizeRoles("admin"),previewSeasons);
router.get("/promotions/active", activePromotions);
router.route("/admin/promotions").get(isAuthenticatedUser,authorizeRoles("admin"),listPromotions).post(isAuthenticatedUser,authorizeRoles("admin"),savePromotion);
router.post("/admin/promotions/preview",isAuthenticatedUser,authorizeRoles("admin"),previewPromotion);
router.put("/admin/promotions/:id",isAuthenticatedUser,authorizeRoles("admin"),savePromotion);
router.post("/admin/promotions/:id/action",isAuthenticatedUser,authorizeRoles("admin"),promotionAction);
router.route("/admin/products/:id/sale").get(isAuthenticatedUser,authorizeRoles("admin"),getDirectSale).put(isAuthenticatedUser,authorizeRoles("admin"),saveDirectSale);

router.get("/products/featured", getFeaturedProducts);
router.route("/products").get( getProducts);
router.route("/admin/products").post(isAuthenticatedUser, authorizeRoles("admin"), newProduct);

router.route("/admin/products").get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);

router.route("/products/:id").get(getProductDetails);

router.route("/admin/products/:id/upload_images").put(isAuthenticatedUser, authorizeRoles("admin"), uploadProductImages);

router.route("/admin/products/:id/delete_image").put(isAuthenticatedUser, authorizeRoles("admin"), deleteProductImage);

router.route("/admin/products/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct);
router.route("/admin/products/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router.route("/reviews")
.put(isAuthenticatedUser, createProductReview)
.get(isAuthenticatedUser, getProductReviews);

router.route("/admin/reviews").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteReview);

router.route("/can_review").get(isAuthenticatedUser, canUserReview);

router.route("/property_inquiries").post(isAuthenticatedUser, createPropertyInquiry);
router.route("/admin/property_inquiries").get(isAuthenticatedUser, authorizeRoles("admin"), getPropertyInquiries);
router.route("/admin/property_inquiries/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updatePropertyInquiryStatus);

export default router;