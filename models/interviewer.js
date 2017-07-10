module.exports = (sequelize, DataTypes) => {
    const interviewers_tb = sequelize.define('interviewerTb', {
        userAuthIdx:{type: DataTypes.INTEGER, field: 'user_auth_idx'},
        interIdx:{type: DataTypes.INTEGER, field:'inter_idx', autoIncrement: true, primaryKey: true},
        interUserPosition:{type: DataTypes.ENUM, values: ['designer', 'devloper'], field: 'inter_user_position'}
    }, {
        timestamps: true,
        tableName: 'INTERVIEWER_TB',
        underscored: true,
        comment: '면접관 정보 테이블'
    });
    interviewers_tb.associate = (models) => {
        models.userInfoTb.hasOne(interviewers_tb, {foreignKey: 'userAuthIdx'});
    }; 
    return interviewers_tb;
}