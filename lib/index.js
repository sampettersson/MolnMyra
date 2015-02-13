var Schema, connect, model, molnmyra;

module.exports = molnmyra = {};

molnmyra.connect = connect = (function() {
  var Cloudant;

  Cloudant = require('cloudant');

  function connect(url, name) {
    var cloudant, connection;
    connection = {};
    connection.config = {
      url: url,
      db: name
    };
    cloudant = Cloudant({
      url: url
    });
    if (cloudant === null) {
      throw "MolnMyra: Connection error";
    }
    connection.cloudant = cloudant;
    connection.db = connection.cloudant.use(name);
    global.MolnMyra = {};
    MolnMyra.conn = connection;
    return;
  }

  return connect;

})();

molnmyra.Schema = Schema = (function() {
  function Schema(schemaObj) {
    var schema;
    schema = {};
    schema.schema = schemaObj;
    schema.query = {};
    schema.query.fields = Object.keys(schemaObj);
    return schema;
  }

  return Schema;

})();

molnmyra.model = model = (function() {
  var self;

  self = function() {
    var obj;
    obj = {
      modelConstructor: model.modelConstructor,
      cloudantIndex: model.cloudantIndex
    };
    return obj;
  };

  function model(name, schema) {
    var current;
    if (MolnMyra.conn === void 0) {
      throw "MolnMyra: Missing connection";
    }
    current = self();
    current.construct = {
      name: name,
      schema: schema
    };
    current.cloudantIndex();
    return current.modelConstructor(current);
  }

  model.modelConstructor = function(current) {
    return function(doc) {
      var uuid;
      if (doc == null) {
        doc = {};
      }
      Object.defineProperty(doc, "save", {
        enumerable: false,
        value: model.save(current)
      });
      Object.defineProperty(doc, "find", {
        enumerable: false,
        value: model.find(current)
      });
      Object.defineProperty(doc, "findOne", {
        enumerable: false,
        value: model.findOne(current)
      });
      current.construct.schema.query.fields.forEach(function(key) {
        return Object.defineProperty(doc, key, {
          get: function() {
            return doc['__' + key];
          },
          set: function(value) {
            return doc['__' + key] = value;
          }
        });
      });
      if (doc.id === void 0) {
        uuid = require('node-uuid');
        doc.id = uuid.v1();
      }
      return doc;
    };
  };

  model.cloudantIndex = function(callback) {
    var current, currentCallback, doIndex, uniqueIndex;
    current = this;
    currentCallback = callback;
    this.index = {};
    this.index.indexed = false;
    uniqueIndex = {};
    uniqueIndex.obj = {
      name: "uniqueReservation",
      type: "json",
      index: {
        fields: ["type", "reference"]
      }
    };
    doIndex = function() {
      current.index.obj = {
        name: current.construct.name,
        type: "json",
        index: {
          fields: current.construct.schema.query.fields
        }
      };
      return MolnMyra.conn.db.index(current.index.obj, function(err, response) {
        console.log(response);
        if (err) {
          throw err;
        }
        current.index.indexed = true;
        if (currentCallback) {
          return currentCallback(response);
        }
      });
    };
    return MolnMyra.conn.db.index(uniqueIndex.obj, function(err) {
      if (err) {
        throw err;
      }
      return doIndex();
    });
  };

  model.find = function(current) {
    return function(data, callback) {
      var currentCallback, find;
      currentCallback = callback;
      find = function() {
        var args;
        args = {
          selector: data
        };
        return MolnMyra.conn.db.find(args, currentCallback);
      };
      return find();
    };
  };

  model.findOne = function(current) {
    return function(data, callback) {
      var currentCallback, find;
      currentCallback = callback;
      find = function() {
        var args;
        args = {
          selector: data,
          limit: 1
        };
        return MolnMyra.conn.db.find(args, function(err, results) {
          var doc;
          doc = null;
          console.log(results);
          if (results !== null) {
            doc = results.docs[0];
          }
          return currentCallback(err, doc);
        });
      };
      return find();
    };
  };

  model.save = function(current) {
    return function(callback) {
      var context, currentCallback, insert, insertUniqueReserver;
      currentCallback = callback;
      context = this;
      insertUniqueReserver = function(key, ref) {
        var id, insert, name;
        name = current.construct.name.substr(0, 1).toUpperCase() + current.construct.name.substr(1);
        id = current.construct.name + "/" + key;
        insert = {};
        insert.type = name + "Reservation";
        insert.reference = ref;
        return MolnMyra.conn.db.insert(insert, id, function(err, result) {
          return console.log(err, result);
        });
      };
      insert = function() {
        var id, keys;
        insert = {};
        id = context.id.toString();
        delete context.id;
        keys = Object.keys(context);
        keys.forEach(function(key) {
          var properties, realKey;
          realKey = key.substr(2);
          insert[realKey] = context[key];
          properties = current.construct.schema.schema[realKey];
          if (properties.unique === true) {
            return insertUniqueReserver(realKey, id);
          }
        });
        return MolnMyra.conn.db.insert(insert, id, function(err, result) {
          return currentCallback(err, result);
        });
      };
      if (current.index.indexed === false) {
        return current.cloudantIndex(function() {
          return insert();
        });
      } else {
        return insert();
      }
    };
  };

  return model;

})();
