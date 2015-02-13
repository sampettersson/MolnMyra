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
    global.MolnMyra.conn = connection;
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
      saveConstructor: model.saveConstructor,
      cloudantIndex: model.cloudantIndex
    };
    return obj;
  };

  function model(name, schema) {
    var current;
    if (global.MolnMyra.conn === void 0) {
      throw "MolnMyra: Missing connection";
    }
    current = self();
    current.construct = {
      name: name,
      schema: schema
    };
    current.cloudantIndex();
    return current.saveConstructor(current);
  }

  model.saveConstructor = function(current) {
    return function(doc) {
      var uuid;
      if (doc == null) {
        doc = {};
      }
      Object.defineProperty(doc, "save", {
        enumerable: false,
        value: model.save(current, model.save)
      });
      if (doc.id === void 0) {
        uuid = require('node-uuid');
        doc.id = uuid.v1();
      }
      return doc;
    };
  };

  model.cloudantIndex = function(callback) {
    var current, currentCallback;
    current = this;
    currentCallback = callback;
    this.index = {};
    this.index.indexed = false;
    this.index.obj = {
      name: this.construct.name,
      type: "json",
      index: {
        fields: this.construct.schema.query.fields
      }
    };
    return global.MolnMyra.conn.db.index(this.index.obj, function(err, response) {
      if (err) {
        throw err;
      }
      current.index.indexed = true;
      if (currentCallback) {
        return currentCallback(response);
      }
    });
  };

  model.save = function(current) {
    return function(callback) {
      var context, currentCallback, id;
      currentCallback = callback;
      context = this;
      if (current.index.indexed === false) {
        return current.cloudantIndex(function(response) {
          var save, saveModel;
          saveModel = model.saveConstructor(current);
          save = new saveModel();
          return save.save(currentCallback);
        });
      } else {
        id = this.id.toString();
        delete this.id;
        return MolnMyra.conn.db.insert(this, id, function(err, result) {
          return currentCallback(err, result);
        });
      }
    };
  };

  return model;

})();
