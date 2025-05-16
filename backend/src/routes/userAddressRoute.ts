import { Router } from "express";
import { createUserAddress, getUserAddressesByUserId, getUserAddressesByAddressId, getAllUserAddresses } from "../controllers/userAddressControlles";

const router = Router();


router.post("/", createUserAddress);
router.get("/user/:userId", getUserAddressesByUserId);
router.get("/address/:addressId", getUserAddressesByAddressId);
router.get("/", getAllUserAddresses);

export default router;

