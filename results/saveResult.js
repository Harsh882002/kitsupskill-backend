import jwt from "jsonwebtoken";
import { db } from "../database.js";

export const saveResult = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Received token:", token);

    const { testCode, answers, score } = req.body;
    console.log("Body", req.body);

    const answer = JSON.stringify(answers); // Ensure that answers are stringified
    if (!token) {
      return res.status(401).json({ message: "Unauthorized. Token missing." });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded token:", decoded);

    const student_id = decoded?.student_id;
    console.log(score);

    if (!testCode || !student_id) {
      return res.status(400).json({
        message: "Missing required fields: student_id, testCode, or score.",
      });
    }

    const sql =
      "INSERT INTO results (student_id, test_id, answer, score) VALUES (?, ?, ?, ?)";

    // Fix: Swap testCode and answer to match column order
    await db.execute(sql, [student_id, testCode, answer, score]);

    return res.status(201).json({ message: "Result submitted successfully." });
  } catch (error) {
    console.error("Error saving result:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
 