/**
 * starts running
 * @param options
 */
$.fn.runaway = function(options) {
    $.each(this, function() {
        if (typeof this.runaway === 'undefined') {
            this.runaway = new Runaway(options);
        }

        this.runaway.start(this);
    });
};

/**
 * stops running
 */
$.fn.staystill = function() {
    $.each(this, function() {
        if (typeof this.runaway !== 'undefined') {
            this.runaway.stop();
        }
    });
};

/**
 * falls back to defaults
 * @param options (optional)
 * @constructor
 */
function Runaway(options) {
    for (var i in this.options) {
        if (typeof options !== 'undefined' && options.hasOwnProperty(i)) {
            this[i] = options[i];
        } else {
            this[i] = this.options[i];
        }
    }
}

Runaway.prototype.options = {
    proximity: 50,
    velocity: 50
};

Runaway.prototype.velocity = 0;
Runaway.prototype.thing = null;
Runaway.prototype.window = null;
Runaway.prototype.uniqueId = '';

/**
 * keep track of relevant elements, bind run on mousemove
 * @param thing
 */
Runaway.prototype.start = function(thing) {
    this.thing = $(thing);
    this.window = $(window);

    var position = this.thing.offset();
    this.thing.css({
        "position": "absolute",
        "z-index": 2147483647,
        left: position.left + "px",
        top: position.top + "px"
    });   // lol
    this.uniqueId = Math.random().toString(36).substr(2);
    this.window.on('mousemove.runaway' + this.uniqueId, $.proxy(this.run, this));
};

/**
 * if mouse is within proximity, travel velocity pixels relative to mouse position vs center of element
 * @param e
 */
Runaway.prototype.run = function(e) {
    var position = this.thing.offset();

    // first grab object position CENTER relative to window scroll and object size
    var adjustedPos = [
        position.left + this.thing.outerWidth()/2 - this.window.scrollLeft(),
        position.top + this.thing.outerHeight()/2 - this.window.scrollTop()
    ];

    var mouseOffset = [
        e.pageX - this.window.scrollLeft() - adjustedPos[0],
        e.pageY - this.window.scrollTop() - adjustedPos[1]
    ];

    var mouseVector = [
        Math.cos(mouseOffset[0]),
        Math.sin(mouseOffset[1])
    ];

    // these are the relative coordinates of the edge of the object in the direction of the mouse
    // for instance, the corners are the farthest away the mouse can be from the center and still be touching the object
    var objectOffset = [
        this.thing.outerWidth()/2 * mouseVector[0],
        this.thing.outerHeight()/2 * mouseVector[1]
    ];

    // in most cases, the mouse isn't even close to the object
    // so this saves us doing a distance calculation
    if (
        Math.abs(mouseOffset[0] - objectOffset[0]) > this.proximity ||
        Math.abs(mouseOffset[1] - objectOffset[1]) > this.proximity
    ) {
        return;
    }

    var dist = this.distance(mouseOffset, objectOffset);

    if (dist > this.proximity) {
        return;
    }

    var vector = [
        this.velocity * mouseVector[0],
        this.velocity * mouseVector[1]
    ];

    var newPosition = [
        position.left - vector[0],
        position.top - vector[1]
    ];

    if (
        newPosition[0] < 0 ||
        newPosition[0] > this.window.width() ||
        newPosition[1] < 0 ||
        newPosition[1] > this.window.height()
    ) {    // out of bounds, lets get random
        newPosition[0] = Math.floor(Math.random() * this.window.width());
        newPosition[1] = Math.floor(Math.random() * this.window.height());
    }

    // RUN AWAY
    this.thing.offset({
        left: newPosition[0],
        top: newPosition[1]
    });
};

/**
 * helper distance function
 * @param a - [x1, y1]
 * @param b - [x2, y2]
 * @returns {number}
 */
Runaway.prototype.distance = function(a, b) {
    return Math.floor(Math.sqrt(Math.pow(b[1] - a[1], 2) + Math.pow(b[0] - a[0], 2)));
};

/**
 * unbind
 */
Runaway.prototype.stop = function() {
    this.thing.unbind('mouseover.runaway' + this.uniqueId);
};
