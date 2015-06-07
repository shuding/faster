/**
 * Created by lancy on 6/6/15.
 */



((function(window) {


    var Favorites = function (width) {

        var that = this;
        this.collection = [];
        this.dragStartEvent = [];
        this.dragMoveEvent = [];
        this.dragEndEvent = [];
        this.fireEvent = [];
        this.notFireEvent = [];

        this.defaultWidth = 350;
        if (typeof width === "undefined")
            width = this.defaultWidth;
        this.leftEdge = window.innerWidth - width;


        this.fire = function(event) {
            for (var i = 0; i < that.fireEvent.length; ++i)
                setTimeout(that.fireEvent[i], 0, event);
        };

        this.notfire = function(event) {
            for (var i = 0; i < that.notFireEvent.length; ++i)
                setTimeout(that.notFireEvent[i], 0, event);
        };

        this.dragEnd = function (event) {
            for (var i = 0; i < that.dragEndEvent.length; ++i) {
                setTimeout(that.dragEndEvent[i], 0, event);
            }
        };

        this.dragMove = function (event, enter) {
            for (var i = 0; i < that.dragMoveEvent.length; ++i) {
                setTimeout(that.dragMoveEvent[i], 0, event, enter);
            }
        };

        this.dragStart = function (event) {
            for (var i = 0; i < that.dragStartEvent.length; ++i) {
                setTimeout(that.dragStartEvent[i], 0, event);
            }
        };

        this.addEventListener = function (eventName, func) {

            if (typeof func !== "function")
                throw new Error("the second parameter must be a function");

            switch (eventName) {
                case "dragstart":
                    that.dragStartEvent.push(func);
                    break;
                case "drag":
                    that.dragMoveEvent.push(func);
                    break;
                case "dragend":
                    that.dragEndEvent.push(func);
                    break;
                case "fire":
                    that.fireEvent.push(func);
                    break;
                case "notfire":
                    that.notFireEvent.push(func);
                    break;
            }
        };

        document.addEventListener("dragstart", function (event) {
            that.dragStart(event);
        });

        document.addEventListener("drag", function (event) {
            if (event.screenX >= that.leftEdge)
                that.dragMove(event, true);
            else
                that.dragMove(event, false);
        });

        document.addEventListener("dragend", function (event) {
            that.dragEnd(event);
            if (event.screenX >= that.leftEdge)
                that.fire(event);
            else
                that.notfire(event);
        });
    };

    window.Favorites = Favorites;

})(window));
