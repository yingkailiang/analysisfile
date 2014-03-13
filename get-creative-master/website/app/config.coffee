env = process.env.NODE_ENV or "development"

module.exports.session_secret = "secret goes here"
module.exports.admin_user = "admin user"
module.exports.admin_pass = "admin pass"
module.exports.private_key_path = 'cert/key.pem'
module.exports.certificate_path = 'cert/cert.pem'
module.exports.pagination_size = 50
module.exports.challenges_in_sidebar = 7
tweet_message = "I'm really enjoying Get Creative! Check it out at http://get-creative.us @getcreativeapp"
module.exports.tweet_message = encodeURI tweet_message + "&"

if env is "development"
    module.exports.db_settings =
        host: "127.0.0.1"
        port: 27017
        name: "get-creative"
        user: null
        pass: null
else if env is "test"
    module.exports.db_settings =
        host: "127.0.0.1"
        port: 27017
        name: "get-creative-test"
        user: null
        pass: null
else if env is "production"
    module.exports.db_settings =
        host: "ds043947.mongolab.com"
        port: 43947
        name: "nodejitsu_canvas_nodejitsudb7262015272"
        user: "nodejitsu_canvas"
        pass: "igds2ljkk9vnf3ocrj9sdkfjs7"
