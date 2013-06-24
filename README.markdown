# CartoonJS

JavaScript + Canvas + Animation = Cartoons!

CartoonJS is an HTML5-based animation framework for building canvas animations

## Example

Here is an example .html file:

    <!DOCTYPE html>
    <html>
        <head>
            <link rel="stylesheet" href="controls.css" />
        </head>
        <body>
            <div id="container"></div>
            <script src="cartoon.js"></script>
            <script src="my_example_cartoon.js"></script>
        </body>
    </html>

The css file only necessary for the default interface.

Here is an example of a simple animation:

    // Create a canvas
    var canvas = new CartoonCanvas("container");

    // Make a square
    var square = new CartoonItem("square")
                    .moveTo(-50,-50)
                    .lineTo(-50,50)
                    .lineTo(50,50)
                    .lineTo(50,-50)
                    .lineTo(-50,-50);
    // Turn the square 45 degrees
    square.rotation = 45;
    // Make the square red with thick lines
    square.attr({
        "fillStyle": "#f00",
        "lineWidth": 3
    });
    // Put the square in the canvas
    canvas.addItem(square);

    // Create the animation
    var animation = new CartoonAnimation();

    // Create a scene for our animation
    var scene = new AnimationScene(canvas);

    // Make the square do a complete rotation in 2 seconds
    scene.addKeyFrame(square, 2000, "rotation", 405);
    // Make the square move to the right 100 pixels
    scene.addKeyFrame(square, 2000, "x", 100);
    

    // Make this scene appear in the animation at the start
    animation.addScene(scene, 0);

    // Send the animation to the beginning
    animation.stop();

## API

### CartoonCanvas

Provides an interface for the HTML5 canvas. Each CartoonCanvas can hold multiple CartoonItems and one Background object.

#### CartoonCanvas Properties

- `background` : The background color or a Background object that will be drawn every refresh
- `canvas` : The canvas element that will be drawn on
- `ctext` : The CanvasRenderingContext2D for the canvas element
- `height` : The height of the canvas
- `items` : A map of all contained CartoonItems by their names
- `width` : The width of the canvas

#### CartoonCanvas Methods

##### CartoonCanvas([element][, width [, height]]) -> new CartoonCanvas

Creates an empty CartoonCanvas.

- `element` : HTML element or an id to select. If the element is not a canvas, a new canvas element will be created and nested inside
-  `width` : (default: `500`) The width of the canvas
- `height` : (default: `300`) The height of the canvas

##### CartoonCanvas.addItem(item) -> null

Puts a CartoonItem in the list of items to draw every refresh.

- `item` : a CartoonItem

##### CartoonCanvas.draw() -> null

Clears the canvas element and draws the background and all child CartoonItems. No changes made to child CartoonItems or the background will be represented until this function is called.

##### CartoonCanvas.getItem(name) -> CartoonItem

Fetches a CartoonItem from the CartoonCanvas's list.

- `name` : (`string`) The name of the CartoonItem to fetch

##### CartoonCanvas.removeItem(name) -> null

Removes a CartoonItem from the CartoonCanvas

- `name` : (`string`) The name of the CartoonItem to remove

### Background

Represents a background canvas. The Background object gets its own canvas to draw on to speed up rendering. Background objects cannot hold children, and do not draw anything by default. In order to use one, you must overwrite the `draw()` function. For example,

    var bg = new Background("container");
    bg.draw = function () {
        // Paints the entire canvas red
        this.ctext.fillStyle = "red";
        this.ctext.fillRect(0, 0, this.width, this.height);
    };

#### Background Properties

- `canvas` : The canvas element that will be drawn on
- `ctext` : The CanvasRenderingContext2D for the canvas element
- `height` : The height of the canvas
- `width` : The width of the canvas

#### Background Methods

##### Background([element][, width [, height]]) -> new Background

Creates an empty Background

- `element` : HTML element or an id to select. If the element is not a canvas, a new canvas element will be created and nested inside
-  `width` : (default: `500`) The width of the canvas
- `height` : (default: `300`) The height of the canvas

##### Background.draw() -> null

Gets called whenever the parent CartoonCanvas is refreshed. By default, this function only prints warning. In order to do anything useful, this method must be overwritten.

### CartoonItem

Represents an object that will be drawn on a canvas. Every CartoonItem controls the actual drawing process. If you're wanting to create a custom object, just overwrite the `draw()` function.

