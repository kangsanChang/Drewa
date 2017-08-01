module.exports = (sequelize, DataTypes) => {
  const usersTb = sequelize.define('userInfoTb',
    {
      userAuthIdx: {
        type: DataTypes.INTEGER,
        field: 'user_auth_idx',
        autoIncrement: true,
        primaryKey: true,
      },
      userEmail: {
        type: DataTypes.STRING(100),
        field: 'user_email',
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      userName: {
        type: DataTypes.STRING,
        field: 'user_name',
        allowNull: true,
      },
      userPassword: {
        type: DataTypes.STRING,
        field: 'user_password',
        allowNull: false,
      },
      userType: {
        type: DataTypes.STRING,
        field: 'user_type',
        allowNull: false,
      },
      userPosition: {
        type: DataTypes.ENUM,
        values: ['designer', 'developer'],
        field: 'user_position',
        allowNull: false,
      },
    }, {
      timestamps: true,
      tableName: 'USER_INFO_TB',
      underscored: true,
      comment: '전체 회원 테이블',
    },
  );
  return usersTb;
};
