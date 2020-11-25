var config = {
    server_port: 5000,
    db_url: 'mongodb://localhost:27017/local',
    db_schemas: [
        {
            file: './user_schema', collection: 'users8', schemaName: 'UserSchema',
            modelName: 'UserModel'    // schemaName: 사용할 스키마이름, modelName- 사용할 모델 이름
        },
        {
            file: './post_schema', collection: 'post1', schemaName: 'PostSchema',
            modelName: 'PostModel'
        }
    ],
    route_info: [
        { file: './user', path: '/', method: 'home', type: 'get' },
        { file: './user', path: '/login', method: 'login', type: 'get' },
        { file: './user', path: '/signup', method: 'signup', type: 'get' },
        { file: './user', path: '/logout', method: 'logout', type: 'get' },
        { file: './post', path: '/write', method: 'write', type: 'get' },
        { file: './post', path: '/write', method: 'write_post', type: 'upload_post' },
        { file: './post', path: '/post/:objectid', method: "post", type: 'get' },
        { file: './post', path: '/modify', method: "modify_post", type: 'post' },
        { file: './post', path: '/delete', method: "delete_post", type: 'post' },
        { file: './post', path: '/modified', method: "modified_post", type: 'upload_post' },
        { file: './post', path: '/list/:user_email', method: 'listByUser', type: 'get' }
    ]
};
module.exports = config;

//path: 요청패스 , method: 요청처리 함수 type: get or post 요청방식.