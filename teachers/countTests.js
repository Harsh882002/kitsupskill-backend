import { db } from "../database.js";

export const countTests = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS total_tests FROM tests WHERE user_id = ?",
      [user_id]
    );

    res.status(200).json({ count: rows[0].total_tests });
  } catch (error) {
    console.error("Error fetching test count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
