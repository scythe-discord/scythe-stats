module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('PlayerMatchResults', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      coins: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      PlayerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Players',
          key: 'id'
        }
      },
      FactionId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Factions',
          key: 'id'
        }
      },
      PlayerMatId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'PlayerMats',
          key: 'id'
        }
      },
      MatchId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Matches',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: queryInterface => {
    return queryInterface.dropTable('PlayerMatchResults');
  }
};
