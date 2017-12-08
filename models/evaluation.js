module.exports = (sequelize, DataTypes) => {
  const evaluationTb = sequelize.define('evaluationTb',
    {
      evaluationIdx: {
        type: DataTypes.INTEGER,
        field: 'evaluation_idx',
        autoIncrement: true,
        primaryKey: true,
      },
      interviewerIdx: {
        type: DataTypes.INTEGER,
        field: 'interviewer_idx',
      },
      applicantIdx: {
        type: DataTypes.INTEGER,
        field: 'applicant_idx',
      },
      applicationPoint: {
        type: DataTypes.INTEGER(2),
        field: 'application_point',
      },
      applicationComment: {
        type: DataTypes.STRING,
        field: 'application_comment',
      },
      applicationPass: {
        type: DataTypes.BOOLEAN,
        field: 'application_pass',
      },
      interviewPoint: {
        type: DataTypes.INTEGER(2),
        field: 'interview_point',
      },
      interviewComment: {
        type: DataTypes.STRING,
        field: 'interview_comment',
      },
      finalPass: {
        type: DataTypes.BOOLEAN,
        field: 'final_pass',
      },
    },
    {
      timestamps: true,
      tableName: 'EVALUATION_TB',
      underscored: true,
      comment: '평가 테이블',
    });
  evaluationTb.associate = (models) => {
    models.interviewerTb.hasMany(evaluationTb, { foreignKey: 'interviewerIdx' });
    models.applicantInfoTb.hasMany(evaluationTb, { foreignKey: 'applicantIdx' });
  };
  return evaluationTb;
};
