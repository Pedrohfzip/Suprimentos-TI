import ActivePrinterService from '../Services/ActivePrinterService.js';

const ActivePrinterController = {

    async getAll(req, res) {
        try {
            const printers = await ActivePrinterService.getAll();
            res.status(200).json(printers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async create(req, res) {
        try {
            const data = req.body;
            const printer = await ActivePrinterService.create(data);
            res.status(201).json(printer);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await ActivePrinterService.delete(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}

export default ActivePrinterController;
