var cred, fisk, fiskModel, fiskSchema, molnmyra, ostronModel, ostronSchema;

molnmyra = require('../lib');

cred = require('../cred');

process.stdin.resume();

molnmyra.connect(cred.uri, cred.db);

fiskSchema = molnmyra.Schema({
  hello: {
    unique: true
  }
});

ostronSchema = molnmyra.Schema({
  ostron: {
    unique: true
  }
});

fiskModel = molnmyra.model("fisk", fiskSchema);

ostronModel = molnmyra.model("ostron", ostronSchema);

fisk = new fiskModel();

fisk.hello = "hello";

fisk.find({
  hello: "hello"
}, function(err, result) {
  return console.log(err, result);
});

fisk.findOne({
  hello: "hello"
}, function(err, result) {
  return console.log(err, result);
});

fisk.save(function(err, result) {
  return console.log(err, result);
});
