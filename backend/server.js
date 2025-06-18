const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const userRoute=require("./routes/user")

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ');
    require('./cronJob'); // ✅ Import cron job HERE (after DB connection)
  })
  .catch(err => console.log(err));


app.use('/api/general', require('./routes/general'));
app.use('/api/user',userRoute );
app.use('/api/admin',require('./routes/admin'))
app.use('/api/it_support',require('./routes/it_support'))
app.use('/api/vista',require("./routes/login"))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));