import UserService from "../Services/UserService";

const UserController = {

    async createUser(req, res) {
        try {
            const { name, email, password } = req.body;
            const user = await UserService.createUser({ name, email, password });
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    }

}


export default UserController;