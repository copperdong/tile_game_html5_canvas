
function init() {
	var myclass = new MyClass();
	myclass.bla = "mph";
	myclass.method1();
	myclass.method2();
	
	var myclass2 = new MyClass();
	myclass2.bla = "hmp?";
	myclass2.method1();
}

function MyClass() {
	
	this.bla = "bla";
	
	this.method1 = function() {
		console.log("1:" + this.bla);
//		console.log("2:" + arguments.callee);
	};
	
	var method2 = function() {
		console.log(this.bla);
	};
}