cmp - A library for general comparisons

REQUIREMENTS

 - Node.js
 - [hashkeys](http://search.npmjs.org/#/hashkeys)

EXAMPLES

	> var cmp = require("cmp");
	> cmp.cmp(1, 1);
	0
	> cmp.cmp(1, 2);
	-1
	> cmp.cmp(2, 1);
	1
	> cmp.cmp(1, [1,2,3]);
	1
	> cmp.eq([1,2,3], [1,2,3]);
	true
	> cmp.lte([1,2], [1,2,3]);
	true