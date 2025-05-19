import { db } from "../database.js";

//Get ALL Test For User
export const getUsersTests = async(req,res) =>{
    const {userId} = req.params;
    

    try{
        const [tests] = await db.execute(
            `SELECT * FROM tests WHERE user_id = ? ORDER BY created_At DESC`,
            [userId]
        );


        res.json(tests)
    }catch(error){
        res.status(500).json({error : "Failed to fetch user tests"});
    }
}; 