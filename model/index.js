const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

let sequelize;
if (env === 'server') {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect
  });
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// 모델 불러오기
const Movie = require("./movieModel")(sequelize, Sequelize);
const Genre = require("./genreModel")(sequelize, Sequelize);
const MovieGenre = require("./movieGenreModel")(sequelize, Sequelize);
const Member = require("./memberModel")(sequelize, Sequelize);
const Review = require("./reviewModel")(sequelize, Sequelize);
const Like = require("./likeModel")(sequelize, Sequelize);
const Report = require("./reportModel")(sequelize, Sequelize);

db.Movie = Movie;
db.Genre = Genre;
db.MovieGenre = MovieGenre;
db.Member = Member;
db.Review = Review;
db.Like = Like;
db.Report = Report;

// 모델 동기화
const syncModels = async () => {
  await Movie.sync();
  await Genre.sync();
  await MovieGenre.sync();
  await Member.sync();
  await Review.sync();
  await Like.sync();
  await Report.sync();
};

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.syncModels = syncModels;

// db 객체에 모델 추가
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
