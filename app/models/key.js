
module.exports = function(sequelize, Sequelize) {

	var Key = sequelize.define('key', {
		id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
        key : {type: Sequelize.STRING, allowNull: false}, 
        captcha: {type: Sequelize.INTEGER, defaultValue: 0},
        description: {type: Sequelize.TEXT, defaultValue: ""},
        status: {type: Sequelize.ENUM('active','inactive'), defaultValue:'active'}        
}, {
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
  });

	return Key;
}