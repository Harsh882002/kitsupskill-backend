import { db } from "../database.js";

export const getUserData = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    if (!email || !password) {
      return res.status(401).json({ message: "Email or Password is Missing" });
    }

    const sql = "SELECT * FROM users where email=?";

    const [user] = await db.execute(sql, [email]);

    if (user.length === 0) {
      return res.status(403).json({ message: "User Not Found" });
    }

    const userData = user[0]; 

    let roleData;
    const table = userData.role;
    console.log(table);

    const [rolRows] = await db.execute(
      `SELECT * FROM ${table} WHERE user_id=?`,
      [userData.id]
    );

    roleData = rolRows[0];

    //else data
    return res.status(200).json({
      success: true,
      id: userData.id,
      email: userData.email,
      name: userData.name,
      ...roleData,
    });
  } catch (err) {
    console.log("Error in getUserData:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
