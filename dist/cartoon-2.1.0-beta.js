/*!
 * Cartoon.js v2.1.0-beta 
 * Copyright (c) 2012-2013 Andrew Myers 
 * MIT License 
 */
(function (window) {
    // requestAnimationFrame polyfill
    // This is copied from Erik Moller via Paul Irish
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    // Tally of canvases for generating id's
    var canvases = 0;

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
        var elType = typeof (el),
            w = 500,
            h = 300,
            canvas = null;
        if (elType == "number") {
            w = el || w;
            h = width || h;
            canvas = document.createElement("canvas");
            document.body.appendChild(canvas);
        } else {
            if (elType == "string") {
                el = document.getElementById(el);
            }
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
        }

        canvas.id = "canvas" + canvases;
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

        this._items = {};

        canvas = null;
        el = null;
    };

    /**
     * Clears the CartoonCanvas and draws all of the child CartoonItems
     */
    canvas.prototype.draw = function () {
        var ctext = this.ctext;
        ctext.clearRect(0,0,this.width,this.height);
        for (var name in this._items) {
            if (this._items[name].visible) {
                ctext.save();
                this._items[name].draw(ctext);
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
        this._items[item.name] = item;
    };

    /**
     * Removes the CartoonItem with the given name from the CartoonCanvas. The change will not be shown until CartoonCanvas.draw() is called
     *
     * @param name The name of the CartoonItem object to remove
     */
    canvas.prototype.removeItem = function (name) {
        delete this._items[name];
    };

    /**
     * Fetches the CartoonItem with the given name from the CartoonCanvas's list of CartoonItems
     *
     * @param name The name of the CartoonItem object
     */
    canvas.prototype.getItem = function (name) {
        return this._items[name];
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
        if (elType == "number") {
            w = el || w;
            h = width || h;
            canvas = document.createElement("canvas");
            document.body.appendChild(canvas);
        } else {
            if (elType == "string") {
                el = document.getElementById(el);
            }
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
    
    window.CartoonCanvas = canvas;
    window.Background = background;
    // Tally of objects for generating id's
    var objects = 0;


    /**
     * AbstractCartoonItem initializer
     * If no name is given, a unique name will be automatically generated
     * All CartoonItems should inherit this class
     *
     * @param name The name for the new CartoonItem (optional)
     *
     * @return new AbstractCartoonItem
     */
    var AbstractCartoonItem = function (name) {
        this.name = name || "object_" + objects;
        this.attrs = {};
        this.reverse = false;
        this.rotation = 0;
        this.originX = 0;
        this.originY = 0;
        this.visible = true;
        this.x = 0;
        this.y = 0;
        this.scale = 1;
        this.parent = null;
    };

    /**
     * Sets the AbstractCartoonItem's parent to the given AbstractCartoonItem
     *
     * @param p AbstractCartoonItem to be parent
     *
     * @return Bool success
     */
    AbstractCartoonItem.prototype.setParent = function (p) {
        if (!(p instanceof AbstractCartoonItem) && (p !== null)) {
            return false;
        }
        this.parent = p;
        return true;
    };

    /**
     * The vital function which does the actual drawing. Subclasses should overwrite this function.
     * By default, this function only prints "Not implemented" to the console
     *
     * @ctext CanvasRenderingContext2d on which to draw the object
     */
    AbstractCartoonItem.prototype.draw = function (ctext) {
        console.log("Not implemented");
    };

    /**
     * Sets one or more AbstractCartoonItem attributes
     * If a name is given but no value, the value of the attribute is returned
     *
     * @param name Name of an AbstractCartoonItem attribute or an object describing several attributes
     * @param value The new value for the attribute (optional)
     *
     * @return Bool success
     */
    AbstractCartoonItem.prototype.attr = function (name, value) {
        if (typeof (name) == "object") {
            var success = true;
            for (var n in name) {
                success = success && this.attr(n, name[n]);
            }
            return success;
        } else {
            if (value === undefined) {
                if (this.attrs[name] === undefined) {
                    if (["x", "y", "rotation", "scale", "path", "reverse", "closePath", "visible", "originX", "originY"].indexOf(name) == -1) {
                        return false;
                    }
                    return this[name];
                }
                return this.attrs[name];
            } else {
                if (this.attrs[name] === undefined) {
                    if (["x", "y", "rotation", "scale", "path", "reverse", "closePath", "visible", "originX", "originY"].indexOf(name) == -1) {
                        return false;
                    }
                    this[name] = value;
                } else {
                    switch (name) {
                        default:
                            this.attrs[name] = value;
                    }
                }
            }
        }
        return true;
    };

    /**
     * CartoonPathItem initializer
     * CartoonPathItems represent a path made up of lines, curves, and gaps which may have a stroke and a fill.
     *
     * @param name The name for the new CartoonPathItem (optional)
     *
     * @return new CartoonPathItem object
     */
    var CartoonPathItem = function (name) {
        AbstractCartoonItem.call(this, name);
        this.path = [];
        this.attrs = {
            fillStyle: "#000",
            font: "Arial",
            globalAlpha: 1.0,
            globalCompositeOperation: "source-over",
            lineCap: "butt",
            lineJoin: "miter",
            lineWidth: 1.0,
            miterLimit: 10,
            shadowBlur: 0,
            shadowColor: "rgba(0,0,0,0)",
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            strokeStyle: "#000",
            textAlign: "start",
            textBaseLine: "alphabetic"
        };
        this.closePath = false;
        this.boneMatrices = {};
        this._bones = {};
        this._buildingBone = false;
        this._paths = [[]];
        this._currentPath = 0;
        this._pathAttrs = { "0": {} };
        objects++;
    };
    // CartoonPathItem inherits AbstractCartoonItem
    if (typeof (Object.create) == 'function') {
        CartoonPathItem.prototype = Object.create(AbstractCartoonItem.prototype);
    } else {
        CartoonPathItem.prototype = new AbstractCartoonItem("");
    }
    CartoonPathItem.prototype.constructor = CartoonPathItem;

    /**
     * Adds a Matrix to the CartoonPathItem's list of Matrices. Each Matrix can be used to manipulate a number of vertices
     *
     * @param bone Matrix object
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.addBone = function (bone) {
        var name = bone.name;
        if (this._bones[name] === undefined) {
            this._bones[name] = [];
            this.boneMatrices[name] = bone;
        }
        return this;
    };

    /**
     * Sets the vertices that a given Matrix may manipulate
     *
     * @param bonename A Matrix object or name of a Matrix object in this CartoonPathItem's list of bones
     * @param segmentlist A list of vertices
     *
     * @return This CartoonPathItem or false if there was an error
     */
    CartoonPathItem.prototype.setBoneSegments = function (bonename, segmentlist) {
        if (typeof (bonename) != "string") {
            bonename = bonename.name;
        }
        if (this._bones[bonename] === undefined) {
            return false;
        }
        this._bones[bonename] = segmentlist;
        return this;
    };

    /**
     * Sets the given Matrix to automatically adopt all future vertices until CartoonPathItem.endBone() is called.
     * If the Matrix object given is not in this CartoonPathItem's list of bones, it will be added
     *
     * @param bone A Matrix object
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.beginBone = function (bone) {
        var name = bone.name;
        if (this._bones[name] === undefined) {
            this._bones[name] = [];
            this.boneMatrices[name] = bone;
        }
        this._buildingBone = name;
        return this;
    };

    /**
     * Tells the CartoonPathItem to stop giving the current Matrix power over new vertices
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.endBone = function () {
        this._buildingBone = false;
        return this;
    };

    /**
     * Draws the CartoonPathItem
     */
    CartoonPathItem.prototype.draw = function (scene) {
        for (var name in this.attrs) {
            scene[name] = this.attrs[name];
        }
        var path = this._getGlobalPath(),
            paths = this._paths,
            j = 0,
            jlength = paths.length,
            currentPoint = null,
            control1 = null,
            control2 = null,
            pathAttrs = this._pathAttrs;
        var pth, inc, length, i;
        for (; j < jlength; j++) {
            pth = paths[j];
            inc = 0;
            length = pth.length;

            for (name in pathAttrs[j]) {
                scene[name] = pathAttrs[j][name];
            }

            scene.beginPath();
            for (; inc < length; inc++) {
                i = pth[inc];
                currentPoint = path[i];
                switch (currentPoint.type) {
                    case "line":
                        scene.lineTo(currentPoint.x,
                            currentPoint.y);
                        break;
                    case "bezierCurve":
                        control1 = path[i + 1];
                        control2 = path[i + 2];
                        inc += 2;
                        scene.bezierCurveTo(control1.x,
                            control1.y,
                            control2.x,
                            control2.y,
                            currentPoint.x,
                            currentPoint.y);
                        break;
                    case "quadraticCurve":
                        control1 = path[i + 1];
                        inc++;
                        scene.quadraticCurveTo(control1.x,
                            control1.y,
                            currentPoint.x,
                            currentPoint.y);
                        break;
                    case "arc":
                        control1 = path[i + 1];
                        inc++;
                        scene.arcTo(currentPoint.x,
                            currentPoint.y,
                            control1.x,
                            control1.y,
                            currentPoint.radius);
                        break;
                    //case "move":
                    default:
                        scene.moveTo(currentPoint.x,
                            currentPoint.y);
                        break;
                }
            }
            if (this.closePath) {
                scene.closePath();
            }
            scene.fill();
            scene.stroke();
        }
    };

    /**
     * Transforms the parent Canvas's Context2d into the CartoonPathItem's local Matrix
     *
     * @param ctext CanvasRenderingContext2d to transform
     *
     * @return An object telling the origin offset of the final parent item
     * @private
     */
    CartoonPathItem.prototype._getGlobal = function (ctext) {
        var matrices = [],
            currentMatrix = this;
        var originx, originy, scale, cx, cy, rotation, sign;
        var pi = Math.PI;

        while (currentMatrix) {
            matrices.push(currentMatrix);
            currentMatrix = currentMatrix.parent;
        }

        var mindex = matrices.length - 1;
        for (; mindex > -1; mindex--) {
            currentMatrix = matrices[mindex];
            originx = currentMatrix.originX; //These will be in local coordinates
            originy = currentMatrix.originY;
            cx = currentMatrix.x; //These will be in parent's coordinates
            cy = currentMatrix.y;
            scale = currentMatrix.scale;
            rotation = currentMatrix.rotation;
            sign = (currentMatrix.reverse) ? -1 : 1;

            ctext.translate(cx + originx, cy + originy);
            ctext.rotate(rotation * (pi / 180));
            ctext.scale(sign * scale, scale);
        }
        return { "originX": originx, "originY": originy };
    };

    /**
     * Recalculates the path into global coordinates
     *
     * @return List of vertices in global coordinates
     * @private
     */
    CartoonPathItem.prototype._getGlobalPath = function () {
        // _getGlobal only transforms the scene context
        // getGlobalPath transforms (a copy of) the path itself.
        var path = this.getPath(),
            i = 0,
            length = path.length,
            radius = 0,
            magnitude = 0,
            angle = 0,
            point = null,
            x = 0,
            y = 0,
            newPoint = null,
            gPath = [],
            matrices = [],
            currentMatrix = this;
        var originx, originy, scale, cx, cy, rotation, reverse;
        var pi = Math.PI,
            atan2 = Math.atan2,
            sqrt = Math.sqrt,
            cos = Math.cos,
            sin = Math.sin;

        while (currentMatrix) {
            matrices.push(currentMatrix);
            currentMatrix = currentMatrix.parent;
        }

        for (var name in this._bones) {
            var bones = [],
                currentBone = this.boneMatrices[name],
                index = 0;
            while (currentBone) {
                bones.push(currentBone);
                currentBone = currentBone.parent;
            }
            var bindex = 0,
                blength = bones.length,
                olength = 0;
            for (; bindex < blength; bindex++) {
                currentBone = bones[bindex];
                originx = currentBone.originX;
                originy = currentBone.originY;
                cx = currentBone.x;
                cy = currentBone.y;
                scale = currentBone.scale;
                rotation = currentBone.rotation;
                olength = this._bones[name].length;
                for (i = 0; i < olength; i++) {
                    index = this._bones[name][i];
                    point = path[index];
                    newPoint = { "type": point.type, "radius": point.radius };

                    x = point.x - originx;
                    y = point.y - originy;

                    magnitude = sqrt(x * x + y * y) * scale;
                    radius = (atan2(y, x) * (180 / pi) + rotation) * (pi / 180);
                    newPoint.x = magnitude * cos(radius) + cx + originx;
                    newPoint.y = magnitude * sin(radius) + cy + originy;

                    path[index] = newPoint;
                }
            }
        }
        var mindex = 0,
            mlength = matrices.length;
        for (; mindex < mlength; mindex++) {
            currentMatrix = matrices[mindex];
            originx = currentMatrix.originX;
            originy = currentMatrix.originY;
            cx = currentMatrix.x;
            cy = currentMatrix.y;
            scale = currentMatrix.scale;
            rotation = currentMatrix.rotation;
            reverse = (currentMatrix.reverse) ? -1 : 1;
            gPath = [];
            for (i = 0; i < length; i++) {
                point = path[i];
                newPoint = { "type": point.type, "radius": point.radius };

                x = (point.x - originx) * reverse;
                y = point.y - originy;

                magnitude = sqrt(x * x + y * y) * scale;
                radius = (atan2(y, x) * (180 / pi) + rotation) * (pi / 180);
                newPoint.x = magnitude * cos(radius) + cx;
                newPoint.y = magnitude * sin(radius) + cy;

                gPath.push(newPoint);
            }
            path = gPath;
        }
        currentMatrix = null;
        if (gPath.length === 0) {
            console.log(gPath, path, this.name, this);
        }
        return gPath;
    };

    /**
     * Gets the CartoonPathItem's list of vertices
     *
     * @return List of vertices
     */
    CartoonPathItem.prototype.getPath = function () {
        return [].concat(this.path);
    };

    /**
     * Sets the CartoonPathItem's list of vertices to the given list
     *
     * @param path New list of vertices
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.setPath = function (path) {
        this.path = path;
        return this;
    };

    /**
     * Adds three vertices describing a bezier curve to the CartoonPathItem's list of vertices
     *
     * @param x The destination x coordinate
     * @param y The destination y coordinate
     * @param cx1 The x coordinate of the first control point
     * @param cy1 The y coordinate of the first control point
     * @param cx2 The x coordinate of the second control point
     * @param cy2 The y coordinate of the second control point
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.bezierCurveTo = function (x, y, cx1, cy1, cx2, cy2) {
        this.path.push({ "type": "bezierCurve", "x": x, "y": y });
        this.path.push({ "type": "control1", "x": cx1, "y": cy1 });
        var nLength = this.path.push({ "type": "control2", "x": cx2, "y": cy2 });
        if (this._buildingBone) {
            this._bones[this._buildingBone] = this._bones[this._buildingBone].concat([nLength - 3, nLength - 2, nLength - 1]);
        }
        this._paths[this._currentPath] = this._paths[this._currentPath].concat([nLength - 3, nLength - 2, nLength - 1]);
        return this;
    };

    /**
     * Adds two vertices describing a quadratic curve to the CartoonPathItem's list of vertices
     *
     * @param x The destination x coordinate
     * @param y The destination y coordinate
     * @param cx The x coordinate of the control point
     * @param cy The y coordinate of the control point
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.quadraticCurveTo = function (x, y, cpx, cpy) {
        this.path.push({ "type": "quadraticCurve", "x": x, "y": y });
        var nLength = this.path.push({ "type": "control1", "x": cpx, "y": cpy });
        if (this._buildingBone) {
            this._bones[this._buildingBone] = this._bones[this._buildingBone].concat([nLength - 2, nLength - 1]);
        }
        this._paths[this._currentPath] = this._paths[this._currentPath].concat([nLength - 2, nLength - 1]);
        return this;
    };

    /**
     * Adds two vertices describing an arc curve to the CartoonPathItem's list of vertices
     *
     * @param x The destination x coordinate
     * @param y The destination y coordinate
     * @param x2 The x coordinate of a point on the arc
     * @param y2 The y coordinate of a point on the arc
     * @param radius The radius of the arc
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.arcTo = function (x, y, x2, y2, radius) {
        this.path.push({ "type": "arc", "x": x, "y": y, "radius": radius });
        var nLength = this.path.push({ "type": "control1", "x": x2, "y": y2 });
        if (this._buildingBone) {
            this._bones[this._buildingBone] = this._bones[this._buildingBone].concat([nLength - 2, nLength - 1]);
        }
        this._paths[this._currentPath] = this._paths[this._currentPath].concat([nLength - 2, nLength - 1]);
        return this;
    };

    /**
     * Adds a vertex describing a line to the CartoonPathItem's list of vertices
     *
     * @param x The destination x coordinate
     * @param y The destination y coordinate
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.lineTo = function (x, y) {
        var nLength = this.path.push({ "type": "line", "x": x, "y": y });
        if (this._buildingBone) {
            this._bones[this._buildingBone].push(nLength - 1);
        }
        this._paths[this._currentPath].push(nLength - 1);
        return this;
    };

    /**
     * Adds a vertex describing a jump to a new point to the CartoonPathItem's list of vertices
     *
     * @param x The destination x coordinate
     * @param y The destination y coordinate
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.moveTo = function (x, y) {
        var nLength = this.path.push({ "type": "move", "x": x, "y": y });
        if (this._buildingBone) {
            this._bones[this._buildingBone].push(nLength - 1);
        }
        this._paths[this._currentPath].push(nLength - 1);
        return this;
    };

    /**
     * Ends the construction of the current path
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.endPath = function () {
        this._currentPath++;
        this._pathAttrs[this._currentPath] = {};
        this._paths.push([]);
        return this;
    };

    /**
     * Sets the fill for the current path
     *
     * @param value The new fill style
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.fillFor = function (value) {
        this._pathAttrs[this._currentPath].fillStyle = value;
        return this;
    };

    /**
     * Sets the stroke of the current path
     *
     * @param value The new stroke style
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.strokeFor = function (value) {
        this._pathAttrs[this._currentPath].strokeStyle = value;
        return this;
    };

    /**
     * Sets the line width of the current path
     *
     * @param value The new line width
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.lineWidthFor = function (value) {
        this._pathAttrs[this._currentPath].lineWidth = value;
        return this;
    };
    window.CartoonPathItem = CartoonPathItem;

    /**
     * GenericCartoonItem initializer
     * GenericCartoonItems represent a generic Cartoon Item with a customizable draw() function.
     * A basic use for this class would be creating an object and then writing a new function to draw it.
     * For example:
     *     var myItem = new GenericCartoonItem();
     *     myItem.draw = function (ctext) {
     *         ctext.fillRect(50, 50, 100, 100);
     *     };
     * The functions getGlobal() and customizeContext() are provided for convenience.
     *
     * @param name The name for the new GenericCartoonItem (optional)
     *
     * @return new GenericCartoonItem object
     */
    var GenericCartoonItem = function (name) {
        AbstractCartoonItem.call(this, name);
        this.attrs = {
            fillStyle: "#000",
            font: "Arial",
            globalAlpha: 1.0,
            globalCompositeOperation: "source-over",
            lineCap: "butt",
            lineJoin: "miter",
            lineWidth: 1.0,
            miterLimit: 10,
            shadowBlur: 0,
            shadowColor: "rgba(0,0,0,0)",
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            strokeStyle: "#000",
            textAlign: "start",
            textBaseLine: "alphabetic"
        };
        objects++;
    };
    // GenericCartoonItem inherits AbstractCartoonItem
    if (typeof (Object.create) == 'function') {
        GenericCartoonItem.prototype = Object.create(AbstractCartoonItem.prototype);
    } else {
        GenericCartoonItem.prototype = new AbstractCartoonItem("");
    }
    GenericCartoonItem.prototype.constructor = GenericCartoonItem;

    GenericCartoonItem.prototype.getGlobal = CartoonPathItem.prototype._getGlobal;

    /**
     * Prepares the CanvasRenderingContext2d by setting all of the values for drawing
     * The context is not transformed by this function. To transform the context,
     * use GenericCartoonItem.getGlobal() instead.
     *
     * @param ctext CanvasRenderingContext2d to customize
     */
    GenericCartoonItem.prototype.customizeContext = function (ctext) {
        for (var name in this.attrs) {
            ctext[name] = this.attrs[name];
        }
    };

    window.GenericCartoonItem = GenericCartoonItem;

    /**
     * CartoonImageItem initializer
     * The CartoonImageItem class is for using images in CartoonCanvases.
     *
     * @param name The name for the new CartoonImageItem
     * @param picture An image element that will be drawn on the CartoonCanvas
     *
     * @return new CartoonImageItem
     */
    var CartoonImageItem = function (name, picture) {
        AbstractCartoonItem.call(this, name);
        this.attrs = {
            globalAlpha: 1.0,
            globalCompositeOperation: "source-over"
        };
        this.img = picture;
    };
    // CartoonImageItem inherits AbstractCartoonItem
    if (typeof (Object.create) == 'function') {
        CartoonImageItem.prototype = Object.create(AbstractCartoonItem.prototype);
    } else {
        CartoonImageItem.prototype = new AbstractCartoonItem("");
    }
    CartoonImageItem.prototype.constructor = CartoonImageItem;

    CartoonImageItem.prototype._getGlobal = CartoonPathItem.prototype._getGlobal;

    /**
     * Draws the image onto a canvas
     *
     * @param CanvasRenderingContext2d to draw with
     */
    CartoonImageItem.prototype.draw = function (ctext) {
        for (var name in this.attrs) {
            ctext[name] = this.attrs[name];
        }
        var origins = this._getGlobal(ctext);
        ctext.drawImage(this.img, -origins.originX, -origins.originY);
    };

    window.CartoonImageItem = CartoonImageItem;

    // Matrix

    // Tally of matrices to generate id's
    var matrices = 0;

    /**
     * Matrix initializer
     *
     * @param name Name for the new Matrix (optional)
     *
     * @return The new Matrix object
     */
    var matrix = function (name) {
        this.originX = 0;
        this.originY = 0;
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.scale = 1;
        this.matrix = null;
        this.name = name || "matrix_" + matrices;
        matrices++;
    };

    /**
     * Gives another Matrix the ability to manipulate this one
     *
     * @param other The other Matrix
     *
     * @return Bool success
     */
    matrix.prototype.setMatrix = function (other) {
        if (other == this || (!(other instanceof matrix) && (other !== null))) {
            return false;
        }
        this.matrix = other;
        return true;
    };

    /**
     * Pretends to draw the Matrix
     */
    matrix.prototype.draw = function () {
        return;
    };

    /**
     * Sets one or more Matrix attributes
     * If a name is given but no value, the value of the attribute is returned
     *
     * @param name Name of a Matrix attribute or an object describing several attributes
     * @param value The new value for the attribute (optional)
     *
     * @return Bool success
     */
    matrix.prototype.attr = function (name, value) {
        if (typeof (name) == "object") {
            var success = true,
                n = null;
            for (n in name) {
                success = success && this.attr(n, name[n]);
            }
            return success;
        } else {
            if (value === undefined) {
                if (["x", "y", "rotation", "scale"].indexOf(name) == -1) {
                    return false;
                }
                return this[name];
            } else {
                if (["x", "y", "rotation", "scale"].indexOf(name) == -1) {
                    return false;
                }
                this[name] = value;
            }
        }
        return true;
    };
    window.Matrix = matrix;
    var LASTFRAME = 0, // Tells the previous frame logged in case of debugging
        DEBUG = false; // Whether or not to log the frames per second of the animation

    /**
     * Animation initializer. If makeControls is true, an interface will be
     * generated and placed inside whatever element has an id 'animation-controls-container'
     *
     * @param makeControls Whether or not graphical controls should be generated
     *
     * @return The new Animation
     */
    var animation = function (makeControls) {
        
        this.time = 0;
        this.status = "ready";
        this.onstep = false;
        this.onstatus = false;
        this.scenes = {}; // scene open time -> scene
        this.sceneChanges = []; // reverse order list of scene change times
        this.lastframe = 0;
        this.audio = null;
        
        if (makeControls) {
            this.createControls();
        }
    };

    /**
     * Creates the controls for the animation
     *
     * @return New Controls object
     */
    animation.prototype.createControls = function () {
        return new controls(this);
    };
    
    /**
     * Adds a scene to the Animation. A scene is a canvas that will be hidden until its time comes
     *
     * @param scene Canvas object
     * @param time The time for the scene to show up
     */
    animation.prototype.addScene = function (scene, time) {
        this.scenes[time] = scene;
        if (this.sceneChanges.indexOf(time) == -1) {
            this.sceneChanges.push(time);
        }
    };

    /**
     * Sets the Animation's audio to the given audio
     *
     * @param audio An Audio element
     */
    animation.prototype.addAudio = function (audio) {
        this.audio = audio;
    };

    /**
     * Toggles the Animation between playing and pausing
     */
    animation.prototype.togglePlay = function () {
        if (this.status == "ready") {
            if (this.onstatus) {
                this.onstatus("playing");
            }
            this.play();
            return;
        }
        if (this.status == "playing") {
            if (this.onstatus) {
                this.onstatus("pause");
            }
            this.pause();
        } else {
            if (this.onstatus) {
                this.onstatus("playing");
            }
            this.resume();
        }
    };

    /**
     * Plays the Animation
     */
    animation.prototype.play = function () {
        this.sceneChanges.sort(function (a, b) {return b - a;});
        for (var time in this.scenes) {
            this.scenes[time].compile();
            this.scenes[time].hide();
        }
        this.lastframe = this.scenes[this.sceneChanges[0]].lastframe;
        this.startTime = +new Date();
        this.status = "playing";
        if (this.audio) {
            this.audio.play();
        }
        this._step();
    };

    /**
     * Makes the Animation stop playing and sends it back to the start
     * To just stop the animation, use Animation.pause()
     */
    animation.prototype.stop = function () {
        var time = 0;
        if (this.status == "ready") {
            this.sceneChanges.sort(function (a, b) { return b - a; });
            for (time in this.scenes) {
                this.scenes[time].compile();
                this.scenes[time].hide();
            }
            this.lastframe = this.scenes[this.sceneChanges[0]].lastframe;
        } else {
            this.status = "ready";
            if (this.onstatus) {
                this.onstatus("ready");
            }
        }
        for (time in this.scenes) {
            this.scenes[time].hide();
        }
        this.time = 0;
        this.startTime = +new Date();
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
        this._step(true);
    };

    /**
     * Pauses the Animation
     */
    animation.prototype.pause = function () {
        if (this.audio) {
            this.audio.pause();
        }
        this.status = "paused";
    };

    /**
     * Resumes the Animation
     */
    animation.prototype.resume = function () {
        this.startTime = +new Date() - this.time;
        this.status = "playing";
        if (this.audio) {
            this.audio.play();
        }
        this._step();
    };

    /**
     * Sets the Animation to the given time, and draws the corresponding frame
     *
     * @param time The new time
     */
    animation.prototype.setTime = function (time) {
        this.time = time;
        this.startTime = +new Date() - time;
        if (this.audio) {
            this.audio.currentTime = this.time/1000;
        }
        for (time in this.scenes) {
            this.scenes[time].hide();
        }
        if (this.status != "playing") {
            this.status = "paused";
        }
        this._step(true);
    };

    /**
     * Sends the Animation backwards 15 seconds, or as far as it can
     */
    animation.prototype.back15 = function () {
        this.time = (this.time > 15000) ? this.time - 15000 : 0;
        if (this.audio) {
            this.audio.currentTime = this.time/1000;
        }
        for (var time in this.scenes) {
            this.scenes[time].hide();
        }
        this.startTime = +new Date() - this.time;
        if (this.status != "playing") {
            this.status = "paused";
        }
        this._step(true);
    };

    /**
     * Draws the frame for the current time and schedules itself to be called again if the animation isn't finished
     * If a value is given for update, the current time is recalculated, but the function will not ask to be called again
     *
     * @param update Bool
     * @private
     */
    animation.prototype._step = function(update) {
        if (update) {
            this.time = +new Date() - this.startTime;
        } else {
            switch (this.status) {
                case "paused":
                case "ready":
                    return;
                //case "playing":
                default:
                    this.time = +new Date() - this.startTime;
                    break;
            }
        }
        var time = this.time;
        if (this.onstep) {
            this.onstep(time, this.lastframe);
        }
        
        var scenetime = this.sceneChanges.filter(function (n) {return n <= time;})[0];
        var currentScene = this.scenes[scenetime];
        
        if (currentScene.hidden) {
            if (this.sceneChanges.indexOf(scenetime)+1 < this.sceneChanges.length) {
                this.scenes[this.sceneChanges[this.sceneChanges.indexOf(scenetime)+1]].hide();
            }
            currentScene.show();
        }
        
        currentScene.stepAnimation(time, update);
        
        // debug f/s display
        if (DEBUG) {
            if (time != LASTFRAME) {
                console.log("FPS: "+Math.floor(1000/(time-LASTFRAME)));
                if (Math.floor(1000/(time-LASTFRAME)) < 20) {
                    console.log("Low one: "+time);
                }
                LASTFRAME = time;
            }
        }
        
        if (update) {
            return;
        }
        
        if (time < this.lastframe) {
            (function (anim) {
                requestAnimationFrame(function () {
                    anim._step();
                });
            })(this);
        } else {
            if (this.onstatus) {
                this.onstatus("ready");
            }
            this.status = "ready";
        }
    };

    /**
     * SubAnimation initializer
     * SubAnimations animate exactly one attribute change for one item
     * Every Animation gets compiled to a large list of SubAnimations
     *
     * @param object A CartoonItem
     * @param type The attribute of the CartoonItem that will be changed
     * @param attr1 The inital state of the CartoonItem's attribute
     * @param attr2 The final state of the CartoonItem's attribute
     * @param start The starting time for the change
     * @param finish The ending time for the change
     *
     * @return The new SubAnimation
     */
    var subAnimation = function (object, type, attr1, attr2, start, finish) {
        this.object = object;
        this.startState = attr1;
        this.endState = attr2;
        this.begin = start;
        this.end = finish;
        this.update = null;
        this.type = type;
        switch (type) {
            case "path":
                this.update = alterPath;
                break;
            case "strokeStyle":
            case "fillStyle":
            case "shadowColor":
                this.startState = parseColor(attr1);
                this.endState = parseColor(attr2);
                this.update = alterColor;
                break;
            default:
                this.update = standardAlter;
        }
    };

    /**
     * Checks if this SubAnimation should be playing
     * Returns true if the time is between the start and finish
     * of this SubAnimation
     *
     * @param time The time of the Animation
     *
     * @return Bool
     */
    subAnimation.prototype.isPlaying = function (time) {
        return (time >= this.begin && time <= this.end);
    };

    /**
     * Calculates the progress of the SubAnimation (based on the time of the global Animation),
     * and transforms the object accordingly
     *
     * @param time The time of the global Animation
     */
    subAnimation.prototype.transformForTime = function (time) {
        var prct = (time - this.begin)/(this.end - this.begin);
        this.update(this.object, prct, this.type, this.startState, this.endState);
    };

    /**
     * Parses a CSS color into red, green, and blue values
     *
     * @param color A CSS color of the format #rgb, #rrggbb, rgb(#,#,#), rgba(#,#,#,#), or a basic keyword
     *
     * @return object containing red, green, and blue values
     */
    var parseColor = function (color) {
        var colors = {
            red: 0,
            green: 0,
            blue: 0,
            alpha: 1
        }, mainpart, parts;
        if (color[0] == "#") {
            if (color.length == 4) {
                colors.red = parseBase16Digit(color[1]) * 17;
                colors.green = parseBase16Digit(color[2]) * 17;
                colors.blue = parseBase16Digit(color[3]) * 17;
            } else {
                colors.red = parseBase16Digit(color[1]) * 16 + parseBase16Digit(color[2]);
                colors.green = parseBase16Digit(color[3]) * 16 + parseBase16Digit(color[4]);
                colors.blue = parseBase16Digit(color[5]) * 16 + parseBase16Digit(color[6]);
            }
        } else if (color.substr(0, 4) == "rgba") {
            mainpart = color.substring(5, color.length - 1);
            parts = mainpart.split(/ *, */);
            colors.red = Number(parts[0]);
            colors.green = Number(parts[1]);
            colors.blue = Number(parts[2]);
            colors.alpha = Number(parts[3]);
        } else if (color.substr(0, 3) == "rgb") {
            mainpart = color.substring(4, color.length - 1);
            parts = mainpart.split(/ *, */);
            colors.red = Number(parts[0]);
            colors.green = Number(parts[1]);
            colors.blue = Number(parts[2]);
        } else {
            switch (color) {
                // Since 0 is the default, we can skip setting attributes quite often
                case "black":
                    break;
                case "silver":
                    colors.red = 192;
                    colors.green = 192;
                    colors.blue = 192;
                    break;
                case "gray":
                case "grey":
                    colors.red = 128;
                    colors.green = 128;
                    colors.blue = 128;
                    break;
                case "white":
                    colors.red = 255;
                    colors.green = 255;
                    colors.blue = 255;
                    break;
                case "maroon":
                    colors.red = 128;
                    break;
                case "red":
                    colors.red = 255;
                    break;
                case "purple":
                    colors.red = 128;
                    colors.blue = 128;
                    break;
                case "fuchsia":
                    colors.red = 255;
                    colors.blue = 255;
                    break;
                case "green":
                    colors.green = 128;
                    break;
                case "lime":
                    colors.green = 255;
                    break;
                case "olive":
                    colors.red = 128;
                    colors.green = 128;
                    break;
                case "yellow":
                    colors.red = 255;
                    colors.green = 255;
                    break;
                case "navy":
                    colors.blue = 128;
                    break;
                case "blue":
                    colors.blue = 255;
                    break;
                case "teal":
                    colors.green = 128;
                    colors.blue = 128;
                    break;
                case "aqua":
                    colors.green = 255;
                    colors.blue = 255;
                    break;
                default:
                    break;
            }
        }
        return colors;
    };

    /**
     * Parses a digit that is in base 16 and returns the corresponding base 10 value
     *
     * @param num A string representing a digit of base 16
     *
     * @return A base 10 integer
     */
    var parseBase16Digit = function (num) {
        num = num.toLowerCase();
        return '0123456789abcdef'.indexOf(num);
    };
    
    /**
     * Alters a CartoonItem's attribute, assuming it is just a number
     *
     * @param object The CartoonItem
     * @param prct The percentage progress of the SubAnimation
     * @param attr The attribute to modify
     * @param start The start value
     * @param end The end value
     */
    var standardAlter = function (object, prct, attr, start, end) {
        object.attr(attr, (end - start)*prct + start);
    };
    
    /**
     * Alters a CartoonItem's attribute, assuming it is a path
     *
     * @param object The CartoonItem
     * @param prct The percentage progress of the SubAnimation
     * @param attr The attribute to modify
     * @param start The start position
     * @param end The end position
     */
    var alterPath = function (object, prct, attr, start, end) {
        var pathIncr = 0,
            numPathSegments = start.length,
            startSegment = null,
            endSegment = null,
            newSegment = null,
            newPath = [],
            segmentAttr = "",
            startVal = null;
        for (; pathIncr < numPathSegments; pathIncr++) {
            startSegment = start[pathIncr];
            endSegment = end[pathIncr];
            newSegment = {};
            for (segmentAttr in startSegment) {
                startVal = startSegment[segmentAttr];
                if (isNaN(startVal)) {
                    newSegment[segmentAttr] = startVal;
                } else {
                    newSegment[segmentAttr] = (endSegment[segmentAttr] - startVal) * prct + startVal;
                }
            }
            newPath.push(newSegment);
        }
        object.attr(attr, newPath);
    };
    
    /**
     * Alters a CartoonItem's attribute, assuming it is a color
     *
     * @param object The CartoonItem
     * @param prct The percentage progress of the SubAnimation
     * @param attr The attribute to modify
     * @param start The start color
     * @param end The end color
     */
    var alterColor = function (object, prct, attr, startColor, endColor) {
        var newColor = {
            red: Math.floor(startColor.red + (endColor.red - startColor.red) * prct),
            green: Math.floor(startColor.green + (endColor.green - startColor.green) * prct),
            blue: Math.floor(startColor.blue + (endColor.blue - startColor.blue) * prct),
            alpha: startColor.alpha + (endColor.alpha - startColor.alpha) * prct
        };
        object.attr(attr, "rgba(" + newColor.red + "," + newColor.green + "," + newColor.blue + "," + newColor.alpha + ")");
    };

    
    /**
     * Creates a new AnimationScene
     *
     * @param scene The Canvas to control
     * @param background The Background for the AnimationScene
     *
     * @return The new AnimationScene
     */
    /*var asinit = function (s, b) {
        return new AnimationScene(s, b);
    };*/

    /**
     * AnimationScene initializer
     *
     * @param scene The Canvas to control
     * @param background The Background for the AnimationScene
     *
     * @return The new AnimationScene
     */
    var AnimationScene = function (scene, background) {
        this.background = background;
        this.scene = scene;
        this._timeline = {};
        this._immediateTimeline = {};
        this._subAnimations = [];
        this.lastframe = -1;
        this._drawnYet = false;
        this.hidden = false;
        this._MYLASTFRAME = -1;
    };

    /**
     * Hides the AnimationScene
     */
    AnimationScene.prototype.hide = function () {
        this.scene.canvas.style.display = "none";
        if (this.background) {
            this.background.canvas.style.display = "none";
        }
        this.hidden = true;
    };

    /**
     * Shows the AnimationScene
     */
    AnimationScene.prototype.show = function () {
        this.scene.canvas.style.removeProperty("display");
        if (this.background) {
            this.background.canvas.style.removeProperty("display");
            this.background.draw();
        }
        this.hidden = false;
    };

    /**
     * Draws the next frame in the Animation
     *
     * @param time The current time
     * @param update Whether we are jumping to a specific place
     */
    AnimationScene.prototype.stepAnimation = function (time, update) {
        this._drawnYet = true;
        var i = 0,
            anims = this._subAnimations,
            length = anims.length,
            current = null;
        for ( ;i < length;i++) {
            current = anims[i];
            if (current.isPlaying(time)) {
                current.transformForTime(time);
            }
        }
        var kframe, items, attr, item;
        var klist = [];
        for (kframe in this._immediateTimeline) {
            klist.push(kframe);
            if ((this._MYLASTFRAME < kframe && time >= kframe) || (time < this._MYLASTFRAME && time == kframe)) {
                items = this._immediateTimeline[kframe];
                for (item in items) {
                    this.scene.getItem(item).attr(items[item]);
                }
            }
        }
        if (update) {
            klist.sort(function (a, b) {return a - b;});
            for (i = 0, length = klist.length;i < length;i++) {
                kframe = klist[i];
                if (kframe <= time) {
                    items = this._immediateTimeline[kframe];
                    for (item in items) {
                        this.scene.getItem(item).attr(items[item]);
                    }
                } else {
                    break;
                }
            }
        }
        this._MYLASTFRAME = time;
        this.scene.draw();
    };

    /**
     * Adds a key frame the AnimationScene
     *
     * @param item CartoonItem or name of a CartoonItem
     * @param time Time during the animation
     * @param attr Name of a CartoonItem attribute
     * @param val The value for that attribute
     */
    AnimationScene.prototype.addKeyFrame = function (item, time, attr, val) {
        // item -> object or name, time -> int, attr -> name of item attribute,
        // val -> value for said attribute at said time
        // Timeline will be:
        // {item:{attr:{time:val, keys:[list_of_times]}}}
        if (time > this.lastframe) {
            this.lastframe = time;
        }
        if (typeof(item) != "string") {
            item = item.name;
        }
        if (this._timeline[item] === undefined) {
            this._timeline[item] = {};
        }
        if (this._timeline[item][attr] === undefined) {
            this._timeline[item][attr] = {
                "keys": []
            };
        }
        this._timeline[item][attr][time] = val;
        if (this._timeline[item][attr].keys.indexOf(time) == -1) {
            this._timeline[item][attr].keys.push(time);
        }
        if (this._timeline[item][attr][0] === undefined) {
            this._timeline[item][attr][0] = this.scene.getItem(item).attr(attr);
            this._timeline[item][attr].keys.push(0);
        }
    };

    /**
     * Schedules a non-animated attribute change for an object
     * i.e., if the animation is at any point past this time, the value is such and such
     *
     * @param item CartoonItem or name of a CartoonItem
     * @param time Time during the animation
     * @param attr Name of a CartoonItem attribute
     * @param val The value for that attribute
     */
    AnimationScene.prototype.addAttrChange = function (item, time, attr, val) {
        /*
        * For making instantaneous changes
        */
        if (time > this.lastframe) {
            this.lastframe = time;
        }
        if (typeof (item) != "string") {
            item = item.name;
        }

        if (this._immediateTimeline[time] === undefined) {
            this._immediateTimeline[time] = {};
        }
        if (this._immediateTimeline[time][item] === undefined) {
            this._immediateTimeline[time][item] = {
            };
        }
        this._immediateTimeline[time][item][attr] = val;
        if (!this._immediateTimeline[0] || !this._immediateTimeline[0][item] || !this._immediateTimeline[0][item][attr]) {
            var tmp = {};
            tmp[item] = {};
            tmp[item][attr] = this.scene.getItem(item).attr(attr);
            this._immediateTimeline[0] = tmp;
        }
    };

    /**
     * Prepares the AnimationScene for playing by reorganizing the timeline
     */
    AnimationScene.prototype.compile = function () {
        var sort = function (a, b) { return a - b; };
        this._MYLASTFRAME = -1;
        this._drawnYet = false;
        if (this._subAnimations.length === 0) {
            var item, time, attr, keyIncr, numKeys,
                itemName, timeName, attrName, prevTime;
            for (itemName in this._timeline) {
                item = this._timeline[itemName];
                for (attrName in item) {
                    attr = item[attrName];
                    attr.keys.sort(sort);
                    for (keyIncr = 0, numKeys = attr.keys.length; keyIncr < numKeys; keyIncr++) {
                        timeName = attr.keys[keyIncr];
                        if (keyIncr > 0) {
                            prevTime = attr.keys[keyIncr - 1];
                            this._subAnimations.push(
                                new subAnimation(
                                    this.scene.getItem(itemName),
                                    attrName, attr[prevTime],
                                    attr[timeName], prevTime,
                                    timeName
                                )
                            );
                        }
                    }
                }
            }
        }
    };

    
    /**
     * Gets an element by id
     *
     * @param id The id to search for
     *
     * @return HTML Element
     */
    var $ = function (id) {
        return document.getElementById(id);
    };
    
    var timer = false; // The timer (if there is one) for the controls to disappear once the mouse leaves the area

    /**
     * Hides the Animation Controls
     */
    var hideControls = function () {
        $("animation-controls").style.display = "none";
    };

    /**
     * Shows the Animation Controls
     */
    var showControls = function () {
        $("animation-controls").style.removeProperty("display");
    };
    var dragging = false, // Whether or not the user is dragging the playback meter
        startX = 0; // The start of the drag, if the user is dragging

    /**
     * Generates the controls for the Animation inside whatever element has the id 'animation-controls-container'
     *
     * @param animation Animation that will be controlled
     *
     * @return new Controls object
     */
    var controls = function (animation) {
        this.animation = animation;
        var element = $("animation-controls-container");
        var newEl = "<div id=\"animation-controls\" style=\"display: none; \">" +
                        "<div id=\"animation-time-holder\">" +
                            "<span id=\"animation-time\">0:00</span></div>" +
                        "<div class=\"animation-control\" id=\"animation-toggle\"><span>&nbsp;</span></div>" +
                        "<div class=\"animation-control\" id=\"animation-stop\"><span>&nbsp;</span></div>" +
                        "<div class=\"animation-control\" id=\"animation-back15\"><span>&nbsp;</span></div>" +
                        "<div id=\"animation-meter\">" +
                            "<span id=\"animation-marker\" style=\"left: -3px; \" >&nbsp;</span>" +
                    "</div></div>";
        element.innerHTML += newEl;
        element.parentElement.onmouseover = function () {
            showControls();
            timer = window.setTimeout(hideControls, 3000);
        };
        element.parentElement.onmousemove = function () {
            showControls();
            if (timer) {
                window.clearTimeout(timer);
            }
            timer = window.setTimeout(hideControls, 3000);
        };
        element.onmouseout = function () {
            hideControls();
        };
        $("animation-controls-container").onmouseover = function (e) {
            showControls();
            if (timer) {
                window.clearTimeout(timer);
            }
            e.stopPropagation();
        };
        $("animation-controls-container").onmousemove = function (e) {
            e.stopPropagation();
        };
        $("animation-toggle").onclick = function () {
            animation.togglePlay();
        };
        $("animation-stop").onclick = function () {
            animation.stop();
        };
        $("animation-back15").onclick = function () {
            animation.back15();
        };
        $("animation-marker").onmousedown = function (e) {
            if (e.button === 0) {
                dragging = true;
                startX = e.clientX;
            }
        };
        $("animation-meter").onmousemove = function (e) {
            if (dragging) {
                var el = $("animation-marker");
                var oldVal = (el.style.left === undefined) ? 0 : Number(el.style.left.split("p")[0]);
                var leftVal = oldVal + (e.clientX - startX);
                if (leftVal > 372) {
                    leftVal = 372;
                }
                if (leftVal < -3) {
                    leftVal = -3;
                }
                el.style.left = leftVal + "px";
                startX = e.clientX;
                el = null;
            }
        };
        $("animation-meter").onmouseup = function (e) {
            if (e.button === 0) {
                var el = $("animation-marker"), leftVal;
                if (e.target.id == "animation-meter") {
                    if (e.offsetX === undefined) {
                        leftVal = e.layerX - $("animation-meter").offsetLeft - 8;
                    } else {
                        leftVal = e.offsetX - 3;
                    }
                    if (leftVal > 372) {
                        leftVal = 372;
                    }
                    if (leftVal < -3) {
                        leftVal = -3;
                    }
                    el.style.left = leftVal + "px";
                    startX = e.clientX;
                } else {
                    leftVal = (el.style.left === undefined) ? 0 : Number(el.style.left.split("p")[0]);
                }
                var prct = (leftVal + 3) / 375;
                var time = animation.lastframe * prct;
                el = null;
                dragging = false;
                animation.setTime(time);
            }
        };
        animation.onstep = this.step;
        animation.onstatus = this.state;
    };

    /**
     * Updates the playback meter
     *
     * @param time The time of the animation
     * @param total The length of the animation
     */
    controls.prototype.step = function (time, total) {
        var prct = time/total,
            time_in_seconds = time/1000,
            text = Math.floor(time_in_seconds/60) + ":",
            secs = String(Math.floor(time_in_seconds%60));
        text += (secs.length == 1) ? "0" : "";
        $("animation-time").innerHTML = text+secs;
        if (!dragging) {
            $("animation-marker").style.left = (prct*375 - 3) + "px";
        }
    };

    /**
     * Sets the the play toggle button to reflect the state of the animation
     *
     * @param state The new state for the play toggle button, either "play", "ready", or "pause"
     */
    controls.prototype.state = function (state) {
        $("animation-toggle").className = "animation-control "+state;
    };
    
    window.AnimationScene = AnimationScene;
    
    window.CartoonAnimation = animation;
})( window );