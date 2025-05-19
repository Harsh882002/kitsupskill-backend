import { db } from "../database.js";

export const getUsersCount = async (req, res) => {
  try {
    // 1. Count roles from users
    const userQuery = `
      SELECT role, COUNT(*) AS count
      FROM users
      WHERE role IN ('superadmin', 'institutes', 'teachers')
      GROUP BY role
    `;
    const [userRows] = await db.execute(userQuery);

    const counts = {
      superadmin: 0,
      institutes: 0,
       students: 0, // Add student count here
       quizzes:0,
    };

    userRows.forEach(row => {
      counts[row.role] = row.count;
    });

    // 2. Count total students
    const studentQuery = `SELECT COUNT(*) AS studentCount FROM students`;
    const [studentRows] = await db.execute(studentQuery);
    counts.students = studentRows[0]?.studentCount || 0;


    //3 Query to fetch Tests
    const quizCount = `SELECT COUNT(*) AS quizcount FROM tests`;
    const [quizRows] = await db.execute(quizCount);
    console.log(quizRows[0])
    counts.quizzes = quizRows[0]?.quizcount ||0; 

    // Final response
    res.status(200).json({
      success: true,
      data: counts
    });

  } catch (err) {
    console.error('Error fetching counts:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch counts'
    });
  }
};
