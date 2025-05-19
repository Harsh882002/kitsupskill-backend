import { db } from "../database.js";

export const getAllTests = async (req, res) => {
  try {
    const sql = "SELECT * FROM tests";
    const [rows] = await db.execute(sql); // Destructure only the data
    res.status(200).json({
      success: true,
      data: rows, // rows is now an array of test objects
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch tests",
    });
  }
};
