    // Tally of groups for generating id's
	var groups = 0;

    /**
     * Creates a new Group
     *
     * @param scene The Scene the Group will belong to
     *
     * @return The new Group object
     */
	/*var init = function () {
	};*/

    /**
     * Group initializer
     *
     * @param scene The Scene the Group will belong to
     *
     * @return The new Group object
     */
	var group_object = function (scene) {
		this.scene = scene;
		this.objects = [];
		this.rotation = 0;
		this.x = 0;
		this.y = 0;
		this.scale = 1;
		this.name = name || "group_"+groups;
		groups++;
	};
    
    /**
     * Draws all the CartoonObjects in the Group
     */
	group_object.prototype.draw = function (scene) {
		var i = 0,
			length = this.objects.length;
		for ( ;i < length;i++) {
			this.objects[i].draw(scene || this.scene);
		}
	};

    /**
     * Adds a CartoonItem to the group
     *
     * @param item A CartoonItem
     */
	group_object.prototype.addItem = function (item) {
		this.objects.push(item);
	};

    /**
    * Sets one or more Group attributes
    * If a name is given but no value, the value of the attribute is returned
    *
    * @param name Name of a Group attribute or an object describing several attributes
    * @param value The new value for the attribute (optional)
    *
    * @return Bool success
    */
	group_object.prototype.attr = function (name, value) {
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
				var oldValue = this[name],
					difference = oldValue - value;
				this[name] = value;
				// Argh! How to add something like rotation or scale?
				// Also, in an animation things aren't relative:
				// Changing a value here will not change a sub-object's value
				return true;
			}
		}
		return true;
	};