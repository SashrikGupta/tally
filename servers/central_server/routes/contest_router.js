const express = require('express') ;
const {addProblem , 
       addContest , 
       getAllContests , 
       getContestById , 
       getProblemById ,
       createResult ,
       createOrUpdateCode ,
       incrementResultPoints ,
       getSortedParticipants , 
       getAllProblems , 
       getSolvedCodesByUser , 
       getProblemStatistics} = require('../controllers/contest_controller') ; 

const router = express.Router() ; 

router.post('/addProblem' , addProblem) 
router.post('/addContest' , addContest) 
router.get('/getContest' , getAllContests)
router.get('/:contestId', getContestById)
router.get('/problem/:id', getProblemById)
router.post('/createResult' , createResult)
router.post('/check' , createOrUpdateCode)
router.post('/addpoint' , incrementResultPoints)
router.get('/rank/:contestId' , getSortedParticipants)
router.get('/run/getall' , getAllProblems)
router.get('/your/plist/:userId' , getSolvedCodesByUser)
router.get('/your/stats/:userId' , getProblemStatistics )

module.exports = router ;
