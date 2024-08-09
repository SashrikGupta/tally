const Query = require('../models/query_model');
const User = require('../models/users_model');
const moment = require('moment');

const NULLID = "65f9b0df8cf576d27969a832";

exports.postQuery = async (req, res) => {
    try {
        const userId = req.body.author;
        req.body.solver = NULLID;
        const query = await Query.create(req.body);
        const user = await User.findById(userId);

        // Check if points in req.body are greater than user's points
        if (req.body.points > user.points) {
            return res.status(500).json({
                status: 'FAILED',
                message: 'Not eligible to raise query. Insufficient points.'
            });
        }

        // Update points
        user.points -= req.body.points;
        
        // Update queries
        user.queries.push(query);

        // Update activity
        const currentDate = moment();
        const formattedDate = currentDate.format('YYYY-MM-DD');

        // Check if Today exists in activity array
        const activityIndex = user.activity.findIndex(item => item.date === formattedDate);

        if (activityIndex !== -1) {
            // Increment value by 10 if date already exists
            user.activity[activityIndex].value += 10;
        } else {
            // Add date with value 10 if date doesn't exist
            user.activity.push({ date: formattedDate, value: 10 });
        }

        await user.save();

        res.status(201).json({
            status: 'SUCCESS',
            data: {
                user: req.body
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'FAILED',
            message: error.message
        });
        console.log(error) ; 
    }
};


exports.getall = async(req , res)=>{
   try {
      const queries = await Query.find().sort({ points: -1 });
      res.status(200).json({
          status: 'SUCCESS',
          data: {
              users: queries,
              message: 'Successfully fetched queries sorted by points'
          }
      });
  } catch (error) {
      console.error('Error in getting queries sorted by points:', error);
      res.status(500).json({ status: 'FAILED', message: 'Internal Server Error' });
  }
}

exports.solve = async(req,res) =>{
    try{

    // taking queries from the requested body 
    const solution = req.body.sol ; 
    const io = req.body.io ; 

    // taking the queries from data base 
    const query = await Query.findById(req.body.qid)
    const solve = await User.findById(req.body.uid)
    const auth = await User.findById(query.author)

    // step 1 : modifying the query 
        // adding the sollution to the query 
        query.solution = solution 
        // correct io to the sollution 
        query.io = io 
        // correcting the status 
        query.status = "solved"
        // assigning the actual solver to solve 
        query.solver = solve ; 

        await query.save() ;
    // step 2 : modifying author 

        // adding points for getting query solved
        auth.points += query.points/2
        // increasing activity of the author 

                // Update activity
                let currentDate = moment();
                let formattedDate = currentDate.format('YYYY-MM-DD');
        
                // Check if Today exists in activity array
                let activityIndex = auth.activity.findIndex(item => item.date === formattedDate);
        
                if (activityIndex !== -1) {
                    // Increment value by 10 if date already exists
                    auth.activity[activityIndex].value += 10;
                } else {
                    // Add date with value 10 if date doesn't exist
                    auth.activity.push({ date: formattedDate, value: 10 });
                }

        await auth.save() ; 
    // step 3 : modifying the solver 
         // adding points to solver 
         solve.points += 2*query.points
         // insert queries to 
         solve.queries.push(query) ; 
         // adding the activity in the activity list 

                // Update activity
                currentDate = moment();
                formattedDate = currentDate.format('YYYY-MM-DD');
        
                // Check if Today exists in activity array
                activityIndex = solve.activity.findIndex(item => item.date === formattedDate);
        
                if (activityIndex !== -1) {
                    // Increment value by 10 if date already exists
                    solve.activity[activityIndex].value += 10;
                } else {
                    // Add date with value 10 if date doesn't exist
                    solve.activity.push({ date: formattedDate, value: 10 });
                }  
            await solve.save() ;     
            
            
    // sending the response 
    res.status(201).json({
        status: 'SUCCESS',
        data: {
            message : "query solved !"
        }
    });

    }catch(error){
        console.error('Error in solving query :', error);
      res.status(500).json({ status: 'FAILED', message: 'Internal Server Error' });      
    }
}

exports.getone = async(req , res)=>{
    try {
       const query = await Query.findById(req.body.id);
       res.status(200).json({
           status: 'SUCCESS',
           data: {
               users: query,
               message: 'Successfully fetched queries sorted by points'
           }
       });
   } catch (error) {
       console.error('Error in getting queries sorted by points:', error);
       res.status(500).json({ status: 'FAILED', message: 'Internal Server Error' });
   }
 }