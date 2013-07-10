// Create a background (This gets created FIRST so it doesn't cover up the main canvas)
var background = new Background("container");
// Create a canvas
var canvas = new CartoonCanvas("container");

// At this point, the background will do *nothing*
// Therefore, I shall forthwith create a new draw() function
background.draw = function () {
    this.ctext.save();
    var grad = this.ctext.createLinearGradient(0, 0, this.width, this.height);
    grad.addColorStop(0, "rgba(210,252,244,1)");
    grad.addColorStop(0.28, "rgba(210,255,82,1)");
    grad.addColorStop(1, "rgba(145,232,66,1)");
    this.ctext.fillStyle = grad;
    this.ctext.fillRect(0, 0, this.width, this.height)
    this.ctext.restore();
};

// Make the center circle
var center = new CartoonItem("center")
                .moveTo(-50, 0)
                .bezierCurveTo(50, 0, -50, -67, 50, -67)
                .bezierCurveTo(-50, 0, 50, 67, -50, 67);
// Add some different attributes (By default it would just be black)
center.attr({
    "fillStyle": "#f00",
    "lineWidth": 3,
    "y": 200,
    "x": 100,
    "rotation": 25 // Why rotate? Check what happens to the other objects
});

// Make another some more circles
// All these new circles will be
// part of the same CartoonItem (Amazing!)
var circles = new CartoonItem("circles")
                .moveTo(-90, 0) // One on left
                .bezierCurveTo(-60, 0, -90, -20, -60, -20)
                .bezierCurveTo(-90, 0, -60, 20, -90, 20)
                .moveTo(90, 0) // One on right (copy/paste/edit)
                .bezierCurveTo(60, 0, 90, -20, 60, -20)
                .bezierCurveTo(90, 0, 60, 20, 90, 20)
                .moveTo(-15, -75) // One on top
                .bezierCurveTo(15, -75, -15, -95, 15, -95)
                .bezierCurveTo(-15, -75, 15, -55, -15, -55)
                .moveTo(-15, 75) // One on bottom
                .bezierCurveTo(15, 75, -15, 95, 15, 95)
                .bezierCurveTo(-15, 75, 15, 55, -15, 55);
// Change the new circles' attributes
circles.attr({
    "fillStyle": "red",
    "lineWidth": 10,
    "scale": 1.3,
    "strokeStyle": "#a00"
});

// Really important line! Pay attention to this:
circles.setParent(center);
// That one line is what makes this demo do something
// mildly interesting. Otherwise, one circle would
// move and the rest would just hold still

// Put the both items in the canvas
canvas.addItem(center);
canvas.addItem(circles);

// You know, I think I'll add a rectangle, just because
var rect = new CartoonItem("rect")
                .moveTo(-30,-50)
                .lineTo(-30,50)
                .lineTo(30,50)
                .lineTo(30,-50)
                .lineTo(-30,-50);
rect.attr({
    "fillStyle": "green", // Green! The plot thickens...
    "lineWidth": 2,
    "lineCap": "square",
    "x": 533,
    "y": 200
});
// This line is very forgettable and very important
// If your CartoonItems aren't showing up, you may
// have forgotten this
canvas.addItem(rect);


// Create the animation
var animation = new CartoonAnimation(true);

// Create a scene for our animation (notice that I mentioned the background)
var scene = new AnimationScene(canvas, background);

// Make the center circle do a complete rotation in 2 seconds
scene.addKeyFrame(center, 2000, "rotation", 385);
// Make the center circle move to the right 300 pixels
scene.addKeyFrame(center, 2000, "x", 400);
// Make the center circle return over the next 2 seconds
scene.addKeyFrame(center, 4000, "rotation", 25);
scene.addKeyFrame(center, 4000, "x", 100);

// The rect probably ought to move a little, too
scene.addKeyFrame(rect, 1930, "x", 533);
scene.addKeyFrame(rect, 2600, "x", 633);
scene.addKeyFrame(rect, 3000, "x", 653);

// Make this scene appear in the animation at the start
animation.addScene(scene, 0);

// Send the animation to the beginning
animation.stop();