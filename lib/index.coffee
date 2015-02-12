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
        cloudantIndex: model.cloudantIndex
        save: model.save

      return obj

  constructor: (name, schema) ->

      if global.MolnMyra.conn is undefined
          throw "MolnMyra: Missing connection"

      current = self()

      current.construct =
          name: name
          schema: schema

      current.cloudantIndex()
      return current

  @cloudantIndex = (callback = null) ->

      current = this

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

          if callback isnt null
              callback(response)

      return

  @save = (callback) ->

      current = this

      if this.index.indexed is false

        this.cloudantIndex () ->
            current.save callback

        return

      callback()









