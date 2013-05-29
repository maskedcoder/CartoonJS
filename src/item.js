(function (global) {
	var objects = 0;
	var init = function (a) {
		return new item(a);
	};
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
		this.rotation = 0
		this.originX = 0;
		this.originY = 0;
		this.reverse = false;
		this.closePath = false;
		this.visible = true;
		this.x = 0;
		this.y = 0;
		this.scale = 1;
		this.parent = null;
		this.name = name || "object_"+objects;
		this.bones = {};
		this.boneMatrices = {};
		this.buildingBone = false;
		this.paths = [[]];
		this.currentPath = 0;
		this.pathAttrs = {"0":{}};
		objects++;
	}
	item.prototype.setParent = function (p) {
		if (!(p instanceof item) && (p !== null)) {
			return false;
		}
		this.parent = p;
		return true;
	};
	item.prototype.addBone = function (bone) {
		var name = bone.name;
		if (this.bones[name] === undefined) {
			this.bones[name] = [];
			this.boneMatrices[name] = bone;
		}
		return this;
	};
	item.prototype.setBoneSegments = function (bonename, segmentlist) {
		if (typeof(bonename) != "string") {
			bonename = bonename.name;
		}
		if (this.bones[bonename] === undefined) {
			return false;
		}
		this.bones[bonename] = segmentlist;
		return this;
	};
	item.prototype.beginBone = function (bone) {
		var name = bone.name;
		if (this.bones[name] === undefined) {
			this.bones[name] = [];
			this.boneMatrices[name] = bone;
		}
		this.buildingBone = name;
		return this;
	};
	item.prototype.endBone = function () {
		this.buildingBone = false;
		return this;
	};
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
		for ( ;j < jlength;j++) {
			pth = paths[j];
			inc = 0;
			length = pth.length;
			
			for (var name in pathAttrs[j]) {
				scene[name] = pathAttrs[j][name];
			}
			
			scene.beginPath();
			for ( ;inc < length;inc++) {
				i = pth[inc];
				currentPoint = path[i];
				switch (currentPoint.type) {
					case "line":
						scene.lineTo(currentPoint.x,
							currentPoint.y);
						break;
					case "bezierCurve":
						control1 = path[i+1];
						control2 = path[i+2];
						inc += 2;
						scene.bezierCurveTo(control1.x,
							control1.y,
							control2.x,
							control2.y,
							currentPoint.x,
							currentPoint.y);
						break;
					case "quadraticCurve":
						control1 = path[i+1];
						inc++;
						scene.quadraticCurveTo(control1.x,
							control1.y,
							currentPoint.x,
							currentPoint.y);
						break;
					case "arc":
						control1 = path[i+1];
						inc++;
						scene.arcTo(currentPoint.x,
							currentPoint.y,
							control1.x,
							control1.y,
							currentPoint.radius);
						break;
					case "move":
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
		for ( ;mindex > -1;mindex--) {
			currentMatrix = matrices[mindex];
			originx = currentMatrix.originX; //These will be in local coordinates
			originy = currentMatrix.originY;
			cx = currentMatrix.x; //These will be in parent's coordinates
			cy = currentMatrix.y;
			scale = currentMatrix.scale;
			rotation = currentMatrix.rotation;
			sign = (currentMatrix.reverse) ? -1 : 1;
			
			ctext.translate(cx + originx, cy + originy);
			ctext.rotate(rotation*(pi/180));
			ctext.scale(sign*scale, scale);
		}
	};
	item.prototype.getGlobalPath = function () {
		// getGlobal only transforms the scene context
		// getGlobalPath transorms (a copy of) the path itself.
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
			for ( ;bindex < blength;bindex++) {
				currentBone = bones[bindex];
				originx = currentBone.originX;
				originy = currentBone.originY;
				cx = currentBone.x;
				cy = currentBone.y;
				scale = currentBone.scale;
				rotation = currentBone.rotation;
				olength = this.bones[name].length;
				for (i = 0;i < olength;i++) {
					index = this.bones[name][i]
					point = path[index];
					newPoint = {"type":point.type,"radius":point.radius}
					
					x = point.x - originx;
					y = point.y - originy;
					
					magnitude = sqrt(x*x + y*y)*scale;
					radius = (atan2(y, x) * (180/pi) + rotation) * (pi/180);
					newPoint.x = magnitude * cos(radius) + cx + originx;
					newPoint.y = magnitude * sin(radius) + cy + originy;
					
					path[index] = newPoint;
				}
			}
		}
		currentBone = null;
		var mindex = 0,
			mlength = matrices.length;
		for ( ;mindex < mlength;mindex++) {
			currentMatrix = matrices[mindex];
			originx = currentMatrix.originX;
			originy = currentMatrix.originY;
			cx = currentMatrix.x;
			cy = currentMatrix.y;
			scale = currentMatrix.scale;
			rotation = currentMatrix.rotation;
			reverse = (currentMatrix.reverse) ? -1 : 1;
			gPath = [];
			for (i = 0;i < length;i++) {
				point = path[i];
				newPoint = {"type":point.type,"radius":point.radius}
				
				x = (point.x - originx)*reverse;
				y = point.y - originy;
				
				magnitude = sqrt(x*x + y*y)*scale;
				radius = (atan2(y, x) * (180/pi) + rotation) * (pi/180);
				newPoint.x = magnitude * cos(radius) + cx;
				newPoint.y = magnitude * sin(radius) + cy;
				
				gPath.push(newPoint);
			}
			path = gPath;
		}
		currentMatrix = null;
		if (gPath.length == 0) {
			console.log(gPath, path, this.name, this);
		}
		return gPath;
	};
	item.prototype.getPath = function () {
		return this.path;
	};
	item.prototype.setPath = function (path) {
		this.path = path;
		return this;
	};
	item.prototype.bezierCurveTo = function (x, y, cx1, cy1, cx2, cy2) {
		this.path.push({"type": "bezierCurve", "x": x, "y": y});
		this.path.push({"type": "control1", "x": cx1, "y": cy1});
		var nLength = this.path.push({"type": "control2", "x": cx2, "y": cy2});
		if (this.buildingBone) {
			this.bones[this.buildingBone] = this.bones[this.buildingBone].concat([nLength-3, nLength-2, nLength-1]);
		};
		this.paths[this.currentPath] = this.paths[this.currentPath].concat([nLength-3, nLength-2, nLength-1]);
		return this;
	};
	item.prototype.quadraticCurveTo = function (x, y, cpx, cpy) {
		this.path.push({"type": "quadraticCurve", "x": x, "y": y});
		var nLength = this.path.push({"type": "control1", "x": cpx, "y": cpy});
		if (this.buildingBone) {
			this.bones[this.buildingBone] = this.bones[this.buildingBone].concat([nLength-2, nLength-1]);
		};
		this.paths[this.currentPath] = this.paths[this.currentPath].concat([nLength-2, nLength-1]);
		return this;
	};
	item.prototype.arcTo = function (x, y, x2, y2, radius) {
		this.path.push({"type": "arc", "x": x, "y": y, "radius": radius});
		var nLength = this.path.push({"type": "control1", "x": x2, "y": y2});
		if (this.buildingBone) {
			this.bones[this.buildingBone] = this.bones[this.buildingBone].concat([nLength-2, nLength-1]);
		};
		this.paths[this.currentPath] = this.paths[this.currentPath].concat([nLength-2, nLength-1]);
		return this;
	};
	item.prototype.lineTo = function (x, y) {
		var nLength = this.path.push({"type": "line", "x": x, "y": y});
		if (this.buildingBone) {
			this.bones[this.buildingBone].push(nLength-1);
		};
		this.paths[this.currentPath].push(nLength-1);
		return this;
	};
	item.prototype.moveTo = function (x, y) {
		var nLength = this.path.push({"type": "move", "x": x, "y": y});
		if (this.buildingBone) {
			this.bones[this.buildingBone].push(nLength-1);
		};
		this.paths[this.currentPath].push(nLength-1);
		return this;
	};
	item.prototype.endPath = function () {
		this.currentPath++;
		this.pathAttrs[this.currentPath] = {};
		this.paths.push([]);
		return this;
	};
	item.prototype.fillFor = function (value) {
		this.pathAttrs[this.currentPath]["fillStyle"] = value;
		return this;
	};
	item.prototype.strokeFor = function (value) {
		this.pathAttrs[this.currentPath]["strokeStyle"] = value;
		return this;
	};
	item.prototype.lineWidthFor = function (value) {
		this.pathAttrs[this.currentPath]["lineWidth"] = value;
		return this;
	};
	item.prototype.attr = function (name, value) {
		if (typeof(name) == "object") {
			var success = true;
			for (var n in name) {
				success = success && this.attr(n, name[n]);
			}
			return success;
		} else {
			if (value == undefined) {
				if (this.attrs[name] == undefined) {
					if (["x", "y", "rotation", "scale", "path", "reverse", "closePath", "visible"].indexOf(name) == -1) {
						return false;
					}
					return this[name];
				}
				return this.attrs[name];
			} else {
				if (this.attrs[name] == undefined) {
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
	global.CartoonItem = init;
	
	// Matrix
	
	var matrices = 0;
	var init = function (n) {
		return new matrix(n);
	};
	var matrix = function (name) {
		this.originX = 0;
		this.originY = 0;
		this.x = 0;
		this.y = 0;
		this.rotation = 0;
		this.scale = 1;
		this.matrix = null;
		this.name = name || "matrix_"+matrices;
		matrices++;
	};
	matrix.prototype.setMatrix = function (other) {
		if (other == this || (!(other instanceof matrix) && (other !== null))) {
			return false;
		}
		this.matrix = other;
		return true;
	};
	matrix.prototype.draw = function () {
		return;
	};
	matrix.prototype.attr = function (name, value) {
		if (typeof(name) == "object") {
			var success = true,
				n = null;
			for (n in name) {
				success = success && this.attr(n, name[n]);
			}
			return success;
		} else {
			if (value == undefined) {
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
	global.Matrix = init;
})(this);