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
  gitUserName: 'wearefractal',
  main: './index.js'
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
    },
    main: {
      default: defaults.main
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
    data = merge(data, defaults);
    save(data);
  });
}

prompt.get(questions, function(err, data) {
  save(data);
});


function save(data) {
  if (data === null || data === undefined) {
    return;
  }
  data.year = new Date().getFullYear();
  var pkg = './package.json';
  var readme = './README.md';
  var license = './LICENSE';

  fs.rename(pkg + '.bk', pkg, function() {
    fs.writeFileSync(pkg, template(fs.readFileSync(pkg), data));

    fs.rename(readme + '.bk', readme, function() {
      fs.writeFileSync(readme, template(fs.readFileSync(readme), data));
      fs.writeFileSync(license, template(fs.readFileSync(license), data));

      rmraf('node_modules', function (err) {
        if (err) return console.log(err);

        rmraf('.git', function(err) {
          if (err) return console.log(err);
          console.log('Completed successfully\n');
        });
      });
    });
  });

}
