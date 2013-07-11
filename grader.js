var fs = require('fs');
var util = require('util');
var rest = require('restler');
var program = require('commander');
var csv = require('csv');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var csvfile = "index1.html";


var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var clone = function(fn) {
    return fn.bind({});
};

var returnurl1 = function(urlfile) {
    return util.format(urlfile);
    };

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};


var buildfn = function(csvfile) {
    var response2console = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
         //   console.error("Wrote %s", csvfile);
            fs.writeFileSync(csvfile, result);
        }
    };
    return response2console;
};


if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists),HTMLFILE_DEFAULT)
        .option('-u, --url <url_file>', 'Path to url.html')
        .parse(process.argv);
    if (program.url !== null) {
        var apiurl = returnurl1(program.url);
       var response2console = buildfn(csvfile); 
       rest.get(apiurl).on('complete', response2console);
  //     console.log(apiurl);
       program.file = csvfile;
    }
 //   else {
  //     console.log(program.file);}

    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);


} else {
    exports.checkHtmlFile = checkHtmlFile;
}


