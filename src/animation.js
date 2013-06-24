(function (global) {
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
		for (var time in this.scenes) {
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

    /**
     * Updates the playback meter
     *
     * @param time The time of the animation
     * @param total The length of the animation
     */
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

    /**
     * Sets the the play toggle button to reflect the state of the animation
     *
     * @param state The new state for the play toggle button, either "play", "ready", or "pause"
     */
	controls.prototype.state = function (state) {
		$("animation-toggle").className = "animation-control "+state;
	};
	
	global.AnimationScene = AnimationScene;
	
	global.CartoonAnimation = animation;
})(this);