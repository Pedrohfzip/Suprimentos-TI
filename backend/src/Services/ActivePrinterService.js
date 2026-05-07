import db from '../Database/models/index.js';

const ActivePrinterService = {

    async getAll() {
        try {
            const printers = await db.ActivePrinter.findAll({
                order: [['local', 'ASC']]
            });
            return printers;
        } catch (error) {
            console.error("Error in getAll ActivePrinters:", error);
            throw new Error(`Erro ao buscar impressoras ativas: ${error.message}`);
        }
    },

    async create(data) {
        try {
            const printer = await db.ActivePrinter.create(data);
            return printer;
        } catch (error) {
            console.error("Error in create ActivePrinter:", error);
            throw new Error(`Erro ao cadastrar impressora ativa: ${error.message}`);
        }
    },

    async delete(id) {
        try {
            const printer = await db.ActivePrinter.findByPk(id);
            if (!printer) throw new Error('Impressora ativa não encontrada');
            await printer.destroy();
            return { message: 'Impressora excluída com sucesso' };
        } catch (error) {
            console.error("Error in delete ActivePrinter:", error);
            throw new Error(`Erro ao excluir impressora ativa: ${error.message}`);
        }
    }

}

export default ActivePrinterService;
