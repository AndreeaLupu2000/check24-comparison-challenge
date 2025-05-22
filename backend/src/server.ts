// src/server.ts

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import offersRoutes from "./routes/offerRoute";
import userRoutes from "./routes/userRoute";
import shareRoutes from "./routes/shareRoute";
import cors from "cors";
import addressRoutes from "./routes/addressRoute";
import userAddressRoutes from "./routes/userAddressRoute";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/offers", offersRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/userAddresses", userAddressRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("API is running");
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
