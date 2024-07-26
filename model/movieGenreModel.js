module.exports = (sequelize, DataTypes) => {
  /**
   * MovieGenre 영화 장르에 관한 테이블
   */
  const MovieGenre = sequelize.define('MovieGenre', {
    movieId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Movie',
        key: 'movieId'
      }
    },
    genreId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Genre',
        key: 'genreId'
      }
    }
  }, {
    tableName: 'MovieGenre',
    timestamps: false
  });

  return MovieGenre;
};