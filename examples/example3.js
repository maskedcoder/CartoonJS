var background = new Background("container");
var canvas = new CartoonCanvas("container");

background.draw = function () {
    var ctxt = this.ctext; // I'm lazy, that's why
    ctxt.save();

    var grad = ctxt.createLinearGradient(0, 0, this.width, this.height);
    grad.addColorStop(0, "rgba(210,255,82,1)");
    grad.addColorStop(1, "rgba(145,232,66,1)");
    ctxt.fillStyle = grad;
    ctxt.fillRect(0, 0, this.width, this.height)

    var circle_grad = ctxt.createLinearGradient(0, 0, this.width, this.height);
    circle_grad.addColorStop(0, "rgba(145,232,66,0.7)");
    circle_grad.addColorStop(1, "rgba(210,255,82,0.7)");
    ctxt.fillStyle = circle_grad;

    var i = 0,
        length = 15,
        base = 100,
        size, x, y;
    for (; i < length; i++) {
        size = Math.random() * base; // It will generate a different pattern every refresh (or replay), but it's kinda cool
        x = Math.random() * 900;
        y = Math.random() * 600;
        ctxt.beginPath();
        ctxt.arc(x, y, size, Math.PI, 3 * Math.PI, false);
        ctxt.fill();
    }
    ctxt.restore();
};

var legMatrix = new Matrix("legs"); // The leg bone
var animal = new CartoonPathItem("animal"); // What kind? I'm not sure... Maybe a duck?
// You have to add the bone to the CartoonPathItem first
animal.addBone(legMatrix);
animal.moveTo(36, -49)
        .bezierCurveTo(-40,-2, 56,-19, -2,47)
        .bezierCurveTo(-40,-23, -67,16, -59,-54)
        .bezierCurveTo(3,-56, -24,-19, 11,-36)
        .bezierCurveTo(13,-95, -19,-64, -17,-88)
        .bezierCurveTo(44,-71, 32,-102, 47,-87)
        .lineTo(97, -66)
        .lineTo(36, -49)
        .endPath() // This breaks the item into 2 seperate paths so we can have different colors
        .beginBone(legMatrix) // Everything between this and .endBone() will be controlled by legMatrix
        .moveTo(6, -12)
        .lineTo(24, -5)
        .lineTo(20, 26)
        .lineTo(46, 25)
        .lineTo(41, 40)
        .lineTo(-3, 33)
        .lineTo(-2, 9)
        .lineTo(-23, -1)
        .lineTo(6, -12)
        .endBone()
        .fillFor("yellow"); // The fillFor() call lets us color one individual path
animal.attr({
    "x": 200,
    "y": 300,
    "fillStyle": "white" // Even though this is white, the one sub-path stays yellow
});
canvas.addItem(animal);
canvas.addItem(legMatrix); // The matrix has to be added to the canvas so it can be animated

var animation = new CartoonAnimation(true);
var scene1 = new AnimationScene(canvas, background);

// First hop:
scene1.addKeyFrame(legMatrix, 200, "rotation", 45); // Moving the matrix moves the leg vertices
// If you didn't notice, the rotational center is (0,0) in the CartoonPathItem's local coordinates
// I could have played with originX and originY, but that gets complicated in a hurry
scene1.addKeyFrame(legMatrix, 500, "rotation", 0);
scene1.addKeyFrame(animal, 500, "y", 200);
scene1.addKeyFrame(animal, 1000, "y", 300);
// Second hop:
scene1.addKeyFrame(legMatrix, 1000, "rotation", 0);
// I had to add that key frame for rotation, otherwise it would animate between the previous key frame
// at 500 milliseconds to the next one at 1200 milliseconds, which looks kinda silly
// Actually, the oddity should be on the first hop when I didn't have a line like this. I was
// able to skip it the first time, because it was automatically added behind the scenes (gasp!)
scene1.addKeyFrame(legMatrix, 1200, "rotation", 45);
scene1.addKeyFrame(legMatrix, 1500, "rotation", 0);
scene1.addKeyFrame(animal, 2000, "x", 400); // Notice the efficiency of only one key frame for x
scene1.addKeyFrame(animal, 1500, "y", 200);
scene1.addKeyFrame(animal, 2000, "y", 300);

