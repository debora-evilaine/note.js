const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
require('dotenv').config();
dotenv.config();

console.log('Mongo URI:', process.env.MONGO_URI); 

const app = express();

app.use(cors());

app.use(express.json());

const userRoutes = require('./src/routes/userRoutes');
const noteRoutes = require('./src/routes/noteRoutes');
const tagRoutes = require('./src/routes/tagRoutes');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tags', tagRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server rodando em: http://localhost:${PORT}`));
