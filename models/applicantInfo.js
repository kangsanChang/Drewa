module.exports = (sequelize, DataTypes) => {
  const applicantInfoTb = sequelize.define('applicantInfoTb',
    {
      applicantIdx: {
        type: DataTypes.INTEGER,
        field: 'applicant_idx',
        autoIncrement: true,
        primaryKey: true,
      },
      userIdx: {
        type: DataTypes.INTEGER,
        field: 'user_idx',
        unique: true,
        validate: { isInt: true },
      },
      applicantGender: {
        type: DataTypes.ENUM,
        values: ['M', 'F'],
        field: 'applicant_gender',
        validate: {
          isIn: [['M', 'F']],
        },
      },
      applicantBirthday: {
        type: DataTypes.DATEONLY,
        field: 'applicant_birthday',
      },
      applicantLocation: {
        type: DataTypes.STRING,
        field: 'applicant_location',
      },
      applicantPhone: {
        type: DataTypes.STRING(15),
        field: 'applicant_phone',
      },
      applicantOrganization: {
        type: DataTypes.STRING,
        field: 'applicant_organization',
      },
      applicantMajor: {
        type: DataTypes.STRING,
        field: 'applicant_major',
      },
      applicantPictureFilename: {
        type: DataTypes.TEXT,
        field: 'applicant_picture_filename',
      },
      applicantInterviewTime: {
        type: DataTypes.DATE,
        field: 'applicant_interview_time',
      },
      isSubmit: {
        type: DataTypes.BOOLEAN,
        field: 'is_submit',
        defaultValue: false,
      },
      finalPass: {
        type: DataTypes.BOOLEAN,
        field: 'final_pass',
      },
    },
    {
      timestamps: true,
      tableName: 'APPLICANT_INFO_TB',
      underscored: true,
      comment: '지원자 정보 테이블',
    },
  );
  applicantInfoTb.associate = (models) => {
    models.userInfoTb.hasOne(applicantInfoTb,
      { foreignKey: 'userIdx' });
  };
  return applicantInfoTb;
};
