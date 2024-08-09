const express = require('express') ;
const controller = require('../controllers/query_controller') ; 

const router = express.Router() ; 

router.route('/getone')
      .post(controller.getone)

router.route('/post')
      .post(controller.postQuery)

router.route('/getall')
      .get(controller.getall)

router.route('/solve')
      .post(controller.solve)

module.exports = router ;