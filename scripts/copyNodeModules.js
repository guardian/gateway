const copyNodeModules = require('copy-node-modules');
const srcDir = '.';
const dstDir = './build';

// excluding @guardian packages
const regex = /@guardian\//;

// Filter method that will ignore node_module folders in a node module
const filter = (path) => {
  return !regex.test(path);
};

copyNodeModules(srcDir, dstDir, { devDependencies: false, filter }, (err) => {
  if (err) {
    console.error(err);
    return;
  }
});
