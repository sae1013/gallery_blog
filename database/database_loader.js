var mongoose = require('mongoose');
var database_loader = {};
database_loader.init = function (app, config) {
    connect(app, config);
}

function connect(app, config) {
    var databaseUrl = config.db_url;
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl, { useMongoClient: true });
    database_loader.database = mongoose.connection; // 실제 DB객체를 loader에 database로 저장.
    var database = database_loader.database;
    database.on('error', console.error.bind(console, 'mongoose connection error'));
    database.on('open', function () {
        console.log('데이터베이스에 연결되었습니다:' + databaseUrl);
        createSchema(app, config, database);
    });

    database.on('disconnected', function () {
        console.log("연결이 끊어졌습니다. 5초 후 재연결 합니다");
    }); // 테스트 용이므로, 실제 연결은 하지않기. 
}

function createSchema(app, config, database) {
    for (var i = 0; i < config.db_schemas.length; i++) {
        var curItem = config.db_schemas[i];
        var curSchema = require(curItem.file).createSchema(mongoose); // Schema등록하고, 리턴함.
        var curModel = mongoose.model(curItem.collection, curSchema);
        database[curItem.schemaName] = curSchema;
        database[curItem.modelName] = curModel;
    }
    app.set('database', database); // app 객체에 실제 database객체 설정하기
}
module.exports = database_loader;

/*{
file: './user_schema', collection: 'users8', schemaName: 'UserSchema', //file을 받게되면 스키마 모듈객체를 받게됨
modelName: 'UserModel'
} */