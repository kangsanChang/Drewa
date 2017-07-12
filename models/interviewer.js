module.exports = (sequelize, DataTypes) => {
    const interviewersTb = sequelize.define('interviewerTb', {
        interIdx: {type: DataTypes.INTEGER, field: 'inter_idx', autoIncrement: true, primaryKey: true},
        userAuthIdx: {type: DataTypes.INTEGER, field: 'user_auth_idx'},
        interUserPosition: {type: DataTypes.ENUM, values: ['designer', 'developer'], field: 'inter_user_position'},
    }, {
        timestamps: true,
        tableName: 'INTERVIEWER_TB',
        underscored: true,
        comment: '면접관 정보 테이블',
    });
    interviewersTb.associate = (models) => {
        models.userInfoTb.hasOne(interviewersTb, {foreignKey: 'userAuthIdx'});
    };
    return interviewersTb;
}