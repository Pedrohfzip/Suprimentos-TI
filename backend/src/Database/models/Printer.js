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
        type: DataTypes.STRING,
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
    preco_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    dias_encomenda: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    quantidade_encomenda: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
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