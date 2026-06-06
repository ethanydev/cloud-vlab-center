require('dotenv').config({path:'../.env'});
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./src/models/User');
  const u = await User.findOne({student_id:'20201234'});
  console.log('user found:', u ? 'yes' : 'no');
  if (!u) { process.exit(0); }
  console.log('is_active:', u.is_active);
  console.log('pw_set:', u.password ? 'yes' : 'no');
  console.log('pw_len:', u.password ? u.password.length : 0);
  const jwt = require('jsonwebtoken');
  console.log('SECRET set:', process.env.ACCESS_TOKEN_SECRET ? 'yes' : 'NO');
  console.log('EXPIRES:', process.env.ACCESS_TOKEN_EXPIRES);
  try {
    const tok = jwt.sign({id:u._id.toString(), role:u.role}, process.env.ACCESS_TOKEN_SECRET, {expiresIn:process.env.ACCESS_TOKEN_EXPIRES});
    console.log('jwt OK');
  } catch(e) {
    console.log('jwt ERROR:', e.message);
  }
  const bcrypt = require('bcryptjs');
  const match = await bcrypt.compare('Test1234!', u.password);
  console.log('pw match:', match);
  process.exit(0);
}).catch(e => { console.error('DB:', e.message); process.exit(1); });
