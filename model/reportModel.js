module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define('Report', {

        // 신고 식별 번호 (확장성, 무결성 위해 작성)
        reportId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        
        // 사용자 식별 번호
        memberId: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },

        // 리뷰 식별 번호
        reviewId: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
    },
    {
        indexes: [
            {
                unique: true, // 중복 방지
                fields: ['memberId', 'reviewId']
            }
        ],
        
        tableName: 'Report',
        freezeTableName: true,
        timestamps: true

    });

    // 관계 설정
    Report.associate = (models) => {
        Report.belongsTo(models.Member, { foreignKey : 'memberId'}); // 다대일 : 각 신고는 하나의 회원
        Report.belongsTo(models.Review, { foreignKey : 'reviewId'}); // 다대일 : 각 신고는 하나의 리뷰
    }

    return Report;
};