The CartoonItem stores a list of points in the format:

    {
        x: [number],
        y: [number],
        type: [move, arc, curve, quadraticCurve, bezierCurve, line, control1, or control2]
    }

When the draw function is called, the CartoonItem will customize the canvas context's attributes and then run a series of commands to draw a shape.

One CartoonItem can be the parent of another, which means that the parent's location, rotation, or scale change, the child will change equally. For complex animating, a Matrix can be created and given permission to adjust the location, rotation, or scale of specific points in the CartoonItem.

#### CartoonItem Properties

- `attrs` : An object that stores custom drawing data, which will be applied to the canvas rendering context before drawing
- `bones` : An object telling which matrices can act on which points
- `boneMatrices` : An object listing all of the matrices that can act on this CartoonItem
- `buildingBone` : A pointer to the Matrix that is being given control of every new point, or `false` if there is none
- `closePath` : (default: `true`) Whether or not to close the path
- `currentPath` : The index of the sub-path that is currently being created
- `name` : The name of the CartoonItem. Don't reuse names.
- `originX` : (default: `0`) The x component of the point that the CartoonItem will be rotated around
- `originY` : (default: `0`) The y component of the point that the CartoonItem will be rotated around
- `path` : The list of points that will be used to draw the CartoonItem on a canvas
- `paths` : A list of sub-paths
- `pathAttrs` : An object storing deviations from `attrs` for each sub-path
- `parent` : A reference to the parent CartoonItem, if any
- `reverse` : Whether or not to draw the path with left and right swapped
- `rotation` : (default: `0`) The rotation of the CartoonItem
- `scale` : (default: `1`) The scale of the CartoonItem
- `visible` : (default: `true`) Whether or not to draw the CartoonItem
- `x` : (default: `0`) The x position of the CartoonItem
- `y`: (default: `0`) The y position of the CartoonItem

