module.exports = (sequelize, DataTypes) => {
    const evaluation_tb = sequelize.define('evaluationTb', {
        evalIdx: {type: DataTypes.INTEGER, field: 'eval_idx', autoIncrement: true, primaryKey: true},
        applicationIdx: {type: DataTypes.INTEGER, field: 'application_idx'},
        interIdx: {type: DataTypes.INTEGER, field: 'inter_idx'},
        evalDocPoint:{type: DataTypes.INTEGER(2), field: 'eval_doc_point'},
        evalDocComment:{type: DataTypes.STRING, field: 'eval_doc_comment'},
        evalInterviewPoint:{type: DataTypes.INTEGER(2), field: 'eval_interview_point'},
        evalInterviewComment:{type: DataTypes.STRING, field: 'eval_interview_comment'},
        evalIsPass:{type: DataTypes.BOOLEAN, field: 'eval_is_pass'}
    },{
        timestamps: true,
        tableName: 'EVALUATION_TB',
        underscored: true,
        comment: '평가 테이블'
    });
    evaluation_tb.associate = (models) => {
        models.applicationTb.hasMany(evaluation_tb, {foreignKey: 'applicationIdx'});
        models.interviewerTb.hasMany(evaluation_tb, {foreignKey: 'interIdx'});
    };
    return evaluation_tb;
};