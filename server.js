const express = require('express');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const commentModel = require('./public/models/comments');
const gameModel = require('./public/models/games');
const userModel = require('./public/models/users');

const api = require('./public/routes/api')

const app = express();

async function passwordMaker(pass) {
  pass = await bcrypt.hash(pass,12);
  console.log(pass)
  await new userModel({
    username: 'admin',
    password: pass
  }).save();
}

// passwordMaker('')
app.use(cookieParser('Secret Phrase'))
app.use(express.static('public'));
app.use(express.urlencoded({
  extended: true
}));
app.use(morgan("combined"));
app.use(express.json());

app.use('/api', api);

app.get('/', (req,res) => {
  if (req.signedCookies.id === 'admin') {
    res.sendFile(__dirname + '/public/rpoSim.html');
  }
  else {
    res.sendFile(__dirname + '/public/login.html');
  }
});

app.get('/logout', (req,res) => {
  res.clearCookie('id').sendFile(__dirname + '/public/login.html');
})

app.post('/', async (req, res) => {
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
mongoose.connect(
  process.env.DATA,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => console.log('Database connected @ ' + new Date())).catch(err => console.log('Error Connecting Database ' + err));


app.listen(process.env.PORT || 4000, () => {
  console.log('Server started @ ' + new Date());
});