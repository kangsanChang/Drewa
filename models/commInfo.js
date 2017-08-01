module.exports = (sequelize, DataTypes) => {
  const commInfoTb = sequelize.define('commInfoTb',
    {
      commIdx: {
        type: DataTypes.INTEGER,
        field: 'comm_idx',
        autoIncrement: true,
        primaryKey: true,
      },
      userAuthIdx: {
        type: DataTypes.INTEGER,
        field: 'user_auth_idx',
      },
      commLocation: {
        type: DataTypes.STRING,
        field: 'comm_location',
      },
      commUniversity: {
        type: DataTypes.STRING,
        field: 'comm_university',
      },
      commGrade: {
        type: DataTypes.INTEGER,
        field: 'comm_grade',
      },
      commPhone: {
        type: DataTypes.STRING(15),
        field: 'comm_phone',
        unique: true,
      },
      commBirthday: {
        type: DataTypes.DATEONLY,
        field: 'comm_birthday',
        allowNull: false,
      },
      commGender: {
        type: DataTypes.ENUM,
        values: ['M', 'F'],
        field: 'comm_gender',
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
      commBlogUrl: {
        type: DataTypes.TEXT,
        field: 'comm_blog_url',
      },
      commPersonalUrl: {
        type: DataTypes.TEXT,
        field: 'comm_personal_url',
      },
      commOtherUrl: {
        type: DataTypes.TEXT,
        field: 'comm_other_url',
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
      { foreignKey: 'userAuthIdx' });
  };
  return commInfoTb;
};
