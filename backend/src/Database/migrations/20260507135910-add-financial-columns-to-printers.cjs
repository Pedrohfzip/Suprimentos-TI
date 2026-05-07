'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('printers', 'preco_unitario', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    });
    await queryInterface.addColumn('printers', 'dias_encomenda', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
    await queryInterface.addColumn('printers', 'quantidade_encomenda', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('printers', 'preco_unitario');
    await queryInterface.removeColumn('printers', 'dias_encomenda');
    await queryInterface.removeColumn('printers', 'quantidade_encomenda');
  }
};
