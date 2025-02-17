'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Subscription.init({
    //userId: DataTypes.STRING,
    endpoint: DataTypes.STRING,
    p256dh: DataTypes.STRING,
    auth: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Subscription',
  });
  return Subscription;
};