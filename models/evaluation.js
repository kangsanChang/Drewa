module.exports = (sequelize, DataTypes) => {
  const evaluationTb = sequelize.define('evaluationTb',
    {
      evalIdx: {
        type: DataTypes.INTEGER,
        field: 'eval_idx',
        autoIncrement: true,
        primaryKey: true,
      },
      applicationIdx: {
        type: DataTypes.INTEGER,
        field: 'application_idx',
      },
      interIdx: {
        type: DataTypes.INTEGER,
        field: 'inter_idx',
      },
      evalDocPoint: {
        type: DataTypes.INTEGER(2),
        field: 'eval_doc_point',
      },
      evalDocComment: {
        type: DataTypes.STRING,
        field: 'eval_doc_comment',
      },
      DocPass: {
        type: DataTypes.BOOLEAN,
        field: 'doc_pass',
      },
      evalInterviewPoint: {
        type: DataTypes.INTEGER(2),
        field: 'eval_interview_point',
      },
      evalInterviewComment: {
        type: DataTypes.STRING,
        field: 'eval_interview_comment',
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
    },
  );
  evaluationTb.associate = (models) => {
    models.applicationTb.hasMany(evaluationTb,
      { foreignKey: 'applicationIdx' });
    models.interviewerTb.hasMany(evaluationTb,
      { foreignKey: 'interIdx' });
  };
  return evaluationTb;
};
