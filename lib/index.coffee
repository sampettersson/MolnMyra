module.exports = molnmyra = {}

molnmyra.connect = class connect

    Cloudant = require 'cloudant'

    constructor: (url, name) ->

        connection = {}
        connection.config =
            url: url
            db: name

        cloudant = Cloudant { url: url }

        if cloudant is null
            throw "MolnMyra: Connection error"

        connection.cloudant = cloudant
        connection.db = connection.cloudant.use(name)

        global.MolnMyra = {}
        global.MolnMyra.conn = connection

        return

molnmyra.Schema = class Schema

    constructor: (schemaObj) ->

        schema = {}
        schema.schema = schemaObj
        schema.query = {}

        schema.query.fields = Object.keys schemaObj

        return schema

molnmyra.model = class model

  self = () ->

      obj =
        saveConstructor: model.saveConstructor
        cloudantIndex: model.cloudantIndex

      return obj

  constructor: (name, schema) ->

      if global.MolnMyra.conn is undefined
          throw "MolnMyra: Missing connection"

      current = self()

      current.construct =
          name: name
          schema: schema

      current.cloudantIndex()

      return current.saveConstructor(current)

  @saveConstructor = (current) ->

    return (doc = {}) ->

        Object.defineProperty(doc, "save",
          {enumerable: false, value: model.save(current, model.save)})

        if doc.id is undefined

            uuid = require 'node-uuid'

            doc.id = uuid.v1()

        return doc

  @cloudantIndex = (callback) ->

      current = this

      currentCallback = callback

      this.index = {}
      this.index.indexed = false
      this.index.obj =
          name: this.construct.name
          type: "json"
          index:
              fields: this.construct.schema.query.fields

      global.MolnMyra.conn.db.index this.index.obj, (err, response) ->

          throw err if err
          current.index.indexed = true

          if currentCallback
            currentCallback(response)

  @save = (current) ->

      return (callback) ->

          currentCallback = callback

          context = this

          if current.index.indexed is false

            current.cloudantIndex (response) ->
                saveModel = model.saveConstructor(current)
                save = new saveModel()
                save.save currentCallback

          else

            id = this.id.toString()

            delete this.id

            MolnMyra.conn.db.insert this, id, (err, result) ->
                currentCallback err, result









