var fs = require('fs');
var path = require('path');
var os = require('os');
var nconf = require('nconf');
var fileExists = require('file-exists');
var dirExistsSync = require('@justinc/dir-exists').dirExistsSync;

const _confFileName = 'conf.json';
const _drillDirPath = path.join(os.homedir(), '.drill');
const _confFilePath = path.join(_drillDirPath, 'conf.json');

const kvs = [
  ['workspace.path', path.join(_drillDirPath, 'drill-workspace')],
  ['db.path', path.join(_drillDirPath, 'db')],
  ['container.paths', [path.join(os.homedir(), 'default-drill-material-container')]]
];
const keys = kvs.map(kv => kv[0]);

const _confObj = kvs.reduce((acc, val) => {
  acc[val[0]] = val[1];
  return acc;
}, {});

const _confStr = JSON.stringify(_confObj, null, 2);

function getByKey(key) {
  var val = nconf.get(key);
  if (val === undefined) {
    nconf.file({ file: _confFilePath });
    return nconf.get(key);
  } else {
    return val;
  }
}

module.exports = {
  confFileName: _confFileName,
  confFilePath: _confFilePath,
  drillDirPath: _drillDirPath,
  confObj: _confObj,
  confStr: _confStr,
  defaultMaterialDirName: 'material',
  confKeys: keys,
  createConfFileIfNotExists: () => {
    // TODO: you could rely on only confFilePath, from which you can
    // derive drillDirPath and confFileName (assuming confFile will always be
    // in drillDirPath - which makes sense);
    // TODO: using mkdirp might be a better idea than fs.mkdirSync
    if (!fileExists(_confFilePath)) {
      if (!dirExistsSync(_drillDirPath)) {
        fs.mkdirSync(_drillDirPath);
      }
      fs.writeFileSync(_confFilePath, _confStr);
    }
  },
  getOrDie: (key) => {
    try {
      return getByKey(key);
    } catch (err) {
      console.log(err.message);
      process.exit(1);
    }
  },
  get: getByKey
};
