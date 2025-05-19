import { db } from "../database.js";

export const fetchTeacherTests = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "Missing user_id" });
  }

  try {
     const sql = `
      SELECT 
        t.testcode,
        t.title,
        t.duration,
        t.created_at,
        s.name AS studentName,
        s.email,
        r.score,
        r.submitted_at
      FROM 
        tests t
      LEFT JOIN 
        students s ON s.testcode = t.testcode
      LEFT JOIN 
        results r ON r.student_id = s.id AND r.test_id = t.testcode
      WHERE 
        t.user_id = ?
      ORDER BY t.testcode;
    `;
    const [rows] = await db.execute(sql, [user_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No test data found." });
    }

    // Grouping data by testcode
    const grouped = {};
    rows.forEach((row) => {
      const {
        testcode,
        title,
        duration,
        created_at,
        studentName,
        email,
        score,
        submitted_at,
      } = row;

      if (!grouped[testcode]) {
        grouped[testcode] = {
          testcode,
          title,
          duration,
          created_at,
          students: [],
        };
      }

      grouped[testcode].students.push({
        name: studentName,
        email,
        score,
        submitted_at,
      });
    });

    // Convert grouped object to array
    const resultArray = Object.values(grouped);

    res
      .status(200)
      .json({ message: "Test data fetched successfully", data: resultArray });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server error" });
  }
};
