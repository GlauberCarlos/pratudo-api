import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Carrega as variáveis do arquivo .env
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Permite que a API receba JSON no corpo das requisições

// Rota de teste
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API PraTudo rodando com sucesso!' });
});

// Conexão com o MongoDB e Inicialização do Servidor
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Conectado ao MongoDB com sucesso!');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error.message);
  });