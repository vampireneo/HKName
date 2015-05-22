var request = require("request"),
	cheerio = require("cheerio"),
	iconv = require('iconv-lite'),
	Q = require("q"),
	MongoClient = require('mongodb').MongoClient;

if (process.argv.length < 6) {
  console.log('Usage: node main [login] [password] [start] [end]');
  process.exit(1);
}

var login = process.argv[2],
	password = process.argv[3],
	start = parseInt(process.argv[4], 10),
	end = parseInt(process.argv[5], 10);

function getStudentName(pId) {
	var searchUrl = "http://hk.yoshioris.com/student.asp?gid=";
	var student = {};
	var deferred = Q.defer();

	request.post({url: searchUrl + pId, form: {login:login, passcode:password,loginsteps:1}, encoding: null}, function (error, response, body) {
		if (!error) {
			try {
				var str = iconv.decode(new Buffer(body), "big5");
				var $ = cheerio.load(str);
				if ($("#context .portrait-profile img").length > 0) {
					student._id = pId;
					student.gender = $("#context .portrait-profile img").attr("src").indexOf("f.gif") != -1 ? "F" : "M";
					student.name = $("#content2 tr").eq(2).find("td").contents().eq(2).text();
					student.engName = $("#content2 tr").eq(1).find("td").eq(1).contents().eq(2).text();
					if (student.engName === "--") student.engName = "";
					if (student.name === "--") {
						student = {};
						deferred.resolve(student);
					}
					else {
						MongoClient.connect('', function(err, db) {
							if(err) throw err;
							//console.log('connected')
							db.collection('student').insert(student, {w:1});
							db.close();
							deferred.resolve(student);
						});
					}
				}
				else 
					deferred.resolve(student);
			} catch (err) {
				deferred.resolve(student);
			}
		} else {
			deferred.resolve(student);
		}
	});
	return deferred.promise;
}

var list = [];
for (var i = start; i <= end; i++) {
    list.push(i);
}

Q.all(list.map(getStudentName))
	/*
.spread(function() {
	var data = arguments;
	console.log(data);
})
*/
.done();
