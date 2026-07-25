const express = require('express');
const controller = require('../controllers/user_controller');

const router = express.Router();

router.route('/user').post(controller.putone);
router.route('/user/sync').post(controller.syncUser);
router.route('/user/update').post(controller.updateUser);
router.route('/getuser').post(controller.getuser);
router.route('/follow').post(controller.follow);
router.route('/rank').post(controller.rank);
router.route('/user/:id/activity').get(controller.getUserActivity);
router.route('/userquerylist').post(controller.getUserQuery);
router.route('/users/all').get(controller.getAllUsersSortedByPoints);
router.route('/checkuser').post(controller.checkEmailIfExists);

module.exports = router;
