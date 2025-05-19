import { db } from "../database.js";

export const getTestData = async (req, res) => {
  const { testCode } = req.params;
   

  try {
    //Get Test MetaData
    const [testRows] = await db.execute(
      `SELECT * FROM tests WHERE testcode =?`,
      [testCode]
    ); 

    if (testRows.length == 0) {
      return res.status(404).json({ error: "Test Not Found" });
    } 

    const test = testRows[0];

    //Get Question For Test 
    const [questionsRows] = await db.execute(
      `SELECT * FROM test_questions WHERE test_id = ? `,
      [test.id]
    );

    //  Process questions - check if options needs parsin
    const questions = questionsRows.map((q) => {
      //If options is already an object, use it directly
      if (typeof q.options === "object" && q.options !== null) {
        return {
          ...q,
          options: q.options,
        };
      }

      //otherwise try to parse it
      try {
        return {
          ...q,
          options: JSON.parse(q.options),
        };
      } catch (parseError) {
        console.log("Failed to parse options:", q.options);
        return {
          ...q,
          options: {},
        };
      }
    });

    //Format response
    const response = {
      ...test,
      questions,
    };

    res.json(response);
  } catch (error) {
    console.log("Error fetching test : ", error);
    res.status(500).json({
      error: "Failed to fetch test data",
      details: error.message,
    });
  }
};
