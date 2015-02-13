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
        MolnMyra.conn = connection

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
        modelConstructor: model.modelConstructor
        cloudantIndex: model.cloudantIndex

      return obj

  constructor: (name, schema) ->

      if MolnMyra.conn is undefined
          throw "MolnMyra: Missing connection"

      current = self()

      current.construct =
          name: name
          schema: schema

      current.cloudantIndex()

      return current.modelConstructor(current)

  @modelConstructor = (current) ->

    return (doc = {}) ->

        Object.defineProperty doc, "save",
          enumerable: false
          value: model.save current

        Object.defineProperty doc, "find",
          enumerable: false
          value: model.find current

        Object.defineProperty doc, "findOne",
          enumerable: false
          value: model.findOne current

        current.construct.schema.query.fields.forEach (key) ->
            Object.defineProperty doc, key,
                get: () -> doc['__' + key]
                set: (value) -> doc['__' + key] = value

        if doc.id is undefined

            uuid = require 'node-uuid'

            doc.id = uuid.v1()

        return doc

  @cloudantIndex = (callback) ->

      current = this

      currentCallback = callback

      this.index = {}
      this.index.indexed = false

      doIndex = () ->

          current.index.obj =
              name: current.construct.name
              type: "json"
              index:
                  fields: current.construct.schema.query.fields

          MolnMyra.conn.db.index current.index.obj, (err, response) ->

              console.log response

              throw err if err
              current.index.indexed = true

              if currentCallback
                currentCallback(response)

      doIndex()

  @find = (current) ->

      return (data, callback) ->

          currentCallback = callback

          find = () ->

              args =
                selector: data

              MolnMyra.conn.db.find args, currentCallback

          find()

  @findOne = (current) ->

      return (data, callback) ->

          currentCallback = callback

          find = () ->

              args =
                selector: data
                limit: 1

              MolnMyra.conn.db.find args, (err, results) ->

                  doc = null

                  console.log results

                  if results isnt null
                      doc = results.docs[0]

                  currentCallback(err, doc)

          find()

  @save = (current) ->

      return (callback) ->

          currentCallback = callback

          context = this

          insertUniqueReserver = (key, ref, uniqueReserverCallback) ->

              name = current.construct.name.substr(0, 1).toUpperCase() + current.construct.name.substr(1)
              id = current.construct.name + "/" + key

              insert = {}
              insert.type = name + "Reservation"
              insert.reference = ref

              MolnMyra.conn.db.insert insert, id, uniqueReserverCallback

              return id

          insert = () ->

              insert = {}
              insert.MolnMyra = {}
              insert.MolnMyra.unique = {}

              id = context.id.toString()

              delete context.id

              keys = Object.keys context

              uniqueReserverDone = (index) ->

                  return (err, result) ->

                    if err
                      currentCallback err, null

                    if index is keys.length - 1
                      MolnMyra.conn.db.insert insert, id, currentCallback

              keys.forEach (key, index) ->

                  realKey = key.substr(2)
                  insert[realKey] = context[key]

                  properties = current.construct.schema.schema[realKey]

                  if properties.unique is true
                    uniqueId = insertUniqueReserver realKey, id, uniqueReserverDone(index)
                    insert.MolnMyra.unique[realKey] = uniqueId

          if current.index.indexed is false

            console.log "indexed"

            current.cloudantIndex () ->

                insert()

          else

            insert()