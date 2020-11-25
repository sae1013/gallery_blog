/*
{ file: './user', path: '/process/login', method: 'login', type: 'post' } config.route_info[i] 
*/
user_module = {
}
// 요청패스: /home , get
function home(req, res) {
    var database = req.app.get('database')
    database.PostModel.find({}, function (err, results) {
        res.render('home.ejs', { results: results, user: req.user });
    });
}

// /login, get
function login(req, res) {
    // user 토큰정보(로그인인증정보)
    console.log("/login호출")
    res.render('login', { message: req.flash('loginMessage') });
}

function signup(req, res) {
    res.render('signup', { message: req.flash('signupMessage') });
}

function logout(req, res) {
    console.log('/logout 호출됨');
    req.logout();
    res.redirect('/'); // 로그아웃시, Home으로 다시 이동하기.
}


//==================== 라우팅함수 모듈에 등록==================
user_module["home"] = home;
user_module["login"] = login;
user_module["signup"] = signup;
user_module["logout"] = logout;
module.exports = user_module;