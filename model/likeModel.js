module.exports = (sequelize, DataTypes) => {
    const Like = sequelize.define('Like', {

        // 좋아요 식별 번호 (확장성, 무결성 위해 작성)
        likeId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        // 사용자 식별 번호
        memberId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Member', // 참조하는 테이블 이름
                key: 'memberId'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },

        // 리뷰 식별 번호
        reviewId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Review', // 참조하는 테이블 이름
                key: 'reviewId'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
    },
    {
        indexes: [
            {
                unique: true, // 중복 방지
                fields: ['memberId', 'reviewId']
            }
        ],
        
        tableName: 'Like',
        freezeTableName: true,
        timestamps: true

    });

    // 관계 설정
    Like.associate = (models) => {
        Like.belongsTo(models.Member, { foreignKey : 'memberId'}); // 다대일 : 각 좋아요는 하나의 회원
        Like.belongsTo(models.Review, { foreignKey : 'reviewId'}); // 다대일 : 각 좋아요는 하나의 리뷰
    }

    return Like;
};