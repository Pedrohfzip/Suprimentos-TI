import LoginService from '../Services/LoginService.js';

const LoginController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const token = await LoginService.login({ email, password });
            res.json({ token });
        } catch (error) {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    }
}

export default LoginController;