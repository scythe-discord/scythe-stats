const OFFICIAL_PLAYER_MATS = [
  'Industrial',
  'Engineering',
  'Patriotic',
  'Mechanical',
  'Agricultural',
  'Militant',
  'Innovative'
];

module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'PlayerMats',
      OFFICIAL_PLAYER_MATS.map(name => ({
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(
      'PlayerMats',
      { name: { [Sequelize.Op.in]: OFFICIAL_PLAYER_MATS } },
      {}
    );
  }
};
