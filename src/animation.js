(function (global) {
	var LASTFRAME = 0,
		DEBUG = false;
	var init = function (a, b, c, d, e) {
		return new animation(a, b, c, d, e);
	};
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
	animation.prototype.createControls = function (element) {
		return new controls(this, element);
	};
	animation.prototype.itemTransformForTime = function (item, time) {
		var t = null,
			attr = {},
			name = null,
			frame = null;
		for (t in this.timeline) {
			frame = this.timeline[t];
			if (frame[name] != undefined) {
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
	animation.prototype.addScene = function (scene, time) {
		this.scenes[time] = scene;
		if (this.sceneChanges.indexOf(time) == -1) {
			this.sceneChanges.push(time);
		}
	};
	animation.prototype.addAudio = function (audio) {
		this.audio = audio;
	};
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
	animation.prototype.stop = function () {
		if (this.status == "ready") {
			this.sceneChanges.sort(function (a, b) {return b - a;});
			for (var time in this.scenes) {
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
		for (var time in this.scenes) {
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
	animation.prototype.pause = function () {
		if (this.audio) {
			this.audio.pause();
		}
		this.status = "paused";
	};
	animation.prototype.resume = function () {
		this.startTime = +new Date() - this.time;
		this.status = "playing";
		if (this.audio) {
			this.audio.play();
		}
		this.stepAnimation();
	};
	animation.prototype.setTime = function (time) {
		this.time = time;
		this.startTime = +new Date() - time;
		if (this.audio) {
			this.audio.currentTime = this.time/1000;
		}
		for (var time in this.scenes) {
			this.scenes[time].hide();
		}
		if (this.status != "playing") {
			this.status = "paused";
		}
		this.stepAnimation(true);
	};
	animation.prototype.back15 = function () {
		this.time = (this.time > 1500) ? this.time - 1500 : 0;
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
	animation.prototype.stepAnimation = function(update) {
		if (update) {
			this.time = +new Date() - this.startTime;
		} else {
			switch (this.status) {
				case "paused":
				case "ready":
					return;
				case "playing":
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
	var subAnimation = function (object, type, attr1, attr2, start, finish) {
		this.object = object;
		this.startState = attr1;
		this.endState = attr2;
		this.begin = start;
		this.end = finish;
		this.update = null;
		this.type = type
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
	subAnimation.prototype.isPlaying = function (time) {
		return (time >= this.begin && time <= this.end);
	};
	subAnimation.prototype.transformForTime = function (time) {
		var prct = (time - this.begin)/(this.end - this.begin);
		this.update(this.object, prct, this.type, this.startState, this.endState);
	};
	
	var standardAlter = function (object, prct, attr, start, end) {
		object.attr(attr, (end - start)*prct + start);
	};
	var alterPath = function (object, prct, attr, start, end) {
		var pathIncr = 0,
			numPathSegments = start.length,
			startSegment = null,
			endSegment = null,
			newSegment = null,
			newPath = [],
			segmentAttr = "",
			startVal = null;
		for ( ;pathIncr < numPathSegments;pathIncr++) {
			startSegment = start[pathIncr];
			endSegment = end[pathIncr];
			newSegment = new Object();
			for (segmentAttr in startSegment) {
				startVal = startSegment[segmentAttr]
				if (isNaN(startVal)) {
					newSegment[segmentAttr] = startVal;
				} else {
					newSegment[segmentAttr] = (endSegment[segmentAttr] - startVal)*prct + startVal;
				}
			}
			newPath.push(newSegment);
		}
		object.attr(attr, newPath);
	};
	var alterColor = function (object, prct, attr, startColor, endColor) {
	};
	
	var asinit = function (s, b) {
		return new AnimationScene(s, b);
	};
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
	AnimationScene.prototype.hide = function () {
		this.scene.canvas.style.display = "none";
		if (this.background) {
			this.background.canvas.style.display = "none";
		}
		this.hidden = true;
	};
	AnimationScene.prototype.show = function () {
		this.scene.canvas.style.removeProperty("display");
		if (this.background) {
			this.background.canvas.style.removeProperty("display");
			this.background.draw();
		}
		this.hidden = false;
	};
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
		for (var kframe in this.immediateTimeline) {
			klist.push(kframe);
			if ((this.MYLASTFRAME < kframe && time >= kframe) || (time < this.MYLASTFRAME && time == kframe)) {
				items = this.immediateTimeline[kframe];
				for (var item in items) {
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
					for (var item in items) {
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
	AnimationScene.prototype.compile = function () {
		this.MYLASTFRAME = -1;
		this.drawnYet = false;
		if (this.subAnimations.length == 0) {
			var item, time, attr, keyIncr, numKeys,
				itemName, timeName, attrName, prevTime;
			for (itemName in this.timeline) {
				item = this.timeline[itemName];
				for (attrName in item) {
					attr = item[attrName];
					attr.keys.sort(function (a, b) {return a-b;});
					for (keyIncr=0,numKeys=attr.keys.length;keyIncr < numKeys;keyIncr++) {
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
	
	var $ = function (id) {
		return document.getElementById(id);
	};
	
	var timer = false;
	var hideControls = function () {
		$("animation-controls").style.display = "none";
	};
	var showControls = function () {
		$("animation-controls").style.removeProperty("display");
	};
	var dragging = false,
		startX = 0;
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
			if (e.button == 0) {
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
			if (e.button == 0) {
				var el = $("animation-marker");
				if (e.target.id == "animation-meter") {
					if (e.offsetX === undefined) {
						var leftVal = e.layerX - $("animation-meter").offsetLeft - 8;
					} else {
						var leftVal = e.offsetX - 3;
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
	controls.prototype.step = function (time, total) {
		var prct = time/total;
		var time = time/1000;
		var text = Math.floor(time/60) + ":";
		var secs = String(Math.floor(time%60));
		text += (secs.length == 1) ? "0" : "";
		$("animation-time").innerHTML = text+secs;
		if (!dragging) {
			$("animation-marker").style.left = (prct*375 - 3) + "px";
		}
	};
	controls.prototype.state = function (state) {
		$("animation-toggle").className = "animation-control "+state;
	};
	
	global.AnimationScene = asinit;
	
	global.CartoonAnimation = init;
})(this);