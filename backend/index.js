import express from 'express';
import { router } from './src/Routers/index.js';
import connectToDatabase from './src/Database/index.js';


const app = express();


app.use(express.json());
app.use(router);


app.listen(3000, () => {
    try {
        connectToDatabase();
        console.log('Servidor rodando na porta 3000');
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
    }
});