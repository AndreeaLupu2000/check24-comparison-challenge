import { Router, RequestHandler } from "express";
import { registerUser } from "../controllers/userController";

const router = Router();

router.post("/users", registerUser as RequestHandler);

export default router;
