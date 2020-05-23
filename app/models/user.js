
module.exports = function(sequelize, Sequelize) {

	var User = sequelize.define('user', {
		id: { autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
		email: {type: Sequelize.TEXT, allowNull:true},
		phone:{type: Sequelize.TEXT, allowNull: true},
		username: {type:Sequelize.TEXT, allowNull: false},
        password : {type: Sequelize.STRING, allowNull: false}, 
		status: {type: Sequelize.ENUM('active','inactive'), defaultValue:'active' },
		money: {type: Sequelize.INTEGER, defaultValue: 0},
		captcha: {type: Sequelize.INTEGER, defaultValue: 0}
        
}, {
	charset: 'utf8',
	collate: 'utf8_unicode_ci'
  });

	return User;
}