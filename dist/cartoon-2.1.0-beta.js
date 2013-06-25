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
        obj.setParent(null); // Remove reference to any other objects
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
     * Creates a new CartoonItem
     *
     * @param name The name for the new CartoonItem (optional)
     *
     * @return CartoonItem object
     */
    /*var init = function (name) {
        return new item(name);
    };*/

    /**
     * CartoonItem initializer
     *
     * @param name The name for the new CartoonItem (optional)
     *
     * @return new CartoonItem object
     */
    var item = function (name) {
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
        this.rotation = 0;
        this.originX = 0;
        this.originY = 0;
        this.reverse = false;
        this.closePath = false;
        this.visible = true;
        this.x = 0;
        this.y = 0;
        this.scale = 1;
        this.parent = null;
        this.name = name || "object_" + objects;
        this.bones = {};
        this.boneMatrices = {};
        this.buildingBone = false;
        this.paths = [[]];
        this.currentPath = 0;
        this.pathAttrs = { "0": {} };
        objects++;
    };

    /**
     * Sets the CartoonItem's parent to the given CartoonItem
     *
     * @param p CartoonItem to be parent
     *
     * @return Bool success
     */
    item.prototype.setParent = function (p) {
        if (!(p instanceof item) && (p !== null)) {
            return false;
        }
        this.parent = p;
        return true;
    };

    /**
     * Adds a Matrix to the CartoonItem's list of Matrices. Each Matrix can be used to manipulate a number of vertices
     *
     * @param bone Matrix object
     *
     * @return This CartoonItem
     */
    item.prototype.addBone = function (bone) {
        var name = bone.name;
        if (this.bones[name] === undefined) {
            this.bones[name] = [];
            this.boneMatrices[name] = bone;
        }
        return this;
    };

    /**
     * Sets the vertices that a given Matrix may manipulate
     *
     * @param bonename A Matrix object or name of a Matrix object in this CartoonItem's list of bones
     * @param segmentlist A list of vertices
     *
     * @return This CartoonItem or false if there was an error
     */
    item.prototype.setBoneSegments = function (bonename, segmentlist) {
        if (typeof (bonename) != "string") {
            bonename = bonename.name;
        }
        if (this.bones[bonename] === undefined) {
            return false;
        }
        this.bones[bonename] = segmentlist;
        return this;
    };

    /**
     * Sets the given Matrix to automatically adopt all future vertices until CartoonItem.endBone() is called.
     * If the Matrix object given is not in this CartoonItem's list of bones, it will be added
     *
     * @param bone A Matrix object
     *
     * @return This CartoonItem
     */
    item.prototype.beginBone = function (bone) {
        var name = bone.name;
        if (this.bones[name] === undefined) {
            this.bones[name] = [];
            this.boneMatrices[name] = bone;
        }
        this.buildingBone = name;
        return this;
    };

    /**
     * Tells the CartoonItem to stop giving the current Matrix power over new vertices
     *
     * @return This CartoonItem
     */
    item.prototype.endBone = function () {
        this.buildingBone = false;
        return this;
    };

    /**
     * Draws the CartoonItem
     */
    item.prototype.draw = function (scene) {
        for (var name in this.attrs) {
            scene[name] = this.attrs[name];
        }
        var path = this.getGlobalPath(),
            paths = this.paths,
            j = 0,
            jlength = paths.length,
            currentPoint = null,
            control1 = null,
            control2 = null,
            pathAttrs = this.pathAttrs;
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
     * Transforms the parent Canvas's Context2d into the CartoonItem's local Matrix
     */
    item.prototype.getGlobal = function () {
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
    };

    /**
     * Recalculates the path into global coordinates
     *
     * @return List of vertices in global coordinates
     */
    item.prototype.getGlobalPath = function () {
        // getGlobal only transforms the scene context
        // getGlobalPath transforms (a copy of) the path itself.
        var path = [].concat(this.getPath()),
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
        var originx, originy, scale, cx, cy, rotation, mirror;
        var pi = Math.PI,
            atan2 = Math.atan2,
            sqrt = Math.sqrt,
            cos = Math.cos,
            sin = Math.sin;

        while (currentMatrix) {
            matrices.push(currentMatrix);
            currentMatrix = currentMatrix.parent;
        }

        for (var name in this.bones) {
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
                olength = this.bones[name].length;
                for (i = 0; i < olength; i++) {
                    index = this.bones[name][i];
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
     * Gets the CartoonItem's list of vertices
     *
     * @return List of vertices
     */
    item.prototype.getPath = function () {
        return this.path;
    };

    /**
     * Sets the CartoonItem's list of vertices to the given list
     *
     * @param path New list of vertices
     *
     * @return This CartoonItem
     */
    item.prototype.setPath = function (path) {
        this.path = path;
        return this;
    };

    /**
     * Adds three vertices describing a bezier curve to the CartoonItem's list of vertices
     *
     * @param x The destination x coordinate
     * @param y The destination y coordinate
     * @param cx1 The x coordinate of the first control point
     * @param cy1 The y coordinate of the first control point
     * @param cx2 The x coordinate of the second control point
     * @param cy2 The y coordinate of the second control point
     *
     * @return This CartoonItem
     */
    item.prototype.bezierCurveTo = function (x, y, cx1, cy1, cx2, cy2) {
        this.path.push({ "type": "bezierCurve", "x": x, "y": y });
        this.path.push({ "type": "control1", "x": cx1, "y": cy1 });
        var nLength = this.path.push({ "type": "control2", "x": cx2, "y": cy2 });
        if (this.buildingBone) {
            this.bones[this.buildingBone] = this.bones[this.buildingBone].concat([nLength - 3, nLength - 2, nLength - 1]);
        }
        this.paths[this.currentPath] = this.paths[this.currentPath].concat([nLength - 3, nLength - 2, nLength - 1]);
        return this;
    };

    /**
     * Adds two vertices describing a quadratic curve to the CartoonItem's list of vertices
     *
     * @param x The destination x coordinate
     * @param y The destination y coordinate
     * @param cx The x coordinate of the control point
     * @param cy The y coordinate of the control point
     *
     * @return This CartoonItem
     */
    item.prototype.quadraticCurveTo = function (x, y, cpx, cpy) {
        this.path.push({ "type": "quadraticCurve", "x": x, "y": y });
        var nLength = this.path.push({ "type": "control1", "x": cpx, "y": cpy });
        if (this.buildingBone) {
            this.bones[this.buildingBone] = this.bones[this.buildingBone].concat([nLength - 2, nLength - 1]);
        }
        this.paths[this.currentPath] = this.paths[this.currentPath].concat([nLength - 2, nLength - 1]);
        return this;
    };

    /**
     * Adds two vertices describing an arc curve to the CartoonItem's list of vertices
     *
     * @param x The destination x coordinate
     * @param y The destination y coordinate
     * @param x2 The x coordinate of a point on the arc
     * @param y2 The y coordinate of a point on the arc
     * @param radius The radius of the arc
     *
     * @return This CartoonItem
     */
    item.prototype.arcTo = function (x, y, x2, y2, radius) {
        this.path.push({ "type": "arc", "x": x, "y": y, "radius": radius });
        var nLength = this.path.push({ "type": "control1", "x": x2, "y": y2 });
        if (this.buildingBone) {
            this.bones[this.buildingBone] = this.bones[this.buildingBone].concat([nLength - 2, nLength - 1]);
        }
        this.paths[this.currentPath] = this.paths[this.currentPath].concat([nLength - 2, nLength - 1]);
        return this;
    };

    /**
     * Adds a vertex describing a line to the CartoonItem's list of vertices
     *
     * @param x The destination x coordinate
     * @param y The destination y coordinate
     *
     * @return This CartoonItem
     */
    item.prototype.lineTo = function (x, y) {
        var nLength = this.path.push({ "type": "line", "x": x, "y": y });
        if (this.buildingBone) {
            this.bones[this.buildingBone].push(nLength - 1);
        }
        this.paths[this.currentPath].push(nLength - 1);
        return this;
    };

    /**
     * Adds a vertex describing a jump to a new point to the CartoonItem's list of vertices
     *
     * @param x The destination x coordinate
     * @param y The destination y coordinate
     *
     * @return This CartoonItem
     */
    item.prototype.moveTo = function (x, y) {
        var nLength = this.path.push({ "type": "move", "x": x, "y": y });
        if (this.buildingBone) {
            this.bones[this.buildingBone].push(nLength - 1);
        }
        this.paths[this.currentPath].push(nLength - 1);
        return this;
    };

    /**
     * Ends the construction of the current path
     *
     * @return This CartoonItem
     */
    item.prototype.endPath = function () {
        this.currentPath++;
        this.pathAttrs[this.currentPath] = {};
        this.paths.push([]);
        return this;
    };

    /**
     * Sets the fill for the current path
     *
     * @param value The new fill style
     *
     * @return This CartoonItem
     */
    item.prototype.fillFor = function (value) {
        this.pathAttrs[this.currentPath].fillStyle = value;
        return this;
    };

    /**
     * Sets the stroke of the current path
     *
     * @param value The new stroke style
     *
     * @return This CartoonItem
     */
    item.prototype.strokeFor = function (value) {
        this.pathAttrs[this.currentPath].strokeStyle = value;
        return this;
    };

    /**
     * Sets the line width of the current path
     *
     * @param value The new line width
     *
     * @return This CartoonItem
     */
    item.prototype.lineWidthFor = function (value) {
        this.pathAttrs[this.currentPath].lineWidth = value;
        return this;
    };

    /**
     * Sets one or more CartoonItem attributes
     * If a name is given but no value, the value of the attribute is returned
     *
     * @param name Name of an CartoonItem attribute or an object describing several attributes
     * @param value The new value for the attribute (optional)
     *
     * @return Bool success
     */
    item.prototype.attr = function (name, value) {
        if (typeof (name) == "object") {
            var success = true;
            for (var n in name) {
                success = success && this.attr(n, name[n]);
            }
            return success;
        } else {
            if (value === undefined) {
                if (this.attrs[name] === undefined) {
                    if (["x", "y", "rotation", "scale", "path", "reverse", "closePath", "visible"].indexOf(name) == -1) {
                        return false;
                    }
                    return this[name];
                }
                return this.attrs[name];
            } else {
                if (this.attrs[name] === undefined) {
                    if (["x", "y", "rotation", "scale", "path", "reverse", "closePath", "visible"].indexOf(name) == -1) {
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
    window.CartoonItem = item;

    // Matrix

    // Tally of matrices to generate id's
    var matrices = 0;

    /**
     * Creates a new Matrix with the given name
     *
     * @param name Name for the new Matrix (optional)
     *
     * @return The new Matrix object
     */
    /*var matrix_init = function (name) {
        return new matrix(name);
    };*/

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
     * Creates a new Animation
     *
     * @param element An element to contain the controls (optional)
     *
     * @return The new Animation
     */
    /*var init = function (element) {
        return new animation(element);
    };*/

    /**
     * Animation initializer
     *
     * @param element An element to contain the controls (optional)
     *
     * @return The new Animation
     */
    var animation = function (element) {
        
        this.time = 0;
        this.status = "ready";
        this.onstep = false;
        this.onstatus = false;
        this.scenes = {}; // scene open time -> scene
        this.sceneChanges = []; // reverse order list of scene change times
        this.lastframe = 0;
        this.audio = null;
        
        if (element) {
            this.createControls(element);
        }
    };

    /**
     * Creates the controls for the animation
     *
     * @param element An element to contain the controls
     *
     * @return New Controls object
     */
    animation.prototype.createControls = function (element) {
        return new controls(this, element);
    };
    
    /**
     * Gets a given CartoonItem's transformation for a given time
     *
     * @param item CartoonItem
     * @param time Number
     */
    animation.prototype.itemTransformForTime = function (item, time) {
        var t = null,
            attr = {},
            name = null,
            frame = null;
        for (t in this.timeline) {
            frame = this.timeline[t];
            if (frame[name] !== undefined) {
                for (name in frame[name]) {
                    attr[name] = frame[name];
                }
            }
            if (time == t) {
                break;
            }
        }
        return attr;
    };
    
    /**
     * Adds a key frame, wherein the item has a specific value for a specific value at the specific time
     *
     * @param item CartoonItem or name of a CartoonItem
     * @param time Time during the animation
     * @param attr Name of a CartoonItem attribute
     * @param val The value for that attribute
     */
    animation.prototype.addKeyFrame = function (item, time, attr, val) {
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
        if (this.timeline[item] === undefined) {
            this.timeline[item] = {};
        }
        if (this.timeline[item][attr] === undefined) {
            this.timeline[item][attr] = {
                "keys": []
            };
        }
        this.timeline[item][attr][time] = val;
        if (this.timeline[item][attr].keys.indexOf(time) == -1) {
            this.timeline[item][attr].keys.push(time);
        }
        if (this.timeline[item][attr][0] === undefined) {
            this.timeline[item][attr][0] = this.scene.getItem(item).attr(attr);
            this.timeline[item][attr].keys.push(0);
        }
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
        this.stepAnimation();
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
        this.stepAnimation(true);
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
        this.stepAnimation();
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
        this.stepAnimation(true);
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
        this.stepAnimation(true);
    };

    /**
     * Draws the frame for the current time and schedules itself to be called again if the animation isn't finished
     * If a value is given for update, the current time is recalculated, but the function will not ask to be called again
     *
     * @param update Bool
     */
    animation.prototype.stepAnimation = function(update) {
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
            currentScene.show();
            if (this.sceneChanges.indexOf(scenetime)+1 < this.sceneChanges.length) {
                this.scenes[this.sceneChanges[this.sceneChanges.indexOf(scenetime)+1]].hide();
            }
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
                    anim.stepAnimation();
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
            case "stroke":
            case "fill":
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
        this.timeline = {};
        this.immediateTimeline = {};
        this.subAnimations = [];
        this.lastframe = -1;
        this.drawnYet = false;
        this.hidden = false;
        this.MYLASTFRAME = -1;
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
        this.drawnYet = true;
        var i = 0,
            anims = this.subAnimations,
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
        for (kframe in this.immediateTimeline) {
            klist.push(kframe);
            if ((this.MYLASTFRAME < kframe && time >= kframe) || (time < this.MYLASTFRAME && time == kframe)) {
                items = this.immediateTimeline[kframe];
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
                    items = this.immediateTimeline[kframe];
                    for (item in items) {
                        this.scene.getItem(item).attr(items[item]);
                    }
                } else {
                    break;
                }
            }
        }
        this.MYLASTFRAME = time;
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
        if (this.timeline[item] === undefined) {
            this.timeline[item] = {};
        }
        if (this.timeline[item][attr] === undefined) {
            this.timeline[item][attr] = {
                "keys": []
            };
        }
        this.timeline[item][attr][time] = val;
        if (this.timeline[item][attr].keys.indexOf(time) == -1) {
            this.timeline[item][attr].keys.push(time);
        }
        if (this.timeline[item][attr][0] === undefined) {
            this.timeline[item][attr][0] = this.scene.getItem(item).attr(attr);
            this.timeline[item][attr].keys.push(0);
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
        if (typeof(item) != "string") {
            item = item.name;
        }
        
        if (this.immediateTimeline[time] === undefined) {
            this.immediateTimeline[time] = {};
        }
        if (this.immediateTimeline[time][item] === undefined) {
            this.immediateTimeline[time][item] = {
            };
        }
        this.immediateTimeline[time][item][attr] = val;
    };

    /**
     * Prepares the AnimationScene for playing by reorganizing the timeline
     */
    AnimationScene.prototype.compile = function () {
        var sort = function (a, b) { return a - b; };
        this.MYLASTFRAME = -1;
        this.drawnYet = false;
        if (this.subAnimations.length === 0) {
            var item, time, attr, keyIncr, numKeys,
                itemName, timeName, attrName, prevTime;
            for (itemName in this.timeline) {
                item = this.timeline[itemName];
                for (attrName in item) {
                    attr = item[attrName];
                    attr.keys.sort(sort);
                    for (keyIncr = 0, numKeys = attr.keys.length; keyIncr < numKeys; keyIncr++) {
                        timeName = attr.keys[keyIncr];
                        if (keyIncr > 0) {
                            prevTime = attr.keys[keyIncr - 1];
                            this.subAnimations.push(
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
     * Generates the controls for the Animation, inside the element
     *
     * @param animation Animation that will be controlled
     * @param element An HTML Element or its id, that the controls will be placed in
     *
     * @return new Controls object
     */
    var controls = function (animation, element) {
        this.animation = animation;
        if (typeof(element) == "string") {
            element = $(element);
        }
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
        element.onmouseover = function () {
            showControls();
            timer = window.setTimeout(hideControls, 3000);
        };
        element.onmousemove = function () {
            showControls();
            if (timer) {
                window.clearTimeout(timer);
            }
            timer = window.setTimeout(hideControls, 3000);
        };
        element.onmouseout = function () {
            hideControls();
        };
        $("animation-controls").onmouseover = function (e) {
            showControls();
            if (timer) {
                window.clearTimeout(timer);
            }
            e.stopPropagation();
        };
        $("animation-controls").onmousemove = function (e) {
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
        time = time/1000;
        var prct = time/total,
            text = Math.floor(time/60) + ":",
            secs = String(Math.floor(time%60));
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