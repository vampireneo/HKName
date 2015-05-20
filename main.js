var request = require("request"),
	cheerio = require("cheerio"),
	iconv = require('iconv-lite'),
	Q = require("q");

if (process.argv.length < 6) {
  console.log('Usage: node main [login] [password] [start] [end]');
  process.exit(1);
}

var login = process.argv[2],
	password = process.argv[3],
	start = process.argv[4],
	end = process.argv[5];

function getStudentName(pId) {
	var searchUrl = "http://hk.yoshioris.com/student.asp?gid=";
	var name = '';
	var deferred = Q.defer();

	request.post({url: searchUrl + pId, form: {login:login, passcode:password,loginsteps:1}, encoding: null}, function (error, response, body) {
		if (!error) {
			var str = iconv.decode(new Buffer(body), "big5");
			var $ = cheerio.load(str);
			name = $(".title td h1").text().split(' ')[0].trim();
			deferred.resolve(name);
		} else {
			deferred.resolve(name);
		}
	});
	return deferred.promise;
}

var list = [];
for (var i = start; i <= end; i++) {
    list.push(i);
}
		Q.all(list.map(getStudentName))
		.spread(function() {
			console.log(arguments)
		})
		.done();
