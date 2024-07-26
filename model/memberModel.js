module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define(
    "Member",
    {
      // 회원 식별 번호
      memberId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // 회원 이름
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },

      // 회원 닉네임
      nick: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },

      // 회원 성별
      gender: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },

      // 회원 나이
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // 회원 e-mail
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      //회원 비밀번호
      password: {
        type: DataTypes.STRING(70),
        allowNull: false,
      },

      // 회원 활성화
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      //관리자 활성화
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "Member",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // 관계 설정
  Member.associate = (models) => {
    Member.hasMany(models.Review, { foreignKey: "memberId" });
    Member.hasMany(models.Like, { foreignKey: 'memberId' });
    Member.hasMany(models.Report, { foreignKey: 'memberId' });
  };

  return Member;
};
