const Problem = require('../models/problem');
const Contest = require('../models/contest'); 
const Result = require('../models/result');
const Code = require('../models/code'); // Import the Code model
const User = require('../models/users_model')
const moment = require('moment');

exports.addProblem = async (req, res) => {
  try {
    const newProblem = await Problem.create({
      name: req.body.name,
      tag: req.body.tag,
      difficulty: req.body.difficulty,
      desc: req.body.desc,
      sample_input: req.body.sample_input,
      sample_output: req.body.sample_output,
      testcase_input: req.body.testcase_input || [], 
      testcase_output: req.body.testcase_output || [],
      points: req.body.points
    });

    res.status(201).json({
      status: 'SUCCESS',
      data: {
        problem: newProblem._id,
        message: 'Problem successfully added'
      }
    });

  } catch (error) {
    console.error('Error in adding problem:', error);
    res.status(500).json({ status: 'FAILED', message: 'Internal Server Error' });
  }
};



exports.addContest = async (req, res) => {
  try {
    const newContest = await Contest.create({
      problems: req.body.problems, // Array of Problem IDs
      author: req.body.author, // Single User ID
      start: req.body.start, // Start time
      end: req.body.end, // End time
      name: req.body.name // Contest name
    });

    res.status(201).json({
      status: 'SUCCESS',
      data: {
        contest: newContest,
        message: 'Contest successfully added'
      }
    });

  } catch (error) {
    console.error('Error in adding contest:', error);
    res.status(500).json({ status: 'FAILED', message: 'Internal Server Error' });
  }
};



exports.getAllContests = async (req, res) => {
  try {
    const currentTime = new Date();
    const contests = await Contest.find().populate('problems participants author');
    const contestsWithMessages = contests.map(contest => {
      let message;
      if (currentTime < contest.start) {
        message = 'secondary';
      } else if (currentTime > contest.end) {
        message = 'danger'; 
      } else {
        message = 'success';
      }
      return {
        ...contest._doc, 
        message 
      };
    });

    res.status(200).json({
      status: 'SUCCESS',
      data: {
        contests: contestsWithMessages,
        message: 'Contests successfully retrieved'
      }
    });

  } catch (error) {
    console.error('Error in fetching contests:', error);
    res.status(500).json({ status: 'FAILED', message: 'Internal Server Error' });
  }
};



exports.getContestById = async (req, res) => {
  try {
    const contestId = req.params.contestId;
    const contest = await Contest.findById(contestId).populate('problems participants author')


    if (!contest) {
      return res.status(404).json({ status: 'FAILED', message: 'Contest not found' });
    }


    const currentTime = new Date();

  
    let message;
    if (currentTime < contest.start) {
      message = 'secondary'; 
    } else if (currentTime > contest.end) {
      message = 'danger';
    } else {
      message = 'success'; 
    }

    res.status(200).json({
      status: 'SUCCESS',
      data: {
        contest: {
          ...contest._doc,
          message 
        },
        message: 'Contest successfully retrieved'
      }
    });

  } catch (error) {
    console.error('Error in fetching contest:', error);
  
    res.status(500).json({ status: 'FAILED', message: 'Internal Server Error' });
  }
};



exports.getProblemById = async (req, res) => {
  try {
    const problemId = req.params.id;
    const problem = await Problem.findById(problemId);
    console.log(problemId + "hello")
    if (!problem) {
      return res.status(404).json({ status: 'FAILED', message: 'Problem not found' });
    }
    console.log(problem)
    res.status(200).json({
      status: 'SUCCESS',
      data: {
        problem,
        message: 'Problem successfully retrieved'
      }
    });

  } catch (error) {
    console.error('Error in fetching problem:', error);
    res.status(500).json({ status: 'FAILED', message: 'Internal Server Error' });
  }
};



exports.createResult = async (req, res) => {
   try {
     const { contest, user } = req.body;
     const existingResult = await Result.findOne({ contest, user });
 
     if (existingResult) {
       res.status(200).json({
         status: 'SUCCESS',
         data: {
           result: existingResult,
           message: 'Result already exists',
         },
       });
     } else {
       const newResult = new Result({
         contest,
         user,
         points: 0,
       });
 
       // Save the new result
       await newResult.save();
 
       // Fetch the contest by ID
       const contestData = await Contest.findById(contest);
 
       if (!contestData) {
         return res.status(404).json({ status: 'FAILED', message: 'Contest not found' });
       }
 
       // Check if the user is already a participant
       if (!contestData.participants.includes(user)) {
         // Add the participant to the contest
         contestData.participants.push(user);
         // Save the updated contest
         await contestData.save();
       }
 
       res.status(201).json({
         status: 'SUCCESS',
         data: {
           result: newResult,
           message: 'Result successfully stored and participant added to contest',
         },
       });
     }
   } catch (error) {
     console.error('Error in creating result:', error);
     res.status(500).json({ status: 'FAILED', message: 'Internal Server Error' });
   }
 };





