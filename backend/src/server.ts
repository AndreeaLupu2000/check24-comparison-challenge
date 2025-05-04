// src/server.ts

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import offersRoutes from "./routes/offerRoute";
import userRoutes from "./routes/userRoute";
import shareRoutes from "./routes/shareRoute";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", offersRoutes);
app.use("/api", userRoutes);
app.use("/api", shareRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("API is running");
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
