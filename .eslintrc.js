module.exports = {
    'extends': 'airbnb-base',
    'rules': {
        // 공백 스페이스 갯수
        'indent': [
            'error',
            4,
        ],
        // 객체 선언시 '{' 뒤, '}' 앞에 스페이스 강요
        'object-curly-spacing': [
            'error',
            'always',
        ],
        // require 다음 공백행 강제를 끔
        'import/newline-after-import': [
            'off'
        ],
    },
};