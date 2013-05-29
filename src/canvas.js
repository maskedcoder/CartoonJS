(function (global) {
	var canvases = 0;
	var init = function (a,b,c) {
		return new canvas(a,b,c);
	};
	var background_init = function (a, b, c) {
		return new background(a,b,c);
	};
	var canvas = function (el, width, height) {
		var elType = typeof(el),
			w = 500,
			h = 300,
			canvas = null;
		switch (elType) {
			case "number":
				w = el || w;
				h = width || h;
				canvas = document.createElement("canvas");
				document.body.appendChild(canvas);
				break;
			case "string":
				el = document.getElementById(el);
			default:
				if (el.tagName == "CANVAS") {
					canvas = el;
				} else {
					canvas = document.createElement("canvas");
					el.appendChild(canvas);
				}
				canvas.style.position = "absolute";
				canvas.style.left = el.offsetLeft;
				canvas.style.top = el.offsetTop;
				w = width || el.clientWidth || w;
				h = height || el.clientHeight || h;
				break;
		}
		
		canvas.id = "canvas"+canvases;
		canvases++;
		canvas.onclick = function (e) {
			console.log(e.layerX, e.layerY);
		};
		this.ctext = canvas.getContext("2d");
		canvas.width = w;
		canvas.height = h;
		this.width = w;
		this.height = h;
		this.canvas = canvas;
		
		this.items = {};
		this.refreshOpts = 0;
		this.background = "#fff";
		
		canvas = null;
		el = null;
	};
	canvas.prototype.draw = function () {
		ctext = this.ctext;
		ctext.clearRect(0,0,this.width,this.height);
		for (var name in this.items) {
			if (this.items[name].visible) {
				ctext.save();
				this.items[name].draw(ctext);
				ctext.restore();
			}
		}
	};
	canvas.prototype.addItem = function (item) {
		this.items[item.name] = item;
	};
	canvas.prototype.removeItem = function (name) {
		var obj = this.items[name];
		this.items[name] = undefined;
		delete obj;
	};
	canvas.prototype.getItem = function (name) {
		return this.items[name];
	};
	
	var background = function (el, width, height) {
		var elType = typeof(el),
			w = 500,
			h = 300,
			canvas = null;
		switch (elType) {
			case "number":
				w = el || w;
				h = width || h;
				canvas = document.createElement("canvas");
				document.body.appendChild(canvas);
				break;
			case "string":
				el = document.getElementById(el);
			default:
				if (el.tagName == "CANVAS") {
					canvas = el;
				} else {
					canvas = document.createElement("canvas");
					el.appendChild(canvas);
				}
				canvas.style.position = "absolute";
				canvas.style.left = el.offsetLeft;
				canvas.style.top = el.offsetTop;
				w = width || el.clientWidth || w;
				h = height || el.clientHeight || h;
				break;
		}
		
		canvas.id = "background"+canvases;
		canvases++;
		
		this.ctext = canvas.getContext("2d");
		canvas.width = w;
		canvas.height = h;
		this.width = w;
		this.height = h;
		this.canvas = canvas;
		
		canvas = null;
		el = null;
	};
	background.prototype.draw = function () {
		console.log("Not implemented");
	};
	
	global.Cartoony = init;
	global.Background = background_init;
})(this);