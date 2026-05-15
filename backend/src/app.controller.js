import express from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.controller.js";
import usersRouter from "./modules/users/users.controller.js";
import authAdminsRouter from "./modules/authAdmins/authAdmins.controller.js";
import adminsRouter from "./modules/admins/admins.controller.js";
import mallRouter from "./modules/mall/mall.controller.js";
import storeRouter from "./modules/store/store.controller.js";
import storeMallRouter from "./modules/storeMall/storeMall.controller.js";
import productRouter from "./modules/product/product.controller.js";
import productCategoryRouter from "./modules/productCategory/productCategory.controller.js"
import discountRouter from "./modules/discount/discount.controller.js"
import userRequestRouter from "./modules/userRequest/userRequest.controller.js"
import userRequestStorageRouter from "./modules/userRequestStorage/userRequestStorage.controller.js";
import resultRouter from "./modules/result/result.controller.js"
import roleRequestsRouter from "./modules/roleRequests/roleRequests.controller.js";
import systemAdminRouter from "./modules/systemAdmin/systemAdmin.controller.js";
import notificationsRouter from "./modules/notifications/notifications.route.js";
import paymentRouter from "./modules/payment/payment.controller.js";


export const bootstrap = () => {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());
  
  // Serve static uploads
  app.use('/uploads', express.static('uploads'));

  // Routes
  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/auth/admins", authAdminsRouter);
  app.use("/admins", adminsRouter);
  app.use("/mall", mallRouter);
  app.use("/store", storeRouter);
  app.use("/storeMall", storeMallRouter);
  app.use("/product", productRouter);
  app.use("/productCategory", productCategoryRouter);
  app.use("/discount", discountRouter);
  app.use("/userRequest", userRequestRouter);
  app.use("/userRequestStorage", userRequestStorageRouter);


  app.use("/result", resultRouter);
  app.use("/role-requests", roleRequestsRouter);
  app.use("/system-admin", systemAdminRouter);
  app.use("/notifications", notificationsRouter);
  app.use("/payment", paymentRouter);


  // Test Route
  app.get("/", (req, res) => {
    res.send("API is running");
  });

  // 404 Handler 3ashan law mala2ash el route
  app.use((req, res) => {
    res.status(404).json({
      ok: false,
      message: "Route not found",
    });
  });

  // Error Handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
      ok: false,
      message: err.message || "Server error",
    });
  });

  return app;
};