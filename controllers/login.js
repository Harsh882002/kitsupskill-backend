import { db } from "../database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log(req.body);

  //checking email and password
  if (!email || !password) {
    return res.status(400).json({ error: "Email or Password is missing...." });
  }

  try {
    //sql query to fetch user
    const sql = "SELECT * FROM users WHERE email=?";

    const [users] = await db.execute(sql, [email]);

    if (users.length == 0) {
      return res.status(404).json({ message: "User Not Found" });
    }

    //transferring users data to user
    const user = users[0];
     console.log(user);

    // checking password is matching or not
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    //token generation
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "6h" }
    );

    //fetch Data based on role
    let roleData;
    const table = user.role;
    console.log(table);

    const [roleRows] = await db.execute(
      `SELECT * FROM ${table} WHERE user_id =?`,
      [user.id]
    );

    //transfering data to roleRows to roleData
    roleData = roleRows[0];
    //send data in json format
    console.log("roleData",roleRows[0])
    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        profile: roleData, // use the assigned variable here
      },
    });
  } catch (err) {
    console.log("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
