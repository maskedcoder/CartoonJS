(function (global) {
    // Tally of canvases for generating id's
	var canvases = 0;

    /**
     * Creates a new CartoonCanvas
     *
     * @param element The parent element for the new canvas
     * @param width The canvas width
     * @param height The canvas height
     *
     * @return CartoonCanvas object
     */
	/* init = function (element, width, height) {
		return new canvas(element, width, height);
	};*/

    /**
     * Creates a new Background canvas
     *
     * @param element The parent element for the new canvas
     * @param width The canvas width
     * @param height The canvas height
     *
     * @return Background object
     */
	/*var background_init = function (element, width, height) {
		return new background(element, width, height);
	};*/


    /**
     * CartoonCanvas initializer.
     * ([element || id], width, height)
     * 
     * @param el The parent element for the new canvas
     * @param width The canvas width
     * @param height The canvas height
     *
     * @return CartoonCanvas object
     */
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

    /**
     * Clears the CartoonCanvas and draws all of the child CartoonItems
     */
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

    /**
     * Adds the CartoonItem to the CartoonCanvas. The CartoonItem will not be called until CartoonCanvas.draw() is called
     *
     * @param item CartoonItem object
     */
	canvas.prototype.addItem = function (item) {
		this.items[item.name] = item;
	};

    /**
     * Removes the CartoonItem with the given name from the CartoonCanvas. The change will not be shown until CartoonCanvas.draw() is called
     *
     * @param name The name of the CartoonItem object to remove
     */
	canvas.prototype.removeItem = function (name) {
		var obj = this.items[name];
		this.items[name] = undefined;
		delete obj;
	};

    /**
     * Fetches the CartoonItem with the given name from the CartoonCanvas's list of CartoonItems
     *
     * @param name The name of the CartoonItem object
     */
	canvas.prototype.getItem = function (name) {
		return this.items[name];
	};

	
    /**
     * Background initializer.
     * ([element || id], width, height)
     * 
     * @param el The parent element for the new canvas
     * @param width The canvas width
     * @param height The canvas height
     *
     * @return Background object
     */
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

    /**
     * Draws the Background
     */
	background.prototype.draw = function () {
		console.log("Not implemented");
	};
	
	global.CartoonCanvas = canvas;
	global.Background = background;
})(this);