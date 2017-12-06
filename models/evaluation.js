module.exports = (sequelize, DataTypes) => {
  const evaluationTb = sequelize.define('evaluationTb',
    {
      evalIdx: {
        type: DataTypes.INTEGER,
        field: 'eval_idx',
        autoIncrement: true,
        primaryKey: true,
      },
      interIdx: {
        type: DataTypes.INTEGER,
        field: 'inter_idx',
      },
      applicationIdx: {
        type: DataTypes.INTEGER,
        field: 'application_idx',
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
    models.applicationTb.hasMany(evaluationTb, { foreignKey: 'applicationIdx' });
    models.interviewerTb.hasMany(evaluationTb, { foreignKey: 'interIdx' });
  };
  return evaluationTb;
};
