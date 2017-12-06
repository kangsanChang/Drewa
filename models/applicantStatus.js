module.exports = (sequelize, DataTypes) => {
  const applicantStatusTb = sequelize.define('applicantStatusTb',
    {
      applicantStatusIdx: {
        type: DataTypes.INTEGER,
        field: 'applicant_status_idx',
        autoIncrement: true,
        primaryKey: true,
      },
      applicantIdx: {
        type: DataTypes.INTEGER,
        field: 'applicant_idx',
      },
      isSubmit: {
        type: DataTypes.BOOLEAN,
        field: 'is_submit',
        defaultValue: false,
      },
      isApplicationPass: {
        type: DataTypes.BOOLEAN,
        field: 'is_application_pass',
      },
      isFinalPass: {
        type: DataTypes.BOOLEAN,
        field: 'is_final_pass',
      },
      confirmedInterviewTime: {
        type: DataTypes.DATE,
        field: 'confirmed_interview_time',
      },
    },
    {
      timestamps: true,
      tableName: 'APPLICANT_STATUS_TB',
      underscored: true,
      comment: '지원자의 상태 테이블',
    },
  );
  applicantStatusTb.associate = (models) => {
    models.applicantInfoTb.hasOne(applicantStatusTb,
      { foreignKey: 'applicantIdx' });
  };
  return applicantStatusTb;
};
