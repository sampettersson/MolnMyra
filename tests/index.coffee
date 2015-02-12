molnmyra = require '../lib'

# Make a file containing your database credentials
cred = require '../cred'

molnmyra.connect cred.uri, cred.db

fiskSchema = molnmyra.Schema
  fisk:
    unique: true

console.log "fiskSchema: " + fiskSchema

ostronSchema = molnmyra.Schema
  ostron:
    unique: true

console.log "ostronSchema: " + ostronSchema

fiskModel = molnmyra.model "fisk", fiskSchema

console.log "fiskModel: " + fiskModel

ostronModel = molnmyra.model "ostron", ostronSchema

console.log "ostronModel: " + ostronModel

fiskModel.save () ->
  console.log "received callback"