module.exports = (sequelize, DataTypes) => {
  const Movie = sequelize.define('Movie', {
    movieId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    movieTitle: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    posterUrl: {
      type: DataTypes.STRING(400),
      allowNull: true
    },
    vodUrl: {
      type: DataTypes.STRING(400),
      allowNull: true
    },
    reviewMovieRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0
    },
    movieSynopsys: {
      type: DataTypes.STRING(3000),
      allowNull: true
    },
    moviereleaseDate: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    directorNm: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    movie_salesAcc: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    movieCast: {
      type: DataTypes.STRING(400),
      allowNull: true
    }
  }, {
    tableName: 'Movie',
    timestamps: true
  });

  Movie.associate = (models) => {
    Movie.hasMany(models.Review, { foreignKey: 'movieId' });
    Movie.belongsToMany(models.Genre, { through: models.MovieGenre, foreignKey: 'movieId' });
  };

  return Movie;
};