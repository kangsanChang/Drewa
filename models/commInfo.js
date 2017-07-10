module.exports = (sequelize, DataTypes) => {
    const comm_info_tb = sequelize.define('commInfoTb', {
        commIdx: {type: DataTypes.INTEGER, field: 'comm_idx', autoIncrement: true, primaryKey: true},
        userAuthIdx: {type : DataTypes.INTEGER, field: 'user_auth_idx'},
        commLocation: {type: DataTypes.STRING, field: 'comm_location'},
        commUniversity: {type: DataTypes.STRING, field: 'comm_university'},
        commGrade: {type: DataTypes.INTEGER, field: 'comm_grade'},
        commPhone: {type: DataTypes.STRING(15), field: 'comm_phone', unique: true},
        commBirthday: {type: DataTypes.DATEONLY, field: 'comm_birthday', allowNull: false},
        commGender: {type: DataTypes.ENUM, values: ['남', '여'], field: 'comm_gender'},
        commKnownPath: {type: DataTypes.STRING, field: 'comm_known_path'},
        commPictureUrl: {type: DataTypes.TEXT, field: 'comm_picture_url'},
        commPortfolioUrl: {type: DataTypes.TEXT, field: 'comm_portfolio_url'},
        commBlogUrl: {type: DataTypes.TEXT, field: 'comm_blog_url'},
        commPersonalUrl: {type: DataTypes.TEXT, field: 'comm_personal_url'},
        commOtherUrl: {type: DataTypes.TEXT, field: 'comm_other_url'},
        commUserPosition: {type: DataTypes.ENUM, values: ['개발자', '디자이너'], field: 'comm_user_position'}
    }, {
        timestamps: true,
        tableName: 'COMM_INFO_TB',
        underscored: true,
        comment: '지원자 정보 테이블',
        classMethods: {
            associate: models => {
                // models.userInfoTb.belongsTo(comm_info_tb, {foreignKey: 'userAuthIdx'});
            }
        }
    });
    return comm_info_tb;
};