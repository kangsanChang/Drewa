module.exports = (sequelize, DataTypes) => {
    const applicationTb = sequelize.define('applicationTb', {
        applicationIdx: {type: DataTypes.INTEGER, field: 'application_idx', autoIncrement: true, primaryKey: true},
        commIdx: {type: DataTypes.INTEGER, field: 'comm_idx'},
        applicationDocument: {type: DataTypes.STRING, field: 'application_document'},
    }, {
        timestamps: true,
        tableName: 'APPLICATION_TB',
        underscored: true,
        comment: '지원자의 지원서 매핑 테이블',
    });
    applicationTb.associate = (models) => {
        models.commInfoTb.hasOne(applicationTb, {foreignKey: 'commIdx'});
    };
    return applicationTb;
};