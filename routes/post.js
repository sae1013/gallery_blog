const { render } = require("ejs");

post_module = {

}
//==================글 생성=============
function write(req, res) { //포스팅 등록할때.
    if (!req.user) { //! 로그인 안되어있을 때.
        res.redirect('/login');
    }
    res.render('write', { user: req.user });
}

function write_post(req, res) {
    console.log('/write');
    var file = req.file
    console.log(file);   //TODO 파일을 직접 저장하는 방식으로 바꿔야함( 수정기능때문에 )


    var paramWriter = req.body.writer;
    var paramDescription = req.body.description;
    var paramTitle = req.body.title;
    file.path = '/' + file.path;
    var database = req.app.get('database');
    var post = new database.PostModel({ 'writer': paramWriter, 'description': paramDescription, 'title': paramTitle, 'image': file.path });
    post.save().then(function (savedPost, err) {
        if (err) {
            throw (err);
        }
        console.log(savedPost);
        savedPost = savedPost._doc;
        res.render('postview.ejs',
            { user: req.user, post_id: savedPost._id, writer: savedPost.writer, title: savedPost.title, description: savedPost.description, filepath: savedPost.image, created_at: savedPost.created_at });
    });
}

//==================글 조회 ================ 
function post(req, res) {  // 포스팅 아이템 조회 ( id이용 )
    var database = req.app.get('database');
    database.PostModel.find({ _id: req.params.objectid }, (err, results) => {

        console.log(results);
        var user = req.user; // !user가 있을때만 으로 변경할것. 아니면 비로그인시, user가 null이라 오류뜸
        var writer = results[0]._doc.writer;
        var title = results[0]._doc.title;
        var description = results[0]._doc.description;
        var filepath = results[0]._doc.image;
        var created_at = results[0]._doc.created_at;
        var post_id = results[0]._doc._id;
        res.render('postview', {
            user: user, writer: writer, title: title,
            description: description, created_at: created_at, filepath: filepath, post_id: post_id
        });

    });
}


//==================글 수정 ================
function modify_post(req, res) {
    console.log('modify요청');
    var post_id = req.body.post_id;
    console.log('modify에서 받은 id:' + post_id);
    var postModel = req.app.get('database').PostModel;
    postModel.find({ _id: post_id }, function (err, results) {
        if (err) {
            throw (err);
        }
        console.log(results);
        description = results[0]._doc.description.trim();
        writer = results[0]._doc.writer;
        image = results[0]._doc.image;
        title = results[0]._doc.title;
        console.log(description.trim());
        res.render('modifyForm', {
            user: req.user.email, post_id: post_id,
            description: description, writer: writer, image: image, title: title
        });
    });


}

function modified_post(req, res) { //todo 'path'를 읽을수 없다는 오류 해결하기
    var postModel = req.app.get('database').PostModel;
    var post_id = req.body.post_id;
    var before_photo = req.body.before_photo;
    var cur_photo = req.file
    if (cur_photo == (null || undefined)) {
        cur_photo_path = before_photo // 파일경로 의미
    }
    else {
        cur_photo_path = "/" + req.file.path;
    }

    var new_title = req.body.title;
    var new_description = req.body.description;

    postModel.where({ _id: post_id }).update({
        title: new_title, description: new_description,
        image: cur_photo_path
    }, function (err, result) {
        if (err) {
            throw (err);
        }
        console.log('업데이트결과:');
        console.log(result);
        res.redirect(`/post/${post_id}`);
    });
    // postview로 리다이렉트

}
//==================글 삭제 ================
function delete_post(req, res) {
    var post_id = req.body.post_id;
    var postModel = req.app.get('database').PostModel;
    postModel.deleteOne({ _id: post_id }, function (err, result) {
        if (err) {
            throw (err);
        }
        console.log('deleteOne()결과');
        console.log(result);
        res.redirect('/');
    });
}

//====================ID에 따라 조회하기 ================= //TODO 기능 개발은끝났는데 뷰화면 구성하고, 뿌려주기.
function listByUser(req, res) {
    console.log('listByUser호출');
    var user_email = req.params.user_email;
    var PostModel = req.app.get('database').PostModel;
    PostModel.find({ writer: user_email }, (err, results) => {
        if (err) {
            throw (err);

        }
        console.log(results);
        if (!req.user) {
            res.redirect('/login');
        } // 로그인 안되어있으면 로그인화면으로

        if (req.user.email != user_email) { // 로그인은 되어있으나, 내 계정이아닌 다른사람 계정을 접속했을경우
            res.redirect('/public/404.html');
        }
        res.render("listbyuser.ejs", { user: req.user, results: results });
    });
}


//==================== 라우팅함수 모듈에 등록==================

post_module["write"] = write;
post_module["write_post"] = write_post;
post_module["post"] = post;
post_module["modify_post"] = modify_post;
post_module["modified_post"] = modified_post;
post_module["delete_post"] = delete_post;
post_module["listByUser"] = listByUser;
module.exports = post_module;
