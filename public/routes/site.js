const express = require('express');
router = express.Router();

const userModel = require('../models/users');

router.get('/', (req,res) => {
    if (req.signedCookies.id === 'admin') {
      res.sendFile(__dirname + '/../rpoSim.html');
    //   res.sendFile('./../rpoSim.html');
    }
    else {
      res.sendFile(__dirname + '/../login.html');
    }
  });
  
router.post('/', async (req, res) => {
    let user = await userModel.findOne({
      username: 'admin' 
    });
    let good = await bcrypt.compare(req.body.password, user.password);
    if (good) {
      res.cookie('id','admin', {signed: true, maxAge: 21600000}).sendFile(__dirname + '/public/rpoSim.html');
    }
    else {
      res.sendFile(__dirname + '/public/login.html'); 
    }
  })

module.exports = router;