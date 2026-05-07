'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ActivePrinters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      estacao: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ip: {
        type: Sequelize.STRING,
        allowNull: true
      },
      local: {
        type: Sequelize.STRING,
        allowNull: true
      },
      usuario_rede: {
        type: Sequelize.STRING,
        allowNull: true
      },
      modelo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      patrimonio: {
        type: Sequelize.STRING,
        allowNull: true
      },
      n_serie: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fabricante: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ActivePrinters');
  }
};
