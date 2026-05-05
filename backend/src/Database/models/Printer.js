import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Printer = sequelize.define('Printer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    marca: {
        type: Sequelize.STRING,
        allowNull: false
    },
    codigo_ref: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantidade_estoque: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nivel_estoque: {
        type: DataTypes.STRING,
        allowNull: false
    }
  }, {
    tableName: 'printers',
    timestamps: true
  });

  return Printer;
};