exports.createOrUpdateCode = async (req, res) => {
   try {
     const { userId, problemId, code, solved } = req.body;
 
     let existingCode = await Code.findOne({ user: userId, problem: problemId });
     if (existingCode) {
       existingCode.code = code;
       
       if (solved && !existingCode.solve) {
         existingCode.solve = solved;
         const problem = await Problem.findById(problemId);
         if (problem) {
           const user = await User.findById(userId);
           if (user) {
            console.log(user.points)
             user.points += problem.points;


        const currentDate = moment();
        const formattedDate = currentDate.format('YYYY-MM-DD');


        const activityIndex = user.activity.findIndex(item => item.date === formattedDate);

        if (activityIndex !== -1) {
            user.activity[activityIndex].value += 10;
        } else {
            user.activity.push({ date: formattedDate, value: 10 });
        }


             await user.save();
             console.log(user.points)
           } else {
             console.error('User not found');
           }
         } else {
           console.error('Problem not found');
         }
       }
 
       await existingCode.save();
 
       res.status(200).json({
         status: 'SUCCESS',
         data: {
           code: existingCode,
           message: 'Code successfully updated',
         },
       });
     } else {
       console.log(code);
       console.log(userId);
       const newCode = new Code({
         user: userId,
         problem: problemId,
         code: code,
         solve: solved
       });
 
       if (solved) {
         const problem = await Problem.findById(problemId);
         if (problem) {
           const user = await User.findById(userId);
           if (user) {
            console.log(user.points)
             user.points += problem.points;
        const currentDate = moment();
        const formattedDate = currentDate.format('YYYY-MM-DD');
        const activityIndex = user.activity.findIndex(item => item.date === formattedDate);

        if (activityIndex !== -1) {
            user.activity[activityIndex].value += 10;
        } else {
            user.activity.push({ date: formattedDate, value: 10 });
        }


             await user.save();
             console.log(user.points)
           } else {
             console.error('User not found');
           }
         } else {
           console.error('Problem not found');
         }
       }
 
       await newCode.save();
       res.status(201).json({
         status: 'SUCCESS',
         data: {
           code: newCode,
           message: 'Code successfully created',
         },
       });
     }
   } catch (error) {
     console.error('Error in creating or updating code:', error);
     res.status(500).json({ status: 'FAILED', message: 'Internal Server Error' });
   }
 };
 


 exports.incrementResultPoints = async (req, res) => {
   try {
     const { contestId, userId, pointsToAdd } = req.body;
     let result = await Result.findOne({ contest: contestId, user: userId });
     if (result) {
       result.points += pointsToAdd;
       await result.save();
       res.status(200).json({
         status: 'SUCCESS',
         data: {
           result,
           message: 'Points successfully incremented',
         },
       });
     } else {
       res.status(404).json({
         status: 'FAILED',
         message: 'Result entry not found',
       });
     }
   } catch (error) {
     console.error('Error in incrementing result points:', error);
     res.status(500).json({ status: 'FAILED', message: 'Internal Server Error' });
   }
 };
 exports.getSortedParticipants = async (req, res) => {
   try {
     const { contestId } = req.params;
 
     // Fetch contest with populated problems and participants
     const contest = await Contest.findById(contestId)
       .populate({
         path: 'problems',
         model: 'problem',  // Assuming your model is named 'Problem'
       })
       .populate({
         path: 'participants',
         model: 'user',  // Assuming your model is named 'User'
       });
 
     if (!contest) {
       return res.status(404).json({ status: 'FAILED', message: 'Contest not found' });
     }
 
     // Get results for the given contest
     const results = await Result.find({ contest: contestId }).populate('user');
 
     const resultMap = {};
     results.forEach(result => {
       resultMap[result.user._id] = result;
     });
 
     const participantData = await Promise.all(contest.participants.map(async participant => {
       const result = resultMap[participant._id] || { points: 0 };
       const userName = participant.username;
 
       // Handle problemStatuses by awaiting each promise within the map function
       const problemStatuses = await Promise.all(contest.problems.map(async problem => {
         const code = await Code.findOne({ user: participant._id, problem: problem._id });
         let isSolved = false;
         if (code) {
           isSolved = code.solve;
         }
         return {
           problemId: problem._id,
           solved: isSolved,
         };
       }));
 
       return {
         name: userName,
         userPoints: participant.points || 0,  // Assuming participant.points exists; otherwise, default to 0
         resultPoints: result.points,
         problemStatuses,
       };
     }));
 
     // Sort participants by resultPoints in descending order
     participantData.sort((a, b) => b.resultPoints - a.resultPoints);
 
     // Assign rank based on sorted order
     participantData.forEach((participant, index) => {
       participant.rank = index + 1;
     });
 
     res.status(200).json({
       status: 'SUCCESS',
       data: participantData,
     });
 
   } catch (error) {
     console.error('Error in getting sorted participants:', error);
     res.status(500).json({ status: 'FAILED', message: 'Internal Server Error' });
   }
 };
 
 