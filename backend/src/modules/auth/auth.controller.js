import express from "express";
import { register, login, me, googleLogin, facebookLogin } from "./auth.service.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Auth module working");
});

router.post("/register", register);

router.post("/login", login);

router.post("/google", googleLogin);

router.post("/facebook", facebookLogin);

router.get("/me/:id", me);

export default router;