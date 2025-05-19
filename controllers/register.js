import { db } from "../database.js";
import bcrypt from 'bcrypt';



export const registerApi = async (req, res) => {
  const {
    name, email, password, phone, role,
    type, city, state,
    department, gender, employeeId,institute_id
  } = req.body;

  console.log(req.body)

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password, and role are required." });
  }

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    // Insert into users table
    const sql = "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)";
    const [userResult] = await db.execute(sql, [name, email, phone, hashPassword, role]);

    const userId = userResult.insertId;

    // Role-based insertion
    switch (role) {
      case 'institutes':
        await db.execute(
          'INSERT INTO institutes (user_id, institute_name, type, city, state) VALUES (?, ?, ?, ?, ?)',
          [userId, name, type, city, state]
        );
        return res.status(201).json({ message: "Institute added successfully." });

      case 'teachers':
        await db.execute(
          'INSERT INTO teachers (user_id, full_name, gender, department, employee_id,institute_id) VALUES (?, ?, ?, ?, ?,?)',
          [userId, name, gender, department, employeeId,institute_id]
        );
        return res.status(201).json({ message: "Teacher registered successfully." });

      case 'superadmin':
        await db.execute(
          'INSERT INTO superadmin (user_id, name, phone) VALUES (?, ?, ?)',
          [userId, name, phone]
        );
        return res.status(201).json({ message: "Superadmin created successfully." });

      default:
        return res.status(400).json({ message: "Invalid role specified." });
    }

  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
