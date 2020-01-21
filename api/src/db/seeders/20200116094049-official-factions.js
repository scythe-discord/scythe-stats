const OFFICIAL_FACTIONS = [
  'Polania',
  'Saxony',
  'Crimean',
  'Nordic',
  'Rusviet',
  'Albion',
  'Togawa'
];

module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'Factions',
      OFFICIAL_FACTIONS.map(name => ({
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(
      'Factions',
      { name: { [Sequelize.Op.in]: OFFICIAL_FACTIONS } },
      {}
    );
  }
};
