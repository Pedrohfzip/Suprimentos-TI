import db from '../Database/models/index.js';

const LoginService = {

    async login({ email, password }) {
        try {
            const user = await db.User.findOne({ where: { email } });
            if (!user || user.password !== password) {
                throw new Error('Credenciais inválidas');
            }
            // Aqui você pode gerar um token JWT ou outro tipo de token de autenticação
            return user;
        } catch (error) {
            throw new Error('Erro ao realizar login');
        }
    }

};


export default LoginService;