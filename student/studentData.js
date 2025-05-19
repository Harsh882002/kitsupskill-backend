import { db } from "../database.js";
import jwt from "jsonwebtoken";

export const studentData = async (req, res) => {
  try {
    // ✅ Correctly destructure from studentData
    const { name, email, number, collegename, city, testCode } = req.body;

    console.log("Received testCode:", testCode);

    if (!name || !email || !number || !collegename || !city) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const checkSql = `SELECT * FROM students WHERE email = ? OR number = ?`;
    const [existing] = await db.execute(checkSql, [email, number]);

    if (existing.length > 0) {
      const student = existing[0];
      const token = jwt.sign(
        { student_id: student.id },
        process.env.SECRET_KEY,
        { expiresIn: "3h" }
      );

      return res.status(200).json({
        message: "Already registered. Proceed to test",
        token: token,
        student: {
          id: student.id,
          name: student.name,
          collegename: student.collegename,
        },
      });
    }

    const insertSql = `
      INSERT INTO students (name, email, number, collegename, city, testcode)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(insertSql, [
      name,
      email,
      number,
      collegename,
      city,
      testCode || null, // ✅ Optional chaining fallback if testCode is undefined
    ]);

    const student_id = result.insertId;

    const token = jwt.sign({ student_id }, process.env.SECRET_KEY, {
      expiresIn: "3h",
    });

    return res.status(201).json({
      message: "Submitted successfully",
      token: token,
      student: {
        id: student_id,
        name,
      },
    });
  } catch (error) {
    console.error("Error inserting student data:", error);
    return res.status(500).json({ message: error.message });
  }
};
