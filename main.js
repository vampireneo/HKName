var reader = require("./reader.js");

if (process.argv.length < 3) {
	console.log('Usage: node main [start] [end]');
	process.exit(1);
}
var start = parseInt(process.argv[2], 10),
	end = process.argv.length === 4 ? parseInt(process.argv[3], 10) : start;

var list = [];
for (var i = start; i <= end; i++) {
    list.push(i);
}

reader.getData(list);
