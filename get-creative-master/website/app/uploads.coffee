##############
# S3 Uploading
##############
knox = require 'knox'

key = "AKIAIAUFV2MQTXINYEMQ"
secret = "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"
bucket = "get-creative"

s3_client = knox.createClient(
    key : key
    secret : secret
    bucket : bucket
)

module.exports.put_data = (data, destination, mimetype, callback) ->
    buffer = new Buffer data, 'binary'
    s3_client.putBuffer buffer, destination, { 'Content-Type' : mimetype, "x-amz-acl" : "public-read" }, (err, result) ->
        throw err if err
        url = result.client._httpMessage.url
        path = result.client._httpMessage.path
        callback(
            url     : url
            path    : destination
        )

module.exports.put_file = (path, destination, mimetype, callback) ->
    s3_client.putFile path, destination, { 'Content-Type' : mimetype, "x-amz-acl" : "public-read" }, (err, result) ->
        throw err if err
        url = result.client._httpMessage.url
        path = result.client._httpMessage.path
        callback(
            url     : url
            path    : destination
        )

module.exports.remove = (filepath, callback) ->
    s3_client.deleteFile filepath, (err, result) ->
        throw err if err
        callback result? if typeof callback is "function"
