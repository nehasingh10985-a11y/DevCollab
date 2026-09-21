import dns from "dns";
import mongoose from "mongoose";

// Workaround for querySrv ENOTFOUND: use public DNS for SRV lookups
dns.setServers(["8.8.8.8", "1.1.1.1"]);
console.log("DNS servers:", dns.getServers());

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
