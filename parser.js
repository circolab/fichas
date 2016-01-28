var yaml = require('js-yaml');
var fs   = require('fs');
var mustache = require('mustache');
var child_process = require('child_process');


//http://www.geedew.com/remove-a-directory-that-is-not-empty-in-nodejs/
var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


//delete rendered folders and recreate them empty
deleteFolderRecursive('./outputHTMLRendered');
deleteFolderRecursive('./outputPDFRendered');
fs.mkdirSync('./outputHTMLRendered');
fs.mkdirSync('./outputPDFRendered');


var files = fs.readdirSync('./workshops/');

var output = "";
for (i in files) {
  var fileName = files[i];

  // Get document, or throw exception on error
  try {
    var doc = yaml.safeLoad(fs.readFileSync('workshops/'+fileName, 'utf8'));
    //console.log(doc);
  } catch (e) {
    //console.log(e);
  }

  var template = fs.readFileSync('./templates/ficha.template', 'utf8');
  output += mustache.render(template, doc) + '\n';
  //console.log(output);
}

var objs = { fichas: output }

//aqui peta
var mainTemplate = fs.readFileSync('./templates/main.template', 'utf8');
var finalOutput = mustache.render(mainTemplate, objs);

//console.log(finalOutput);

var fileNameHTML = "output.html";
var fileNamePDF = "output.pdf";

//save HTML rendered file
fs.writeFileSync('outputHTMLRendered/'+fileNameHTML, finalOutput);
var cmd = 'wkhtmltopdf outputHTMLRendered/'+fileNameHTML+' outputPDFRendered/'+fileNamePDF;

//console.log(cmd);

child_process.exec(cmd, function(e, stdout, stderr) {
  //console.log(e, stdout, stderr);
});
