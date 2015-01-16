var fs = require('fs');
var prompt = require('prompt');
var template = require('lodash.template');
var merge = require('lodash.merge');
var rmraf = require('rimraf');

var argv = process.argv;

var defaults = {
  version: '0.0.1',
  yourName: 'We Are Fractal',
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

  defaultQuestions = {
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
    data = merge(data, defaults);
    save(data);
  });
}

prompt.get(questions, function(err, data) {
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
    './LICENSE',
    './test/index.js'
  ];

  files.forEach(function(v, k, a) {

    if (v.indexOf('.bk') > -1) {
      var newName = v.replace('.bk', '');
      return fs.rename(v, newName, function(err) {
        if (err) return console.log(err);
        templateFile(newName, data);
      });
    }

    templateFile(v, data);

    if (k === a.length -1) {
      cleanSetup();
    }

  });
}


function templateFile(file, data) {
  fs.writeFileSync(file, template(fs.readFileSync(file), data));
}

function cleanSetup() {
  rmraf('node_modules', function (err) {
    if (err) return console.log(err);

    rmraf('.git', function(err) {
      if (err) return console.log(err);
      fs.unlink('./setup.js', function(err) {
        if (err) return console.log(err);
        console.log('Completed successfully\n');
      });
    });
  });
}
