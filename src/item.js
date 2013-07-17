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
        this._path = [];
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
        return [].concat(this._path);
    };

    /**
     * Sets the CartoonPathItem's list of vertices to the given list
     *
     * @param path New list of vertices
     *
     * @return This CartoonPathItem
     */
    CartoonPathItem.prototype.setPath = function (path) {
        this._path = path;
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
        this._path.push({ "type": "bezierCurve", "x": x, "y": y });
        this._path.push({ "type": "control1", "x": cx1, "y": cy1 });
        var nLength = this._path.push({ "type": "control2", "x": cx2, "y": cy2 });
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
        this._path.push({ "type": "quadraticCurve", "x": x, "y": y });
        var nLength = this._path.push({ "type": "control1", "x": cpx, "y": cpy });
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
        this._path.push({ "type": "arc", "x": x, "y": y, "radius": radius });
        var nLength = this._path.push({ "type": "control1", "x": x2, "y": y2 });
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
        var nLength = this._path.push({ "type": "line", "x": x, "y": y });
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
        var nLength = this._path.push({ "type": "move", "x": x, "y": y });
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