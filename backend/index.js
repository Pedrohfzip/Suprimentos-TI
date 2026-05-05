import express from 'express';
import cors from 'cors';
import { router } from './src/Routers/index.js';
import connectToDatabase from './src/Database/index.js';


const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(router);


app.listen(3001, () => {
    try {
        connectToDatabase();
        console.log('Servidor rodando na porta 3001');
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
    }
});