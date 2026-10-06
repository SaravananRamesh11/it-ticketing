const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const userRoute=require("./routes/user")

const app = express();
app.use(cors());
app.use(express.json());

// Cache the connection so serverless invocations (Vercel) reuse it
let connectionPromise = null;
function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI).then(() => {
      console.log('MongoDB connected ');
    }).catch(err => {
      connectionPromise = null;
      throw err;
    });
  }
  return connectionPromise;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

app.use('/api/general', require('./routes/general'));
app.use('/api/user',userRoute );
app.use('/api/admin',require('./routes/admin'))
app.use('/api/it_support',require('./routes/it_support'))
app.use('/api/vista',require("./routes/login"))
app.use('/api/cron', require('./routes/cron'))

module.exports = app;

// Long-running server (local dev / Docker). Not used on Vercel.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => require('./cronJob')) // node-cron only works in a persistent process
    .catch(err => console.log(err));
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
