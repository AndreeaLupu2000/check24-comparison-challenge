import { Router } from "express";
import { createUserAddress, getUserAddressesByUserId, getUserAddressesByAddressId, getAllUserAddresses, getLastUsedAddressByUserId } from "../controllers/userAddressControlles";

const router = Router();


router.post("/", createUserAddress);
router.get("/user/:userId", getUserAddressesByUserId);
router.get("/address/:addressId", getUserAddressesByAddressId);
router.get("/", getAllUserAddresses);
router.get("/lastUsed/:userId", getLastUsedAddressByUserId);

export default router;

