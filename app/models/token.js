
module.exports = function(sequelize, Sequelize) {

	var Token = sequelize.define('token', {
		id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
        token : {type: Sequelize.STRING, allowNull: false},         
}, {
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
  });

	return Token;
}