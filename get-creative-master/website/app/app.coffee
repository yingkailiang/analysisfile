# Requirements
fs = require 'fs'
connect = require 'connect'
express = require 'express'
mongo = require 'mongodb'
MongoSessionStore = require 'connect-mongodb'
cron = require 'cron'
config = require './config'
challenges = require './challenges'
users = require './users'

require('./controllers').init(challenges)

db = new mongo.Db config.db_settings.name, new mongo.Server(config.db_settings.host, config.db_settings.port, {auto_reconnect: true, native_parser: true}, {})
session_store = new MongoSessionStore {
    db : db
    username: config.db_settings.user
    password: config.db_settings.pass
}, ->
    # Wait for session store connection to continue

    ##############
    # Build server
    ##############
    non_secure_app = express.createServer()
    ###
    secure_app = express.createServer(
        key     : fs.readFileSync(config.private_key_path).toString()
        cert    : fs.readFileSync(config.certificate_path).toString()
    )
    ###

    _init_app = (app, ports, protocol="http") ->
        app.configure(->
            unless process.env.NODE_ENV is "test"
                app.use express.logger()
            app.use express.bodyParser()
            app.use express.cookieParser()
            app.use express.session {secret : config.session_secret, store : session_store}
            app.use (req, res, next) ->
                req.context =
                    is_admin : false
                next()
            app.use "/admin", connect.basicAuth config.admin_user, config.admin_pass
            app.use "/admin", (req, res, next) ->
                req.context.is_admin = true
                next()
            app.use users.user_middleware()
            app.use app.router
            app.use express.static "#{__dirname}/../static"
        )
        app.set 'view engine', 'jade'
        app.set 'view options', {layout: false}

        require('./routes')(app) # Routes and controllers

        ############
        # Migrations
        ############
        ###
        migrations = require './migrations'
        app.get "/admin/migrations/move_response_objects_to_new_collection", (req, res) ->
            migrations.move_response_objects_to_new_collection (result) ->
                context = 
                    result : result
                res.render "admin/migration", context

        app.get "/admin/migrations/add_fake_responses", (req, res) ->
            migrations.add_fake_responses (result) ->
                context =
                    result : result
                res.render "admin/migration", context

        app.get "/admin/migrations/convert_author_to_author_id", (req, res) ->
            migrations.convert_author_to_author_id (result) ->
                context =
                    result : result
                res.render "admin/migration", context

        app.get "/admin/migrations/add_challenge_types", (req, res) ->
            migrations.add_challenge_types (result) ->
                context =
                    result : result
                res.render "admin/migration", context
        app.get "/admin/migrations/sanitize_ugc_text", (req, res) ->
            migrations.sanitize_ugc_text (result) ->
                context =
                    result : result
                res.render "admin/migration", context
        ###

        ###########
        # Start app
        ###########
        if process.env.NODE_ENV in ["development", "test"]
            port = ports[0]
            ip = "127.0.0.1"
            app.listen port, ip
            console.log "Server is running at #{protocol}://#{ip}:#{port}"
        else if process.env.NODE_ENV is "production"
            port = ports[1]
            app.listen port
            hostname = "get-creative.nodejitsu.com"
            console.log "Server is running in production at #{protocol}://#{hostname}:#{port}"
        return

    if process.env.NODE_ENV in ["development", "production"]
        _init_app non_secure_app, ["7000", "80"], "http"
        #_init_app secure_app, ["7001", "8000"], "https"
    else if process.env.NODE_ENV is "test"
        _init_app non_secure_app, ["7002", "80"], "http"

    #####################################################
    # Set up cron to push challenges from hopper to users
    #####################################################
    new cron.CronJob(
        cronTime    : '00 00 18 * * *' # Every day at 6pm UTC
        onTick      : ->
            challenges.add_challenge_from_hopper()
        start       : true
    )

    new cron.CronJob(
        cronTime    : '00 00 18 * * *'
        onTick      : ->
            users.remove_inactive_accounts (result) ->
                console.log "Removed dead accounts cron job results: #{result}"
        start       : true
    )
