// src/server.ts

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import offersRoutes from "./routes/offerRoute";
import userRoutes from "./routes/userRoute";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api", offersRoutes);
app.use("/api", userRoutes);
app.get("/", (req: Request, res: Response) => {
    res.send("API is running");
  });
  

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
