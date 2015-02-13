var cred, fisk, fiskModel, fiskSchema, molnmyra, ostronModel, ostronSchema;

molnmyra = require('../lib');

cred = require('../cred');

process.stdin.resume();

molnmyra.connect(cred.uri, cred.db);

fiskSchema = molnmyra.Schema({
  fisk: {
    unique: true
  }
});

console.log("fiskSchema: " + fiskSchema);

ostronSchema = molnmyra.Schema({
  ostron: {
    unique: true
  }
});

console.log("ostronSchema: " + ostronSchema);

fiskModel = molnmyra.model("fisk", fiskSchema);

console.log("fiskModel: " + fiskModel);

ostronModel = molnmyra.model("ostron", ostronSchema);

console.log("ostronModel: " + ostronModel);

fisk = new fiskModel();

fisk.key = "value";

fisk.save(function(err, result) {
  return console.log(err, result);
});
