import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";



dotenv.config();

//console.log(process.env.MONGO_URI);

const app = express();
const PORT = process.env.PORT || 5001;    



//middleware will parse JSON bodies: req.body

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(rateLimiter);

//simple custom middleware example
// app.use((req, res, next) => {
//     console.log(`Req method is ${req.method} and Req URL is ${req.url}`);
//     next();
// });

app.use("/api/notes", notesRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is started on port:" + PORT);
    });
})

//