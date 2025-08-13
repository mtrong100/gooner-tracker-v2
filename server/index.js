import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/dbConnect.js";
import routes from "./routes/routes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [process.env.FRONTEND_URL],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api", routes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port: ${PORT}`);
});
