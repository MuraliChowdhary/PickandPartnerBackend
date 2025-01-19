require("dotenv").config();
const fetch = (...args) =>
import("node-fetch").then(({ default: fetch }) => fetch(...args));

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron"); // Importing cron for scheduling tasks
const PORT = process.env.PORT || 3033;

// Importing routes
const listARoutes = require("./Routes/listARoutes");
const listBRoutes = require("./Routes/listBRoutes");
const utmRoutes = require("./Routes/utmRoutes");
const AdminRoutes = require("./Routes/AdminRoutes");
const { trackUrlClicks, sendDailyDM } = require("./Controllers/trackingClicks");
const { mainDb, secondaryDb } = require("./model/db/db");

const app = express();
app.use(cors({
  origin: "https://pickandpartnerbot-1.onrender.com", // Allow all origins (use cautiously in production)
  methods: ["GET", "POST","PUT","PATCH"], // Limit methods to those you need
  allowedHeaders: ["Content-Type"], // Allow headers required by your bot
}));
app.use(express.json());

// Connect to both databases
Promise.all([mainDb.asPromise(), secondaryDb.asPromise()])
  .then(() => {
    console.log("Both databases connected successfully!");

    // Initialize the change stream and start monitoring for clicks
   // trackUrlClicks(secondaryDb);

    // Schedule the daily DM sending task (run every day at midnight)
    // cron.schedule("0 0 * * *", () => {
    //   console.log("Sending daily DMs to promotees...");
    //   sendDailyDM();
    // });

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to databases:", error);
    process.exit(1);
  });

// API routes
app.use("/api/admin", AdminRoutes);
app.use("/api/", listARoutes);
// app.use("/api/", listBRoutes);
app.use("/api/utm", utmRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("Bot is alive and running!");
});
