import { Router, RequestHandler } from "express";
import { registerUser, getUserByID, getAllUsers } from "../controllers/userController";

const router = Router();

router.post("/", registerUser as RequestHandler);
router.get("/:id", getUserByID as RequestHandler);
router.get("/", getAllUsers as RequestHandler);


export default router;
