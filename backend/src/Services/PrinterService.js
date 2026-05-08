import db from '../Database/models/index.js';

const PrinterService = {

    async getAllPrinters() {
        try {
            const printers = await db.Printer.findAll();
            return printers;
        } catch (error) {
            console.error("Erro real:", error);
            throw new Error(`Erro ao buscar impressoras: ${error.message}`);
        }
    },

    async createPrinter(printerData) {
        try {
            const printer = await db.Printer.create(printerData);
            return printer;
        } catch (error) {
            throw new Error('Erro ao cadastrar impressora');
        }
    },

    async updateStock(id, quantidade_estoque) {
        try {
            const printer = await db.Printer.findByPk(id);
            if (!printer) throw new Error('Impressora não encontrada');
            await printer.update({ quantidade_estoque });
            return printer;
        } catch (error) {
            throw new Error('Erro ao atualizar quantidade de estoque');
        }
    },

    async updateName(id, nome) {
        try {
            const printer = await db.Printer.findByPk(id);
            if (!printer) throw new Error('Impressora não encontrada');
            await printer.update({ nome });
            return printer;
        } catch (error) {
            throw new Error('Erro ao atualizar nome da impressora');
        }
    },

    async updatePrinter(id, data) {
        try {
            const printer = await db.Printer.findByPk(id);
            if (!printer) throw new Error('Impressora não encontrada');
            await printer.update(data);
            return printer;
        } catch (error) {
            throw new Error('Erro ao atualizar impressora');
        }
    }

}

export default PrinterService;
