const express = require('express') ;
const controller = require('../controllers/user_controller') ; 

const router = express.Router() ; 

// router
//   .route('/top-5-cheap')
//   .get(controller.aliasTopTours, controller.getall);


router.route('/userlist')
      .get()

router.route('/user')
      .post(controller.putone)
router.route('/getuser')
      .post(controller.getuser)
router.route('/follow')
      .post(controller.follow)
router.route('/rank')
      .post(controller.rank)
router.route('/userquerylist')
      .post(controller.getUserQuery)
router.route('/users/all')
      .get(controller.getAllUsersSortedByPoints)
router.route('/checkuser')
      .post(controller.checkEmailIfExists)
module.exports = router ;