import { Router } from "express";
import { createUserAddress, getAllUserAddresses, getLastUsedAddressByUserId } from "../controllers/userAddressControlles";

const router = Router();


router.post("/", createUserAddress);
router.get("/", getAllUserAddresses);
router.get("/lastUsed/:userId", getLastUsedAddressByUserId);

export default router;