The `attrs` object is used to customize the CanvasRenderingContext2D before drawing. For more information on these attributes, see the [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#Attributes "CanvasRenderingContext2D").

These are the settings controlled by the `attrs` object:

- `fillStyle` : (default: `#000`) Color or style to use inside shapes
- `font` : (default: `Arial`) CSS font
- `globalAlpha` : (default: `1.0`) Controls opacity; values from 0 (invisible) to 1.0 (completely opaque)
- `globalCompositeOperation` : (default: `source-over`) With `globalAlpha` applied this sets how shapes and images are drawn onto the existing bitmap. Options are:
    - `source-atop`
    - `source-in`
    - `source-out`
    - `source-over` (default)
    - `destination-atop`
    - `destination-in`
    - `destination-out`
    - `destination-over`
    - `lighter`
    - `darker`
    - `copy`
    - `xor`
- `lineCap` : (default: `butt`) Type of endings on all the lines. Options are:
    - `butt` (default)
    - `round`
    - `square`
- `lineJoin` : (default: `miter`) Defines the type of corners where two lines meet. Options are:
    - `round`
    - `bevel`
    - `miter` (default)
- `lineWidth` : (default: `1.0`) Width of lines
- `miterLimit` : (default: `10`)
- `shadowBlur` : (default: `0`) Specifies the blurring effect
- `shadowColor` : (default: `rgba(0,0,0,0)`) Color of the shadow
- `shadowOffsetX` : (default: `0`) Horizontal distance the shadow will be offset
- `shadowOffsetY` : (default: `0`) Vertical distance the shadow will be offset
- `strokeStyle` : (default: `#000`) Color or style to use for the lines around shapes
- `textAlign` : (default: `start`) The horizontal alignment to use for text. Options are:
    - `center`
    - `end`
    - `left`
    - `right`
    - `start` (default)
- `textBaseLine` : (default: `alphabetic`) Specifies the vertical baseline for the text. Options are:
    - `alphabetic` (default)
    - `bottom`
    - `hanging`
    - `ideographic`
    - `middle`
    - `top`

#### CartoonItem Methods

##### CartoonItem([name]) -> new CartoonItem

Creates a new CartoonItem identified by `name`. **Warning:** do not reuse names for CartoonItems in the same CartoonCanvas. When a new CartoonItem is added to a CartoonCanvas that has another by that name, the old one will be mysteriously removed, without warning.

- `name` : A string to uniquely identify the CartoonItem

##### CartoonItem.setParent(p) -> bool

Attempts to set `p` as this CartoonItem's parent. A parent item will have indirect control over the location, scale, and rotation of a child CartoonItem. The child's own geometric properties will not reflect any changes to the parent, but before every drawing, the context will be transformed into the parent's local coordinate system before drawing the child.

To make a child independant, run `CartoonItem.setParent(null);`.

- `p` : A CartoonItem to become parent, or null to remove a parent-child relationship

##### CartoonItem.addBone(bone) -> this

Adds `bone` to this CartoonItem's list of matrices. This CartoonItem is returned.

- `bone` : A Matrix object

##### CartoonItem.setBoneSegments(bonename, segmentlist) -> this

Attempts to replace any list of segments that the Matrix identified by `bonename` controls with `segmentlist`. If `bonename` points to a Matrix not in the CartoonItem's list, the function will return false. If the operation succeeds, this CartoonItem is returned.

- `bonename` : A Matrix object or name of a Matrix object in the CartoonItem's list of matrices
- `segmentlist` : A list of indexes of vertices in `CartoonItem.path`

##### CartoonItem.beginBone(bone) -> this

Tells the CartoonItem to assign all new vertices to `bone` until `CartoonItem.endBone()` is called. If the Matrix given is not in the CartoonItem's list of matrices, it will be added. This CartoonItem is returned.

- `bone` : A Matrix object

##### CartoonItem.endBone() -> this

Tells the CartoonItem to stop assigning all new vertices to the Matrix object that was specified in `CartoonItem.beginBone()`. This is not necessary when switching immediately from one Matrix to the next, but it provides some clarity. This CartoonItem is returned/

##### CartoonItem.draw(scene) -> null

Draws the CartoonItem, using the CanvasRenderingContext2D represented by `scene`. First, `scene` is customized with the attributes in `this.attrs`, then the points in the path are calculated in global coordinates (based on adjustments from parent CartoonItems or Matrices in the CartoonItem's list), then the function iterates through the list of commands associated with each point to draw a path on the canvas, and finally the path is filled and stroked. **Warning:** After drawing, the CanvasRenderingContext2D will still carry the custom attributes. If another object is drawn without changing the custom attributes, it will be drawn with those same old custom attributes.

In order to create a custom item for the CartoonCanvas, this method can be overwritten.

- `scene` : A CanvasRenderingContext2D

##### CartoonItem.getGlobal(scene) -> null

Transforms the CanvasRenderingContext2D represented by `scene` into local coordinates. This gives an alternative to manually recalculating all of the points in this CartoonItem's path into global coordinates. Transforming the CanvasRenderingContext2D is generally a slower way, so it is not recommended.

- `scene` : A CanvasRenderingContext2D

##### CartoonItem.getGlobalPath() -> Array

Calculates the position of all the points in this CartoonItem's path in global coordinates, based on any parent items and any Matrix objects that have control of vertices. The recalculated path is returned.

##### CartoonItem.getPath() -> Array

Returns the list of point that make up this CartoonItem's path.

##### CartoonItem.bezierCurveTo(x, y, cx1, cy1, cx2, cy2) -> this

Adds three points to the CartoonItem's path which describe a [bezierCurveTo](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#bezierCurveTo%28%29) command. This CartoonItem is returned.

- `x`: The x coordinate of the destination of the curve
- `y` : The y coordinate of the destination of the curve
- `cx1` : The x coordinate of the first control point
- `cy1` : The y coordinate of the first control point
- `cx2` : The x coordinate of the second control point
- `cy2` : The y coordinate of the second control point

##### CartoonItem.quadraticCurveTo(x, y, cx, cy) -> this

Adds two points to the CartoonItem's path which describe a [quadraticCurveTo](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#quadraticCurveTo%28%29). This CartoonItem is returned.

- `x` : The x coordinate of the destination of the curve
- `y` : The y coordinate of the destination of the curve
- `cx` : The x coordinate of the control point
- `cy` : The y coordinate of the control point

##### CartoonItem.arcTo(x, y, x2, y2, radius) -> this

Adds two points to the CartoonItem's path which describe an [arcTo](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#arcTo%28%29). For a more in-depth explanation of how arcTo commands work, see [DBP-Consulting](http://www.dbp-consulting.com/tutorials/canvas/CanvasArcTo.html). This CartoonItem is returned.

- `x` : The x coordinate of the destination of the curve
- `y` : The y coordinate of the destination of the curve
- `x2` : The x coordinate of the control point
- `y2` : The y coordinate of the control point
- `radius` The radius of the arc

##### CartoonItem.lineTo(x, y) -> this

Adds a point to the CartoonItem's path which describes a [lineTo](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#lineTo%28%29). This CartoonItem is returned.

- `x` : The x coordinate of the destination
- `y` : The y coordinate of the destination

##### CartoonItem.moveTo(x, y) -> this

Adds a point to the CartoonItem's path which describes a [moveTo](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#moveTo%28%29). This CartoonItem is returned.

- `x` : The x coordinate of the destination
- `y` : The y coordinate of the destination

##### CartoonItem.endPath() -> this

Ends the construction of the current subpath and prepares to begin constructing on a new one. This CartoonItem is returned.

##### CartoonItem.fillFor(color) -> this

Sets the background for the current subpath. This CartoonItem is returned.

- `color` : A valid CSS color

##### CartoonItem.strokeFor(value) -> this

Sets the stroke style for the current subpath. This CartoonItem is returned.

- `value` : A valid CSS color

##### CartoonItem.setLineWidthFor(value) -> this

Sets the line width for the current subpath. This CartoonItem is returned.

- `value` : The new line width

##### CartoonItem.attr(object) -> bool
##### CartoonItem.attr(name, value) -> bool
##### CartoonItem.attr(name) -> value

Gets or sets the CartoonItem's attributes. If an object is given, the keys and values will be fed into this function, and return true if all were successful. If a name and value are given, the function will attempt to match the name up to an attribute and set it, returning true for success and false for failure. If just a name is given, the corresponding value for the attribute by that name will be returned, or false if there is no such attribute.

The attributes availible for getting or setting are `x`, `y`, `rotation`, `scale`, `path`, `reverse`, `closePath`, `visible`, and anything in `this.attrs`.

- `object` : An object with key/value pairs corresponding to this CartoonItem's attributes.
- `name` : The name of an attribute
- `value` : The new value for an attribute

### Matrix

Represents an invisible object which can be used to control CartoonItems or even the vertices that make up a CartoonItem.

#### Matrix Properties

- `matrix` : (default: `null`) The parent Matrix, if there is any
- `name` : The name the Matrix is identified by
- `originX` : (default: `0`) The x component for the point that this Matrix may be rotated around
- `originY` : (default: `0`) The y component for the point that this Matrix may be rotated around
- `rotation` : (default: `0`) The rotation of the Matrix
- `scale` : (default: `1`) The scale of the Matrix
- `x` : (default: `0`) The horizontal position of the Matrix
- `y`: (default: `0`) The vertical position of the Matrix

#### Matrix Methods

##### Matrix([name]) -> new Matrix object

Creates a new Matrix, identified by `name`. **Warning:** A Matrix's name can interfere with CartoonItem names, if it is added to a CartoonScene, so it would be best to name it something unique.

- `name` : The a string that uniquely identifies the Matrix

##### Matrix.setMatrix(other) -> bool

Sets the `other` as this Matrix's parent, with indirect control over location, rotation, and scale. To remove a parent from control, run `Matrix.setMatrix(null);`. Returns true if the operation was successful.

- `other` : A Matrix object

##### Matrix.draw() -> null

Pretends to draw the Matrix. Nothing happens by default, because Matrices are supposed to be the invisible workers that manipulate CartoonItems into performing their maniacal whims.

##### Matrix.attr(object) -> bool
##### Matrix.attr(name, value) -> bool
##### Matrix.attr(name) -> value

Gets or sets the Matrix's attributes. If an object is given, the keys and values will be fed into this function, and return true if all were successful. If a name and value are given, the function will attempt to match the name up to an attribute and set it, returning true for success and false for failure. If just a name is given, the corresponding value for the attribute by that name will be returned, or false if there is no such attribute.

The attributes availible for getting or setting are `x`, `y`, `rotation`, `scale`.

- `object` : An object with key/value pairs corresponding to this Matrix's attributes.
- `name` : The name of an attribute
- `value` : The new value for an attribute

### Group

Represents a collection of CartoonItems which can be animated together.

#### Group Properties

- `name` : A string that uniquely identifies the Group
- `objects` : A list of CartoonItems that are members of the Group
- `rotation` : A value to add to the rotation each of the CartoonItems
- `scale` : A value to add to the scale each of the CartoonItems
- `scene` : The CartoonScene that the CartoonItems belong to
- `x` : A value to add to the horizontal position each of the CartoonItems
- `y` : A value to add to the vertical position each of the CartoonItems

#### Group Methods

##### Group(scene) -> new Group object

Creates a Group that will contain objects to be drawn using the CanvasRenderingContext2D `scene`.

- `scene` : A CanvasRenderingContext2D to use for drawing objects

##### Group.addItem(item) -> null

Adds a CartoonItem to the Group.

- `item` : A CartoonItem

##### Group.draw([scene]) -> null

Draws all of the CartoonItems in the Group, using the CanvasRenderingContext2D supplied, or the one stored in `this.scene` if no context is given.

- `scene` : A CanvasRenderingContext2D to draw the CartoonItems on

##### Group.attr(object) -> bool
##### Group.attr(name, value) -> bool
##### Group.attr(name) -> value

Gets or sets the Group's attributes. If an object is given, the keys and values will be fed into this function, and return true if all were successful. If a name and value are given, the function will attempt to match the name up to an attribute and set it, returning true for success and false for failure. If just a name is given, the corresponding value for the attribute by that name will be returned, or false if there is no such attribute.

The attributes availible for getting or setting are `x`, `y`, `rotation`, `scale`.

- `object` : An object with key/value pairs corresponding to this Group's attributes.
- `name` : The name of an attribute
- `value` : The new value for an attribute

### Animation

Provides an interface for creating and playing an animation.

#### Animation Properties

- `time` : The number of milliseconds after the beginning of the animation
- `status` : A string telling the status of the animation. Changing the value of this property will tell the Animation what to do the next tick. Possible values:
    - `ready`
    - `playing`
    - `paused`

  Other values will be interpreted as `playing`
- `onstep` : May contain a callback to be called at the start of every step in the Animation
- `onstatus` : May contain a callback to be called whenever the status of the Animation changes
- `scenes` : An object containing all the AnimationScenes that are in the Animation, with the time each AnimationScene begins as the key
- `sceneChanges` : A reverse-order array of scene change times
- `lastframe` : The time after which the Animation will stop playing. This means that the final frame may be several milliseconds after this time. Normally, this value will be calculated automatically.
- `audio` : An audio element, if given, to play during the Animation. Things work out best if the duration of the soundtrack is equal to that of the Animation

#### Animation Methods

##### Animation([element]) -> new Animation object

Creates a new animation. If `element` is set, the controls for the animation will be placed inside it. Otherwise, controls will have to be implemented by hand.

- `element` : An HTML element or a string representing an element id

##### Animation.createControls(element) -> new Controls object

Builds the controls for the animation inside the element specified.

- `element` : An HTML element or a string representing an element id

##### Animation.itemTransformForTime(item, time) -> object

Gets the values for all of the animated properties of the given CartoonItem at the given time. The values are returned inside an object.

- `item` : A CartoonItem
- `time` : A valid time during the animation

##### Animation.addKeyFrame(item, time, attr, val) -> null

Adds a key frame to `this.timeline` wherein the given CartoonItem has the attribute `attr` equal to the value `val` at the given time. If the value for `time` is after the end of the animation, it will be changed to the time of the final frame. If the value for the attribute of the CartoonItem is not the current value, and no other key frames for that attribute on that CartoonItem have been added yet, a key frame for the current state will be added for the start of the animation. For example, if during the setting up code an object has the value for `x` equal to `0` (which is default), and a key frame is added for any time greater than `0` with a value other than `0`, a new key frame will be automatically created for `x` at the time `0` with the value of `0`. This is to avoid the tedium of having to add key frames fo the initial settings for all the attributes that will be animated.

- `item` : A CartoonItem or the name of a CartoonItem
- `time` : The time for the key frame
- `attr` : A CartoonItem [attribute](#cartoonitem-properties) to be animated
- `val` : The value of the CartoonItem attribute

##### Animation.addScene(scene, time) -> null

Adds an AnimationScene to the queue of scenes. At the time given, the AnimationScene will become visible, and the previous one will be hidden.

- `scene` : An AnimationScene
- `time` : A time during the animation

##### Animation.addAudio(audio) -> null

Gives the Animation an HTML audio element to control whenever the user pushes one of the Animation's controls. Things will get kind of wacky if the duration of the audio isn't equal to the duration of the animation. An Animation can only control one audio element. Subsequent calls will only change which lucky element gets the esteemed position of being controlled by the Animation, instead of making more than one be controlled.

- `audio` : An HTML audio element

##### Animation.togglePlay() -> null

Toggles the Animation between playing and pausing. If the Animation is at the start, it will get started. This is the function that should get called whenever the user pushes the play/pause button.

##### Animation.play() -> null

Sets the Animation in motion, starting at the beginning. To get the Animation to play from a paused state, use `Animation.resume()` instead.

##### Animation.stop() -> null

Stops the Animation from playing and sends it back to the start, rendering the first frame. This function may be used to initialize things, so there isn't a mess on the canvas before the user plays the animation. To just stop the playback instead of stopping and going back to the first frame, use `Animation.pause()`.

##### Animation.pause() -> null

Pauses the playback of the Animation. There may be a delay of a few milliseconds because it waits for the next frame to be drawn before stopping.

##### Animation.resume() -> null

Resumes the Animation from a pause.

##### Animation.setTime(time) -> null

Moves the Animation to the given time and draws a frame for that time. The state of the Animation will not change.

- `time` : A time during the animation

##### Animation.back15() -> null

Sends the Animation backward 15 seconds, or to the start, if the current time is less than 15 seconds.

##### Animation.stepAnimation([update]) -> null

Draws the next frame in the animation and schedules itself to be called again, unless the animation is finished, or `this.state` is set to `ready` or `paused`, or if `update` is `true`. If `update` is `true`, the current time will also be recalculated. If the global `DEBUG` is set, the frames per second will be calculated for the last two frames and logged in the console.

- `update` : Bool whether or not the call is a refresh that is not a scheduled part of the Animation playback (e.g. if the Animation is getting moved to a totally different place in the playback and there needs to be an immediate redraw)

### AnimationScene

Represents a scene during an Animation. Each scene gets to keep track of key frames. The Animation checks each step to see what AnimationScene is active; the active AnimationScene checks each step to see what CartoonItems are changing, and these changes finally get drawn.

#### AnimationScene Properties

- `background` : Background object to show or hide when the scene changes
- `scene` : The CartoonCanvas on which the action takes place
- `timeline` : A rather complicated object which holds the key frame data, which will later be compiled
- `immediateTimeline` : An object containing a list of CartoonItem transitions which will take place instantly
- `subAnimations` : A list of SubAnimations which will be animated at different points during the AnimationScene playback
- `lastframe` : The time of the last frame in the AnimationScene
- `drawnYet` : Whether or not any frames for this AnimationScene have been drawn
- `hidden` : Whether or not the AnimationScene's corresponding CartoonCanvas and Background are hidden
- `MYLASTFRAME` : The time of the most recently drawn frame

#### AnimationScene Methods

##### AnimationScene(scene[, background]) -> new AnimationScene

Creates a new AnimationScene.

- `scene` : A CartoonCanvas object on which all the animations will be drawn
- `background` : An optional Background object which will be drawn one time, when the AnimationScene is first shown, and remains constant for the duration of the scene. It will be redrawn any time the user makes the Animation jump to any time that the AnimationScene is active.

##### AnimationScene.hide() -> null

Hides the HTML canvases that are controlled by the CanvasScene in `this.scene` and the Background (if any) in `this.background`.

##### AnimationScene.show() -> null

Makes the HTML canvases that are controlled by the CanvasScene in `this.scene` and the Background (if any) in `this.background appear.

##### AnimationScene.stepAnimation(time, [update]) -> null

Draws the next frame in the sequence corresponding to this AnimationScene. First, all of the CartoonItems that are being animated get are transformed based on the time given, then the CartoonScene in `this.scene` is drawn. If `update` is `true`, all the instantaneous CartoonItem changes listed in `this.immediateTimeline` that are supposed to happen before the time `time` are made (even if unnecessary).

- `time` : An integer specifying the current time during the animation
- `update` : Whether or not to update all of the instantaneous transformations in `this.immediateTimeline`

##### AnimationScene.addKeyFrame(item, time, attr, val) -> null

Adds a key frame to `this.timeline` wherein the given CartoonItem has the attribute `attr` equal to the value `val` at the given time. If the value for `time` is after the end of the animation, it will be changed to the time of the final frame. If the value for the attribute of the CartoonItem is not the current value, and no other key frames for that attribute on that CartoonItem have been added yet, a key frame for the current state will be added for the start of the animation. For example, if during the setting up code an object has the value for `x` equal to `0` (which is default), and a key frame is added for any time greater than `0` with a value other than `0`, a new key frame will be automatically created for `x` at the time `0` with the value of `0`. This is to avoid the tedium of having to add key frames fo the initial settings for all the attributes that will be animated.

- `item` : A CartoonItem or the name of a CartoonItem
- `time` : The time for the key frame
- `attr` : A CartoonItem [attribute](#cartoonitem-properties) to be animated
- `val` : The value of the CartoonItem attribute

##### AnimationScene.addAttrChange(item, time, attr, val) -> null

Adds a key frame to `this.immediateTimeline` wherein the given CartoonItem has the attribute `attr` equal to the value `val` at the given time. The Immediate Timeline is for CartoonItem transformations that will take place instantaneously, with no transition between one value and the next. This is meant to be used for boolean CartoonItem attributes, like `visible` or `reverse`. When the user triggers a jump from one time in the animation to a different time, no matter how small the jump, all of the instantaneous transformations that are to happen before the new time *will* be run through, whether or not they are necessary.

- `item` : A CartoonItem or the name of a CartoonItem
- `time` : The time for the key frame
- `attr` : A CartoonItem [attribute](#cartoonitem-properties) to be animated, preferabbly one with a boolean value
- `val` : The value of the CartoonItem attribute

##### AnimationScene.compile() -> null

Prepares the AnimationScene by compiling `this.timeline` into a series of SubAnimations which have low-level control over the actual animating. These SubAnimations are stored in `this.subAnimations`.

### Controls

Implements a graphical interface for the user to control the animation. The interface consists of:

- A clock displaying the time, in minutes and seconds, that the animation has taken so far
- A play/pause toggle button, which plays, pauses, and resumes the animation
- A stop button, which stops the playback of the animation and sends the animation back to the start
- A button to rewind the animation 15 seconds (or less, if the animation hasn't gone that far)
- A progress meter, which the user drag to move the playback to a different time

#### Controls Methods

##### Controls(animation, element) -> new Controls object

Creates the Controls object, which will control the Animation `animation`. The DOM elements that make up the interface will be placed inside the element given.

- `animation` : The Animation object that the user will control
- `element` : The HTML element, or the id that corresponds to such an element, which the interface will be placed inside

##### Controls.step(time, total) -> null

Updates the clock to display the current time, and moves the progress meter. The total duration is necessary to calculate the percentage completion of the animation.

- `time` : The current time of the Animation
- `total` : The duration of the Animation

##### Controls.state(state) -> null

Updates the state of the play/pause button. If the Animation is playing, the button has a pause symbol. Otherwise, a play symbol is displayed.

- `state` : The state of the Animation, either `play`, `ready`, or `pause`

### SubAnimation

SubAnimations do the actual transforming of CartoonItems during the Animation. Each SubAnimation controls exactly one transition for one attribute for one CartoonItem. SubAnimations are generated automatically when AnimationScenes are compiled.

#### SubAnimation Properties

- `object` : The CartoonItem that will be controlled during the SubAnimation
- `startState` : The value of the attribute in `type` at the beginning of the transition
- `endState` : The value that the attribute in `type` should have at the end of the transition
- `begin` : The time that the SubAnimation will begin playing
- `end` : The time that the SubAnimation will stop playing
- `update` : A function which will provide an algorithm for changing the attribute, whether it is a numeric value, a path, or a color. This function is selected automatically based on the name of the attribute
- `type` : The name of the attribute that will be transitioned

#### SubAnimation Methods

##### SubAnimation.isPlaying(time) -> bool

Tells whether or not the SubAnimation should be playing at the time given.

- `time` : An integer

##### SubAnimation.transformForTime(time) -> null

Transforms the CartoonItem's attribute to the appropriate value for the given time. The percentage completion of the SubAnimation is calculated, and then the function in `this.update` transforms the CartoonItem.

- `time` : An integer representing a time during the SubAnimation

## Copyright and License

Copyright &copy; 2013 Andrew Myers

Licensed under the MIT license

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.