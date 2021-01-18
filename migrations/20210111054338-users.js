'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.createTable('users', { 
        id: {
          type:Sequelize.INTEGER,
          autoIncrement:true,
          allowNull:false,
          primaryKey:true
        },
        uuid: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4 
        },
        first_name: {
          type: Sequelize.STRING,
          allowNull:false 
        },
        last_name: {
          type: Sequelize.STRING,
          allowNull:true 
        },
        email: {
          type: Sequelize.STRING,
          allowNull:false,
          unique:true
        },
        username: {
          type: Sequelize.STRING,
          allowNull:false,
          unique:true
        },
        password: {
          type: Sequelize.STRING,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
      }).then(() => queryInterface.addIndex('users', ['id', 'uuid', 'email', 'username']));
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.dropTable('users');
  }
};
