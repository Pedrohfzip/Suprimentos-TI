import db from '../Database/models/index.js';

const UserService = {

    async createUser(userData) {
        // Lógica para criar um usuário
        try{
            const user = await db.User.create(userData);
            return user;
        } catch (error) {
            throw new Error('Erro ao criar usuário');
        }
    }

}


export default UserService;