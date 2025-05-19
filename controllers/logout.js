import jwt from "jsonwebtoken";
import { db } from "../database.js";

export const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);

    // Check if the Authorization header exists and is in the correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or malformed.",
      });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(" ")[1];

    // Verify the token to ensure it's valid
    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      // Step 1: Insert the token into the blacklist table
      await db.query(
        "INSERT INTO token_blacklist (token, user_id, expires_at) VALUES (?, ?, ?)",
        [
          token,
          decoded.id, // Assuming decoded.id is the user ID from the JWT
          new Date(decoded.exp * 1000), // Token expiry (in milliseconds)
        ]
      );

      // Respond with the success message
      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    });
  } catch (error) {
    console.error("Logout error: ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
 