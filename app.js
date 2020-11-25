// 모듈 분리하기.

// Express 기본 모듈 불러오기
var express = require('express')
    , http = require('http')
    , path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , static = require('serve-static')
    , errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');
var expressSession = require('express-session');
var app = express();
var passport = require('passport');
var route_loader = require('./routes/route_loader');
const database_loader = require('./database/database_loader');
var config = require("./config/config");
var flash = require('connect-flash');

// 기본 속성 설정
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')))
app.use(cookieParser());
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));


//===========pasport 사용 설정===============
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//! 안되면 삭제할것
// ===========================라우터 등록==============================
var router = express.Router();

router.route('/login').post(passport.authenticate('local-login',
    {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));
//회원가입 라우터
router.route('/signup').post(passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}));
route_loader.init(app, router);

//라우터 테스트 삭제하기
router.route('/test').get(function (req, res) {
    var postModel = req.app.get('database').postModel;
    postModel.findByEmail({ email: 'jmw93@naver.com' }, function (err, results) {
        console.log(results[0]._doc);
        res.end();
    });
});

//==========================패스포트 인증모듈=================

var LocalStrategy = require('passport-local').Strategy;

//패스포트 로그인 설정
passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true   // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
}, function (req, email, password, done) {

    var database = app.get('database');
    database.UserModel.findOne({ 'email': email }, function (err, user) {
        if (err) { return done(err); }

        // 등록된 사용자가 없는 경우
        if (!user) {
            console.log('계정이 일치하지 않음.');
            return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
        }

        // 비밀번호 비교하여 맞지 않는 경우
        var authenticated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);
        if (!authenticated) {
            console.log('비밀번호 일치하지 않음.');
            return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
        }

        // 정상인 경우
        console.log('계정과 비밀번호가 일치함.');
        console.log(user._doc._id);
        return done(null, user);  // 검증 콜백에서 두 번째 파라미터의 값을 user 객체로 넣어 인증 성공한 것으로 처리
    });

}));


// 패스포트 회원가입 설정
passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true    // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
}, function (req, email, password, done) {
    // 요청 파라미터 중 name 파라미터 확인
    var paramName = req.body.name || req.query.name;

    console.log('passport의 local-signup 호출됨 : ' + email + ', ' + password + ', ' + paramName);

    // findOne 메소드가 blocking되지 않도록 하고 싶은 경우, async 방식으로 변경
    process.nextTick(function () {
        var database = app.get('database');
        database.UserModel.findOne({ 'email': email }, function (err, user) {
            // 에러 발생 시
            if (err) {
                return done(err);
            }

            // 기존에 사용자 정보가 있는 경우
            if (user) {
                console.log('기존에 계정이 있음.');
                return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
            } else {
                // 모델 인스턴스 객체 만들어 저장
                var user = new database.UserModel({ 'email': email, 'password': password, 'name': paramName });
                user.save(function (err) {
                    if (err) {
                        throw err;
                    }

                    console.log("사용자 데이터 추가함.");
                    return done(null, user);  // 검증 콜백에서 두 번째 파라미터의 값을 user 객체로 넣어 인증 성공한 것으로 처리
                });
            }
        });
    });

}));

passport.serializeUser(function (user, done) {
    console.log('serializeUser() 호출됨.');
    done(null, user);  // 이 인증 콜백에서 넘겨주는 user 객체의 정보를 이용해 세션 생성
});
passport.deserializeUser(function (user, done) {
    console.log('deserializeUser() 호출됨.');
    console.log(user);
    done(null, user);
});
//===========================에러 핸들러 등록==============================
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

app.on('close', function () { // app객체 소멸시, db연결도 같이 끊기.
    console.log("Express 객체 소멸");
    if (app.database) {
        app.database.close();
    }
})
process.on('SIGTERM', function () {
    console.log('프로세스가 종료됩니다.');
    app.close();
})


// Express 서버 시작
http.createServer(app).listen(app.get('port'), function () {
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
    database_loader.init(app, config);
});
