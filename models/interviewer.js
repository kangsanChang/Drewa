module.exports = (sequelize, DataTypes) => {
  const interviewerTb = sequelize.define('interviewerTb',
    {
      interviewerIdx: {
        type: DataTypes.INTEGER,
        field: 'interviewer_idx',
        autoIncrement: true,
        primaryKey: true,
      },
      userIdx: {
        type: DataTypes.INTEGER,
        field: 'user_idx',
        unique: true,
      },
    },
    {
      timestamps: true,
      tableName: 'INTERVIEWER_TB',
      underscored: true,
      comment: '면접관 정보 테이블',
    },
  );
  interviewerTb.associate = (models) => {
    models.userInfoTb.hasOne(interviewerTb, { foreignKey: 'userIdx' });
  };
  return interviewerTb;
};
