module.exports = (sequelize, DataTypes) => {
    const users_tb = sequelize.define('userInfoTb', {
        userAuthIdx: {type: DataTypes.INTEGER, field: 'user_auth_idx', autoIncrement: true, primaryKey: true},
        userEmail: {type: DataTypes.STRING(100), field: 'user_email', allowNull: false, unique: true, validate: {isEmail: true}},
        userName: {type: DataTypes.STRING, field: 'user_name', allowNull: false},
        userPassword: {type: DataTypes.STRING, field: 'user_password', allowNull: false},
        userType: {type: DataTypes.STRING, field: 'user_type', allowNull: false}
    }, {
        timestamps: true,
        tableName: 'USER_INFO_TB',
        underscored: true,
        comment: '전체 회원 테이블'
    });
    return users_tb;
};