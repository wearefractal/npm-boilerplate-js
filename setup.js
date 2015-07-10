var fs = require('fs');
var prompt = require('prompt');
var template = require('lodash.template');
var merge = require('lodash.merge');
var rmraf = require('rimraf');
var exec = require('child_process').exec;

var argv = process.argv;

var defaults = {
  version: '0.0.1',
  yourName: 'Fractal',
  yourEmail: 'contact@wearefractal.com',
  yourDomain: 'http://wearefractal.com',
  gitUserName: 'wearefractal'
};

var questions = {
  properties: {
    projectName: {
      pattern: /^[a-zA-Z\-]+$/,
      message: 'name must not contain spaces',
      required: true
    },
    description: {},
    version: {
      default: defaults.version
    },
    yourName: {
      required: true,
      default: defaults.yourName
    },
    yourEmail: {
      required: true,
      default: defaults.yourEmail
    },
    yourDomain: {
      required: true,
      default: defaults.yourDomain
    },
    gitUserName: {
      required: true,
      default: defaults.gitUserName
    }
  }
};

prompt.start();

if (argv[2] == '--use-defaults') {
  console.log('Using defaults \n');

  var defaultQuestions = {
    properties: {
      projectName: {
        pattern: /^[a-zA-Z\-]+$/,
        message: 'name must not contain spaces',
        required: true
      },
      description: {},
    }
  };

  return prompt.get(defaultQuestions, function(err, data) {
    data.gitUrl = getGitUrl(data);
    data = merge(data, defaults);
    save(data);
  });
}

prompt.get(questions, function(err, data) {
  data.gitUrl = getGitUrl(data);
  save(data);
});


function save(data) {
  if (data === null || data === undefined) {
    return console.log('\n Error: inputs are undefined');
  }
  data.year = new Date().getFullYear();
  var files = [
    './package.json.bk',
    './README.md.bk',
    './LICENSE.bk',
    './test/index.js.bk'
  ];

  files.forEach(function(v, k, a) {
    templateFile(v, data);
  });

  cleanSetup(function(err) {
    if (err) return console.error(err);
    gitInit(data);
  });
}

function getGitUrl(data) {
  return 'https://github.com/' + data.gitUserName + '/' + data.projectName;
}

function templateFile(oldName, data) {
  var newName = oldName.replace('.bk', '');
  fs.writeFileSync(newName, template(fs.readFileSync(oldName), data));
  fs.unlinkSync(oldName);
}

function cleanSetup(cb) {
  rmraf('node_modules', function (err) {
    if (err) return cb(err);

    rmraf('.git', function(err) {
      if (err) return cb(err);
      fs.unlink('./setup.js', function(err) {
        if (err) return cb(err);
        cb();
      });
    });
  });
}

function gitInit(data) {
  var cmd = 'git init';
  cmd += ' && git remote add origin ' + data.gitUrl;
  cmd += ' && git add . -A';
  cmd += ' && git commit -m \'init\'';
  cmd += ' && git push origin master';
  cmd += ' && git branch --set-upstream-to=origin/master master';
  exec(cmd, function(err) {
    if (err) return console.log(err);
    console.log('\n Completed successfully');
  });
}
