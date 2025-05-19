import { db } from "../database.js";

export const getResult = async (req, res) => {
  try {
    const { testCode } = req.params;
    console.log("code", req.params);

    if (!testCode) {
      return res.status(400).json({ message: "testCode is required." });
    }

    // 1. Fetch result by id
    const sql = "SELECT * FROM students WHERE id = ?";
    const [results] = await db.execute(sql, [testCode]);

    if (results.length === 0) {
      return res.status(404).json({ message: "No result found." });
    }

    const result = results[0];
    // console.log("result", result.student_id);
    const studentId = result.id;
    // console.log("studentId", studentId);

    // // 2. Fetch student info
    const studentSql = "SELECT * FROM results WHERE student_id = ?";
    const [studentData] = await db.execute(studentSql, [studentId]);

    if (studentData.length === 0) {
      return res.status(404).json({ message: "Student not found." });
    }

    // 3. Fetch test info
    const test_id = studentData[0].test_id;
    const testSql = "SELECT * FROM tests WHERE testcode = ?";
    const [testData] = await db.execute(testSql, [test_id]);

    if (testData.length === 0) {
      return res.status(404).json({ message: "Test not found." });
    }

    return res.status(200).json({
      result,
      student: studentData[0],
      test: testData[0],
    });

  } catch (error) {
    console.error("Error fetching result and student:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
