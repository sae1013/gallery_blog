var crypto = require('crypto');
var Schema = {};
Schema.createSchema = function (mongoose) {
    var PostSchema = mongoose.Schema({
        title: { type: String, trim: true, 'default': '' }
        , description: { type: String, trim: true, 'default': '' }
        , writer: { type: String, index: { unique: false }, 'default': '' }
        , image: { type: String, 'default': '' }
        , created_at: { type: Date, index: { unique: false }, 'default': Date.now }
        , updated_at: { type: Date, index: { unique: false }, 'default': Date.now }
    });
    PostSchema.static('findByEmail', function (writer, callback) {
        return this.find({ writer: writer }, callback);
    }); // 사용자 id에 걸려있는 게시물 찾기.

    PostSchema.static('findAll', function (callback) {
        return this.find({}, callback);
    });


    return PostSchema;
}

module.exports = Schema;