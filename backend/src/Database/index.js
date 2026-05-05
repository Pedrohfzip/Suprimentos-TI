import { Sequelize } from "sequelize";

const sequelize = new Sequelize('timanager', 'postgres', '123', {
  host: 'localhost',
  dialect: 'postgres'
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
  }
};

export default connectToDatabase;