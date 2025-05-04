import { Router, RequestHandler } from "express";
import { registerUser, getUserByID, getAllUsers, updateUser, deleteUser, updateShares } from "../controllers/userController";

const router = Router();

router.post("/users", registerUser as RequestHandler);
router.get("/users/:id", getUserByID as RequestHandler);
router.get("/users", getAllUsers as RequestHandler);
router.put("/users/:id", updateUser as RequestHandler);
router.delete("/users/:id", deleteUser as RequestHandler);
router.put("/users/:id/shares", updateShares as RequestHandler);

export default router;
