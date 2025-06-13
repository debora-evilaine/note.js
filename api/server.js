const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('dotenv').config();
dotenv.config();

console.log('Mongo URI:', process.env.MONGO_URI);  // <-- Aqui, para conferir a variável

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Importando rotas
const userRoutes = require('./src/routes/userRoutes');
const noteRoutes = require('./src/routes/noteRoutes');

// Conexão do MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);

// Iniciando Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server rodando em: http://localhost:${PORT}`));
