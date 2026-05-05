import PrinterService from '../Services/PrinterService.js';

const PrinterController = {

    async getAllPrinters(req, res) {
        try {
            const printers = await PrinterService.getAllPrinters();
            res.status(200).json(printers);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar impressoras' });
        }
    },

    async createPrinter(req, res) {
        try {
            const { nome, marca, codigo_ref, quantidade_estoque, nivel_estoque } = req.body;
            const printer = await PrinterService.createPrinter({
                nome,
                marca,
                codigo_ref,
                quantidade_estoque,
                nivel_estoque,
            });
            res.status(201).json(printer);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao cadastrar impressora' });
        }
    },

    async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { quantidade_estoque } = req.body;
            const printer = await PrinterService.updateStock(id, quantidade_estoque);
            res.status(200).json(printer);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar quantidade de estoque' });
        }
    },

    async updateName(req, res) {
        try {
            const { id } = req.params;
            const { nome } = req.body;
            const printer = await PrinterService.updateName(id, nome);
            res.status(200).json(printer);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar nome da impressora' });
        }
    }

}

export default PrinterController;