// That was a lot of typing. Let's make a function:
var hop = function (scene, item, leg_matrix, startTime, startX, startY) {
    scene.addKeyFrame(leg_matrix, startTime, "rotation", 0); // Don't know what the previous position would be
    scene.addKeyFrame(leg_matrix, startTime + 200, "rotation", 45);
    scene.addKeyFrame(leg_matrix, startTime + 300, "rotation", 0);
    scene.addKeyFrame(item, startTime, "y", startY);
    scene.addKeyFrame(item, startTime + 500, "y", startY - 100); // Negative is up
    scene.addKeyFrame(item, startTime + 1000, "y", startY);
    scene.addKeyFrame(item, startTime, "x", startX);
    scene.addKeyFrame(item, startTime + 1000, "x", startX + 100);
};
// That lets us do:
hop(scene1, animal, legMatrix, 2000, 400, 300);
// Slightly less efficient in the function calls, but way more efficient in typing
hop(scene1, animal, legMatrix, 3000, 500, 300);

// I could even do something like this
var hopToTheSide = function (scene, item, leg_matrix, startTime, startX, startY) {
    var i = 0,
        hops = 7,
        duration = 1000,
        distance = 100;
    for (; i < hops; i++) {
        hop(scene, item, leg_matrix, startTime + duration * i, startX + distance * i, startY);
    }
}
// I think I'll use that
hopToTheSide(scene1, animal, legMatrix, 5000, 200, 300);
// WHEEEEEE!!!!

// But that has a problem: The animal magically floats backwards
// How about adding a instantaneaous change to the reverse property?
scene1.addAttrChange(animal, 4000, "reverse", true);
// Aack! The animal is hopping backward! Let's reverse it again:
scene1.addAttrChange(animal, 5000, "reverse", false);
// Much better. Not amazing, but something. I don't feel like implementing leftward hops, so we'll leave it at that.

// Now for scene 2!
var canvas2 = new CartoonCanvas("container");
var scene2 = new AnimationScene(canvas2, background);
// Reusing backgrounds? Is that even legal? Yup. I can even reuse canvases.
// If I was feeling real wild, I would even reuse CartoonItems between canvases
// (Mind you, in reusing CartoonPathItems, I would have to reset their positions every scene change to prevent unwanted jumps.
// Also, a stray number in a key frame for another scene could cause a little havok)

var star = new CartoonPathItem("star")
        .moveTo(10, -10)
        .lineTo(45, -10)
        .lineTo(18, 10)
        .lineTo(30, 37)
        .lineTo(1, 14)
        .lineTo(-27, 39)
        .lineTo(-16, 7)
        .lineTo(-43, -10)
        .lineTo(-12, -10)
        .lineTo(-1, -47)
        .lineTo(10, -9);
// Not a great star, but pretty good
star.attr({
    "x": 100,
    "y": 300,
    "fillStyle": "yellow"
});
canvas2.addItem(star);

// We have to add this because otherwise it will begin moving even though it doesn't appear for 12 seconds
scene2.addKeyFrame(star, 12200, "x", 100); // (Why 12200 instead of 12000? I didn't like it moving so soon after the scene change)
scene2.addKeyFrame(star, 13000, "x", 700);
scene2.addKeyFrame(star, 12200, "scale", 1);
scene2.addKeyFrame(star, 13000, "scale", 5);

animation.addScene(scene1, 0); // The first scene always begins at 0 milliseconds so people don't get stuck staring at a blank canvas
animation.addScene(scene2, 12000); // I think 12000 milliseconds is about where the first scene's action stops
// I could make the second scene begin too early, or anything. When animations are active on a hidden scene, the
// calculations will cease, but if the canvas shows up again, the items will bear changes as if the animations hadn't stopped
// Likewise, if a scene showed up too early, it would do what you might expect: nothing
animation.stop();