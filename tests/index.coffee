molnmyra = require '../lib'

# Make a file containing your database credentials
cred = require '../cred'

process.stdin.resume()

molnmyra.connect cred.uri, cred.db

fiskSchema = molnmyra.Schema
  hello:
    unique: true

ostronSchema = molnmyra.Schema
  ostron:
    unique: true

fiskModel = molnmyra.model "fisk", fiskSchema

ostronModel = molnmyra.model "ostron", ostronSchema

fisk = new fiskModel()
fisk.hello = "hello"

fisk.find { hello: "hello" }, (err, result) ->
  console.log err, result

fisk.findOne { hello: "hello" }, (err, result) ->
  console.log err, result

fisk.save (err, result) ->
  console.log err, result