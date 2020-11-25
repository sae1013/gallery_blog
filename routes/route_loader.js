const multer = require('multer');
var path = require('path');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads')
    },
    filename: function (req, file, callback) {
        var extension = path.extname(file.originalname);
        var basename = path.basename(file.originalname, extension);
        callback(null, basename + Date.now() + extension);
    }
});

var upload = multer({
    storage: storage,
    limits: {
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
});

var route_loader = {};

var config = require('../config/config');

route_loader.init = function (app, router) {
    for (var i = 0; i < config.route_info.length; i++) {

        var curItem = config.route_info[i];
        var curModule = require(curItem.file);
        if (curItem.type == "get") {
            router.route(curItem.path).get(curModule[curItem.method])
        }
        else if (curItem.type == "upload_post") {
            router.route(curItem.path).post(upload.single('photo'), curModule[curItem.method]);
        }
        else if (curItem.type == "post") {
            router.route(curItem.path).post(curModule[curItem.method])
        }
        else {
            console.log("route_type설정이 잘못되었습니다")
        }

    }
    app.use('/', router);
}
module.exports = route_loader;


