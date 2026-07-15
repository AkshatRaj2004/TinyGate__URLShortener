const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // Check if .env is loaded
  if (!uri) {
    console.error("❌ MONGO_URI is not defined.");
    console.log("Loaded URI:", uri);
    process.exit(1);
  }

  // Debug info (safe)
  console.log("🔍 Checking MongoDB URI...");
  console.log("Starts with mongodb+srv:// :", uri.startsWith("mongodb+srv://"));
  console.log("Starts with mongodb://     :", uri.startsWith("mongodb://"));

  // Hide password before printing
  const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:********@");
  console.log("Using URI:", safeUri);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("=================================");
    console.log("✅ MongoDB Connected Successfully");
    console.log("Host :", conn.connection.host);
    console.log("DB   :", conn.connection.name);
    console.log("=================================");

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected.");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected.");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB Runtime Error:", err.message);
    });

  } catch (err) {
    console.error("=================================");
    console.error("❌ MongoDB Connection Failed");
    console.error(err.message);
    console.error("=================================");
    process.exit(1);
  }
};

module.exports = connectDB;