import { nanoid } from "nanoid";
import { db } from "../database.js"; // Assume db is a mysql2 promise pool

export const uploadQuiz = async (req, res) => {
  const {
    user_id,
    title,
    duration,
    expire_at,
    negative_marking = 0,
    randomize = 0,
    questions: questionsArray,
  } = req.body;

  // Validate required fields
  if (
    !user_id ||
    !title ||
    !duration ||
    !expire_at ||
    !questionsArray ||
    !Array.isArray(questionsArray)
  ) {
    return res.status(400).json({ error: "Missing or invalid test data" });
  }

  // Optional: Validate datetime format
  const datetimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!datetimeRegex.test(expire_at)) {
    return res.status(400).json({ error: "Invalid expiration date format" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Generate unique test code
    const testCode = nanoid(10);

    // Insert into `tests` table
    const [testResult] = await connection.execute(
      `INSERT INTO tests (user_id, title, duration, questions, expire_at, negative_marking, randomize, testcode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        title,
        duration,
        questionsArray.length,
        expire_at, // already formatted string
        negative_marking,
        randomize,
        testCode
      ]
    );

    const testId = testResult.insertId;

    // Insert questions
    const insertPromises = questionsArray.map(
      ({ question_text, options, correct_answer }) =>
        connection.execute(
          `INSERT INTO test_questions (test_id, question_text, options, correct_answer)
           VALUES (?, ?, ?, ?)`,
          [testId, question_text, JSON.stringify(options), correct_answer]
        )
    );
 
    await Promise.all(insertPromises);
    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Test created successfully",
      testId,
      testCode
    });

  } catch (error) {
    await connection.rollback();
    console.error("Error creating test:", error);
    res.status(500).json({
      error: "Failed to create the test",
      details: error.message
    });
  } finally {
    connection.release();
  }
};
