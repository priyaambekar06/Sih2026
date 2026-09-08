import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/complygem";
  try {
    await mongoose.connect(uri);
    console.log(`[db] MongoDB connected -> ${uri}`);
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err);
    console.error(
      "[db] ComplyGeM requires MongoDB. Start it with `docker compose up mongo` or run a local instance, then restart the API."
    );
    process.exit(1);
  }
}
