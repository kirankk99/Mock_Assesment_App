import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Thrown lazily (inside connectDB) in dev, but we warn early too.
  console.warn(
    "MONGODB_URI is not set. Add it to .env.local (dev) or your Netlify site's environment variables (prod)."
  );
}

// Cache the connection across hot reloads / serverless invocations.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local (dev) or your Netlify site's environment variables (prod)."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
