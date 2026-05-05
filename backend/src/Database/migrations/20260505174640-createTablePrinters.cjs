'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('printers', {
      id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
      },
      nome: {
          type: Sequelize.STRING,
          allowNull: false
      },
      marca: {
          type: Sequelize.STRING,
          allowNull: false
      },
      codigo_ref: {
          type: Sequelize.STRING,
          allowNull: false
      },
      quantidade_estoque: {
          type: Sequelize.INTEGER,
          allowNull: false
      },
      nivel_estoque: {
          type: Sequelize.STRING,
          allowNull: false
      },
      createdAt: {
          allowNull: false,
          type: Sequelize.DATE
      },
      updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('printers');
  }
};
