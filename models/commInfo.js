module.exports = (sequelize, DataTypes) => {
  const commInfoTb = sequelize.define('commInfoTb',
    {
      commIdx: {
        type: DataTypes.INTEGER,
        field: 'comm_idx',
        autoIncrement: true,
        primaryKey: true,
      },
      userIdx: {
        type: DataTypes.INTEGER,
        field: 'user_idx',
        unique: true,
        validate: { isInt: true },
      },
      commLocation: {
        type: DataTypes.STRING,
        field: 'comm_location',
      },
      commOrganization: {
        type: DataTypes.STRING,
        field: 'comm_organization',
      },
      commMajor: {
        type: DataTypes.STRING,
        field: 'comm_major',
      },
      commGrade: {
        type: DataTypes.INTEGER,
        field: 'comm_grade',
      },
      commPhone: {
        type: DataTypes.STRING(15),
        field: 'comm_phone',
      },
      commBirthday: {
        type: DataTypes.DATEONLY,
        field: 'comm_birthday',
      },
      commGender: {
        type: DataTypes.ENUM,
        values: ['M', 'F'],
        field: 'comm_gender',
        validate: {
          isIn: [['M', 'F']],
        },
      },
      commKnownPath: {
        type: DataTypes.STRING,
        field: 'comm_known_path',
      },
      commPictureUrl: {
        type: DataTypes.TEXT,
        field: 'comm_picture_url',
      },
      commPortfolioUrl: {
        type: DataTypes.TEXT,
        field: 'comm_portfolio_url',
      },
      commPersonalUrl: {
        type: DataTypes.TEXT,
        field: 'comm_personal_url',
      },
      commIsPass: {
        type: DataTypes.BOOLEAN,
        field: 'comm_is_pass',
      },
    },
    {
      timestamps: true,
      tableName: 'COMM_INFO_TB',
      underscored: true,
      comment: '지원자 정보 테이블',
    },
  );
  commInfoTb.associate = (models) => {
    models.userInfoTb.hasOne(commInfoTb,
      { foreignKey: 'userIdx' });
  };
  return commInfoTb;
};
