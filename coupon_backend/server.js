const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cookieParser = require("cookie-parser");


require("dotenv").config();
const cors = require("cors");

connectDB();
const app = express();
app.use(express.json());

app.use(cookieParser());

app.use(cors({ origin: process.env.FRONTEND, credentials: true }));

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
