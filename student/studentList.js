import { db } from "../database.js";

export const studentList = async (req, res) => {
  const testcode = req.params.testcode;
  console.log("Testcode received:", testcode);

  try {
    // 1. Get students by testcode
    const [students] = await db.query('SELECT * FROM students WHERE testcode = ?', [testcode]);
    console.log('Students:', students);

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found for this testcode' });
    }

    // 2. Collect student IDs (assuming 'id' is primary key in students table)
    const studentIds = students.map(s => s.id);

    // 3. Fetch results filtered by student_id AND test_id = testcode
    const [results] = await db.query(
      `SELECT * FROM results WHERE student_id IN (?) AND test_id = ?`, [studentIds, testcode]
    );
    console.log('Results:', results);

    // 4. Combine students and their results
    const studentsWithResults = students.map(student => {
      return {
        ...student,
        results: results.filter(r => r.student_id == student.id)  // loose equality check
      };
    });

    // 5. Send response
    res.json(studentsWithResults);

  } catch (err) {
    console.error('Error fetching students or results:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
