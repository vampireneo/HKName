var request = require("request"),
	cheerio = require("cheerio"),
	iconv = require('iconv-lite'),
	Q = require("q"),
	MongoClient = require('mongodb').MongoClient;

var namedbConnection = process.env.NAMEDB || "";
var login = process.env.NAME_STUDENT_LOGIN || "";
var password = process.env.NAME_STUDENT_PASSWORD || "";
var batchSize = 20;

if (login === "") {
	console.log('Please config your student login name.');
	process.exit(1);
}

if (password === "") {
	console.log('Please config your student login password.');
	process.exit(1);
}

function getStudentName(pId) {
	var searchUrl = "http://hk.yoshioris.com/student.asp?gid=";
	var student = {};
	var deferred = Q.defer();

	request.post({url: searchUrl + pId, form: {login:login, passcode:password, loginsteps:1}, encoding: null}, function (error, response, body) {
		if (!error) {
			try {
				var str = iconv.decode(new Buffer(body), "big5");
				var $ = cheerio.load(str);
				if ($("#context .portrait-profile img").length > 0) {
					student._id = pId;
					student.gender = $("#context .portrait-profile img").attr("src").indexOf("f.gif") !== -1 ? "F" : "M";
					student.name = $("#content2 tr").eq(2).find("td").contents().eq(2).text();
					student.engName = $("#content2 tr").eq(1).find("td").eq(1).contents().eq(2).text();
					if (student.engName === "--") {student.engName = "";}
					if (student.name === "--") {
						student = {};
						deferred.resolve(student);
					}
					else {
						var schools = $("#context #maincontent").eq(1).find(".tbody, .tbodyalt").find("tr");
						if (schools.length > 0) {
							student.schools = [];
							for (var i = 0; i < schools.length; i++) {
								var data = $(schools[i]).find("td");
								var school = {};
								school.region = $(data[0]).text();
								school.type = $(data[1]).text();
								school.name = $(data[2]).text();
								var years = $(data[3]).text().split('-');
								school.fromYear = parseInt(years[0].trim(), 10);
								school.toYear = parseInt(years[1].trim(), 10);
								student.schools.push(school);
							}
						}
						MongoClient.connect(namedbConnection, function(err, db) {
							if(err) {throw err;}
							//console.log('connected')
							db.collection('student').insert(student, {w:1});
							db.close();
							deferred.resolve(student);
						});
					}
				}
				else {
					deferred.resolve(student);
				}
			} catch (err) {
				deferred.resolve(student);
			}
		} else {
			deferred.resolve(student);
		}
	});
	return deferred.promise;
}

exports.getData = function (pList) {
	var tmp = pList.splice(0,batchSize);
	console.log(tmp);
	Q.all(tmp.map(getStudentName))
	/*
	.spread(function() {
		var args = [].slice.call(arguments);
		//console.log(args);
	})
	*/
	.done(function() {
		if (pList.length > 0) {getData(pList);}
	});
};
