module.exports = (sequelize, DataTypes) => {
  const userInfoTb = sequelize.define('userInfoTb',
    {
      userIdx: {
        type: DataTypes.INTEGER,
        field: 'user_idx',
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
        type: DataTypes.ENUM,
        values: ['applicant', 'interviewer', 'admin'],
        field: 'user_type',
        allowNull: false,
        validate: {
          isIn: [['applicant', 'interviewer', 'admin']],
        },
      },
      userPosition: {
        type: DataTypes.ENUM,
        values: ['designer', 'developer', 'admin'],
        field: 'user_position',
        allowNull: true,
        validate: {
          isIn: [['designer', 'developer', 'admin']],
        },
      },
      userSeason: {
        type: DataTypes.INTEGER,
        field: 'user_season',
        allowNull: false,
      },
    }, {
      timestamps: true,
      tableName: 'USER_INFO_TB',
      underscored: true,
      comment: '전체 회원 테이블',
    },
  );
  return userInfoTb;
};
