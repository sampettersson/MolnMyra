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
      cloudantIndex: model.cloudantIndex,
      save: model.save
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
    return current;
  }

  model.cloudantIndex = function(callback) {
    var current;
    if (callback == null) {
      callback = null;
    }
    current = this;
    this.index = {};
    this.index.indexed = false;
    this.index.obj = {
      name: this.construct.name,
      type: "json",
      index: {
        fields: this.construct.schema.query.fields
      }
    };
    global.MolnMyra.conn.db.index(this.index.obj, function(err, response) {
      if (err) {
        throw err;
      }
      current.index.indexed = true;
      if (callback !== null) {
        return callback(response);
      }
    });
  };

  model.save = function(callback) {
    var current;
    current = this;
    if (this.index.indexed === false) {
      this.cloudantIndex(function() {
        return current.save(callback);
      });
      return;
    }
    return callback();
  };

  return model;

})();
