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
      await queryInterface.bulkInsert('Events', [{
          title: 'Event 1',
          description: 'DESCR 1',
          date: new Date().toString(),
          image_path: './images/image1.jpg',
          createdAt: new Date().toString(),
          updatedAt: new Date().toString()
      }, {
          title: 'Event 1',
          description: 'DESCR 1',
          date: new Date().toString(),
          image_path: './images/image1.jpg',
          createdAt: new Date().toString(),
          updatedAt: new Date().toString()
      }, {
          title: 'Event 1',
          description: 'DESCR 1',
          date: new Date().toString(),
          image_path: './images/image1.jpg',
          createdAt: new Date().toString(),
          updatedAt: new Date().toString()
      }, {
          title: 'Event 1',
          description: 'DESCR 1',
          date: new Date().toString(),
          image_path: './images/image1.jpg',
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
      await queryInterface.bulkDelete('Events', null, {});
  }
};
