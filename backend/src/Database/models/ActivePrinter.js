import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ActivePrinter extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  ActivePrinter.init({
    estacao: DataTypes.STRING,
    ip: DataTypes.STRING,
    local: DataTypes.STRING,
    usuario_rede: DataTypes.STRING,
    modelo: DataTypes.STRING,
    patrimonio: DataTypes.STRING,
    n_serie: DataTypes.STRING,
    fabricante: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ActivePrinter',
  });
  return ActivePrinter;
};
