module.exports = (sequelize, DataTypes) => {
    const application_tb = sequelize.define('applicationTb', {
        applicationIdx: {type: DataTypes.INTEGER, field: 'application_idx', autoIncrement: true, primaryKey: true},
        commIdx: {type: DataTypes.INTEGER, field: 'comm_idx'},
        applicationDocument: {type: DataTypes.STRING, field: 'application_document'}
    }, {
        timestamps: true,
        tableName: 'APPLICATION_TB',
        underscored: true,
        comment: '지원자의 지원서 매핑 테이블',
    });
    application_tb.associate = (models) => {
        models.commInfoTb.hasOne(application_tb, {foreignKey: 'commIdx'});
    };
    return application_tb;
};