(function (window) {
    function Faster(succCallback) {
        var listener         = new Favorites(350);
        var self             = this;
        this.showPlaceholder = false;
        this.currentData     = {};
        this.currentDom      = '';
        this.yPos            = [];

        this.$fasterContainer = $('ul.faster-container');

        this.openContainer = function () {
            self.$fasterContainer.css('visibility', 'visible');
            setTimeout(function () {
                self.$fasterContainer.addClass('show');
            }, 10);
        };

        this.closeContainer = function () {
            this.$fasterContainer.removeClass('show');
            setTimeout(function () {
                self.$fasterContainer.css('visibility', 'hidden');
            }, 300);
        };

        this.createAlert = function (text) {
            $('<div class="faster-alert hide"><i class="faster-logo"></i>&nbsp;' + text + '</div>').appendTo('body');
            setTimeout(function () {
                $('.faster-alert').removeClass('hide');
            }, 100);
            setTimeout(function () {
                $('.faster-alert').addClass('hide');
                setTimeout(function () {
                    $('.faster-alert').remove();
                }, 350);
            }, 1500);
        };

        function getSelectedNodes() {
            var retVal = [];
            var sel    = rangy.getSelection();
            if (!sel.rangeCount) {
                return [];
            }
            var range     = sel.getRangeAt(0);
            selectedNodes = range.getNodes();

            selectedNodes.forEach(function (node) {
                if (node.childNodes.length || (node.nodeValue && !node.nodeValue.trim().length)) {
                    return;
                }
                var obj = {};
                if (range.startContainer == node) {
                    obj.start = range.startOffset;
                } else {
                    obj.start = 0;
                }
                if (range.endContainer == node) {
                    obj.end = range.endOffset;
                } else {
                    obj.end = (node.nodeName == '#text' ? node.data.length : 0);
                }
                obj.node = node;
                retVal.push(obj);
            });
            return retVal;
        }

        this.parseContent = function (event) {
            var image      = null;
            var text       = null;
            var title      = null;
            var titleLevel = 7;

            var selection = getSelectedNodes();
            selection.forEach(function (obj) {
                if (obj.node.nodeName == '#text') {
                    var heading = 8;
                    if (obj.node.parentElement) {
                        if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].indexOf(obj.node.parentElement.nodeName) !== -1) {
                            heading = +obj.node.parentElement.nodeName[1];
                            if (heading < titleLevel) {
                                title = obj.node.data.substr(obj.start, obj.end - obj.start).trim();
                                return;
                            }
                        }
                    }
                    if (!text) {
                        text = '';
                    }
                    text += obj.node.data.substr(obj.start, obj.end - obj.start).trim() + '\n'
                } else if (obj.node.nodeName == 'IMG') {
                    if (!image) {
                        image = obj.node.currentSrc;
                    }
                }
            });

            if (!selection.length) {
                if (event.path && event.path.length && event.path[0].nodeName == 'IMG') {
                    image = event.path[0].currentSrc;
                }
            }

            return {
                title: title,
                text:  text,
                image: image,
                date:  new Date()
            };
        };

        this.correctPosition = function () {
            self.yPos = [];
            $('li.faster-element').not('#faster-virtual').each(function (index, el) {
                self.yPos.push([el.offsetTop, el]);
            });
            if (self.yPos.length)
                self.yPos.push([
                    self.yPos[self.yPos.length - 1][0] + $(self.yPos[self.yPos.length - 1][1]).height(),
                    null
                ]);
            $('li.faster-element').not('#faster-virtual').each(function (index, el) {
                $(el).css({
                    position: 'absolute',
                    top: self.yPos[index][0] + 'px'
                });
            });
        };

        this.resetPosition = function () {
            $('li.faster-element').each(function (index, el) {
                $(el).css({
                    position: 'relative',
                    top: '0'
                });
            });
        };

        this.movePlaceholder = function (pageY) {
            var index = 0;

            for (var i = 0; i < self.yPos.length; ++i) {
                var arr = self.yPos[i];
                if (pageY >= arr[0] && i < self.yPos.length - 1 && pageY < self.yPos[i + 1][0])
                    break;
                if (index < self.yPos.length - 1)
                    index++;
            }

            self.$currentDom.css('top', self.yPos[index][0] + 'px');

            var height = self.$currentDom.height();
            for (var i = 0; i < index; ++i) {
                var arr = self.yPos[i];
                arr[1].style.top = arr[0] + 'px';
            }
            for (var i = index; i < self.yPos.length - 1; ++i) {
                var arr = self.yPos[i];
                arr[1].style.top = arr[0] + height + 'px';
            }
        };

        this.getNewDOM = function () {
            self.currentDom = '<li class="faster-element" id="faster-virtual">';
            if (self.currentData.title) {
                self.currentDom += '<p class="faster-title">' + self.currentData.title + '</p>';
            }
            if (self.currentData.image) {
                self.currentDom += '<img class="faster-image" src="' + self.currentData.image + '"/>';
            }
            if (self.currentData.text) {
                self.currentDom += '<p class="faster-text">' + self.currentData.text + '</p>';
            }
            if (self.currentData.date) {
                self.currentDom += '<p class="faster-date">' + self.currentData.date + '</p>';
            }
            self.currentDom += '</li>';
            $('ul.faster-container').append(self.currentDom);
            self.$currentDom = $('#faster-virtual');
        };

        this.closeDOM = function () {
            self.$currentDom.remove();
            self.$currentDom = null;
        };

        //==

        listener.addEventListener('dragstart', function (event) {
            self.currentData = self.parseContent(event);
            self.getNewDOM();
            self.correctPosition();
            self.openContainer();
        });

        listener.addEventListener('dragend', function () {
            self.closeContainer();
            self.closeDOM();
            self.resetPosition();
        });

        listener.addEventListener('drag', function (event, enter) {
            if (self.$currentDom) {
                if (self.showPlaceholder)
                    self.movePlaceholder(event.pageY);
                if (enter && !self.showPlaceholder) {
                    self.$currentDom.addClass('show');
                    self.showPlaceholder = true;
                }
                if (!enter && self.showPlaceholder) {
                    self.$currentDom.removeClass('show');
                    self.showPlaceholder = false;
                }
            }
        });

        listener.addEventListener('fire', function (event) {
            self.createAlert('Added Successfully :)');
            succCallback && succCallback(self.currentData);
        });

        listener.addEventListener('notfire', function (event) {
        });
    }

    window.Faster = Faster;
})(window);
