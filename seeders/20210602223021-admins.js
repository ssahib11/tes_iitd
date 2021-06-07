'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
      await queryInterface.bulkInsert('Admins', [{
          username: 'admin',
          password: '$2b$10$sYYaOJex8xoA4uglnqJY5uCr2Z3RIc3YX3fiF9i3rnVnkSWPoxpZe',
          createdAt: new Date().toString(),
          updatedAt: new Date().toString()
      }], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
      await queryInterface.bulkDelete('Admins', null, {});
  }
};
