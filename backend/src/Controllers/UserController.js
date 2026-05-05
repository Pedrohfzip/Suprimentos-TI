const UserController = {

    async createUser(req, res) {
        try {
            const { name, email } = req.body;
            
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    }

}


export default UserController;