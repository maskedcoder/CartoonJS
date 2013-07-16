// Create a canvas
var canvas = new CartoonCanvas("container");

// Make a square
var square = new CartoonPathItem("square")
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
    "lineWidth": 3,
    "y": 200,
    "x": 100
});
// Put the square in the canvas
canvas.addItem(square);

// Create the animation
var animation = new CartoonAnimation(true);

// Create a scene for our animation
var scene = new AnimationScene(canvas);

// Make the square do a complete rotation in 2 seconds
scene.addKeyFrame(square, 2000, "rotation", 405);
// Make the square move to the right 100 pixels
scene.addKeyFrame(square, 2000, "x", 200);
    

// Make this scene appear in the animation at the start
animation.addScene(scene, 0);

// Send the animation to the beginning
animation.stop();