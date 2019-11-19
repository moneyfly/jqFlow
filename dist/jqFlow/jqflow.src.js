// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS

/**
 * @license jqFlow JS v1.0.0 (2015-02-03)
 * need jquery support
 * (c) 2015 moneyfly
 *
 * License: MIT
 */

( function() {
        // encapsulated variables
        var UNDEFINED, doc = document, win = window, math = Math, mathRound = math.round, mathFloor = math.floor, mathCeil = math.ceil, mathMax = math.max, mathMin = math.min, mathAbs = math.abs, mathCos = math.cos, mathSin = math.sin, mathPI = math.PI, deg2rad = mathPI * 2 / 360,
        // some variables
        userAgent = navigator.userAgent, isIE = /msie/i.test(userAgent) && !win.opera, docMode8 = doc.documentMode === 8, isWebKit = /AppleWebKit/.test(userAgent), isFirefox = /Firefox/.test(userAgent), SVG_NS = 'http://www.w3.org/2000/svg', hasSVG = !!doc.createElementNS && !!doc.createElementNS(SVG_NS, 'svg').createSVGRect, hasBidiBug = isFirefox && parseInt(userAgent.split('Firefox/')[1], 10) < 4, // issue #38
        useCanVG = !hasSVG && !isIE && !!doc.createElement('canvas').getContext, Renderer, hasTouch = doc.documentElement.ontouchstart !== UNDEFINED, symbolSizes = {}, idCounter = 0, defaultOptions, noop = function() {
        },
        // some constants for frequently used strings
        DIV = 'div', ABSOLUTE = 'absolute', RELATIVE = 'relative', HIDDEN = 'hidden', PREFIX = 'attrcharts-', VISIBLE = 'visible', PX = 'px', NONE = 'none';

        // The jqFlow namespace
        win.jqFlow = {};

        /**
         * Append indexOf method to the Array object
         * @param {element} array element
         */
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(searchElement /*, fromIndex */ ) {"use strict";
                if (this === null) {
                    throw new TypeError();
                }
                var t = Object(this);
                var len = t.length >>> 0;
                if (len === 0) {
                    return -1;
                }
                var n = 0;
                if (arguments.length > 0) {
                    n = Number(arguments[1]);
                    if (n != n) {// shortcut for verifying if it's NaN
                        n = 0;
                    } else if (n !== 0 && n != Infinity && n != -Infinity) {
                        n = (n > 0 || -1) * Math.floor(Math.abs(n));
                    }
                }
                if (n >= len) {
                    return -1;
                }
                var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
                for (; k < len; k++) {
                    if ( k in t && t[k] === searchElement) {
                        return k;
                    }
                }
                return -1;
            };
        }

        /**
         * Append lastIndexOf method to the Array object
         * Add lastIndexOf to non ECMA-262 standard compliant browsers
         * @param {element} array element
         */
        if (!Array.prototype.lastIndexOf) {
            Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/) {"use strict";
                if (this === null) {
                    throw new TypeError();
                }
                var t = Object(this);
                var len = t.length >>> 0;
                if (len === 0) {
                    return -1;
                }
                var n = len;
                if (arguments.length > 1) {
                    n = Number(arguments[1]);
                    if (n != n) {
                        n = 0;
                    } else if (n !== 0 && n != (1 / 0) && n != -(1 / 0)) {
                        n = (n > 0 || -1) * Math.floor(Math.abs(n));
                    }
                }
                var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);
                for (; k >= 0; k--) {
                    if ( k in t && t[k] === searchElement) {
                        return k;
                    }
                }
                return -1;
            };
        }

        /**
         * Append remove method to the Array object
         * @param {element} array element
         */
        if (!Array.prototype.remove) {
            Array.prototype.remove = function(element /*, fromIndex */ ) {"use strict";
                var t = Object(this);
                var indexofelem = t.indexOf(element);
                t.splice(indexofelem, 1);
            };
        }

        /**
         * find array element not in the another array
         * @param {element} array
         */
        if (!Array.prototype.diff) {
            Array.prototype.diff = function(new_a /*, fromIndex */ ) {"use strict";
                var t = Object(this);
                var diff_a = [];
                var tempObj = {};
                for (var i = 0, l = new_a.length; i < l; i++) {
                    var key = new_a[i];
                    if (!tempObj.hasOwnProperty(key)) {
                        tempObj[key] = key;
                    }
                }

                for (var i = 0, l = t.length; i < l; i++) {
                    var key = t[i];
                    if (!tempObj.hasOwnProperty(key)) {
                        diff_a.push(key);
                    }
                }
                return diff_a.uniq();
            };
        }

        /**
         * unique Array object
         */
        if (!Array.prototype.uniq) {
            Array.prototype.uniq = function() {"use strict";
                var t = Object(this);
                var uniq_a = [];
                var tempObj = {};
                for (var i = 0, l = t.length; i < l; i++) {
                    var key = t[i];
                    if (!tempObj.hasOwnProperty(key)) {
                        tempObj[key] = key;
                        uniq_a.push(key);
                    }
                }
                return uniq_a;
            };
        }

        /**
         * Returns true if the object is not null or undefined. Like MooTools' $.defined.
         * @param {Object} obj
         */
        function defined(obj) {
            return obj !== UNDEFINED && obj !== null;
        }

        /**
         * Extend an object with the members of another
         * @param {Object} a The object to be extended
         * @param {Object} b The object to add to the first one
         */
        function extend(a, b) {
            var n;
            if (!a) {
                a = {};
            }
            for (n in b) {
                a[n] = b[n];
            }
            return a;
        }

        /**
         * How many decimals are there in a number
         * @param {float} num The number
         * @param {Number} v The Magnitude
         */
        function decimal(num, v) {
            var vv = Math.pow(10, v);
            return Math.round(num * vv) / vv;
        }

        /**
         * Shortcut for parseInt
         * @param {Object} s
         * @param {Number} mag Magnitude
         */
        function pInt(s, mag) {
            return parseInt(s, mag || 10);
        }

        /**
         * Shortcut for parseFloat
         * @param {Object} s
         */
        function pFloat(s) {
            return parseFloat(s);
        }

        /**
         * Add an event listener
         * @param {Object} el A HTML element or custom object
         * @param {String} event The event type
         * @param {Function} fn The event handler
         */
        addEvent = function(el, event, fn) {
            jQ(el).bind(event, fn);
        };

        /**
         * Set CSS on a given element
         * @param {Object} el
         * @param {Object} styles Style object with camel case property names
         */
        function css(el, styles) {
            if (isIE) {
                if (styles && styles.opacity !== UNDEFINED) {
                    styles.filter = 'alpha(opacity=' + (styles.opacity * 100) + ')';
                }
            }
            extend(el.style, styles);
        }

        /**
         * Utility function to create element with attributes and styles
         * @param {Object} tag
         * @param {Object} attribs
         * @param {Object} styles
         * @param {Object} parent
         * @param {Object} nopad
         */
        function createElement(tag, attribs, styles, parent, nopad) {
            var el = doc.createElement(tag);
            if (attribs) {
                extend(el, attribs);
            }
            if (nopad) {
                css(el, {
                    padding : 0,
                    border : NONE,
                    margin : 0
                });
            }
            if (styles) {
                css(el, styles);
            }
            if (parent) {
                parent.appendChild(el);
            }
            return el;
        }

        /**
         * SVG text new line
         */
        function strNewLine(str, char_num) {
            var str_len = str.length;
            if (str_len < char_num) {
                return str;
            }
            var i = 0;
            var strL = [];
            while (i + char_num < str_len) {
                strL.push(str.slice(i, i + char_num));
                i += char_num;
            }
            strL.push(str.slice(i, str_len));
            return strL.join("\n");
        }

        if (win.jQuery) {
            /**
             * Deep merge two objects and return a third object
             */
            merge = function() {
                var args = arguments;
                return jQuery.extend(true, null, args[0], args[1], args[2], args[3]);
            };
        }

        /**
         * The transition class
         */
        function Transition(paper, display_nodes, trans_info, options) {
            this.defaultOptions = {
                trans : {
                    'line-width' : 1.5,
                    'line-length' : 50,
                    'line-color' : 'black',
                    'arrow-end' : 'classic-wide-long'
                },
                text : {
                    'text-margin' : 8,
                    'font-size' : 12,
                    'font' : 'normal',
                    'font-family' : 'Helvetica',
                    'font-weight' : 'normal',
                    'font-color' : 'black'
                }
            };

            this.options = merge(this.defaultOptions, options);
            // do the merge

            this.id = trans_info.id;
            this.paper = paper;
            this.group = this.paper.set();
            this.display_nodes = display_nodes;
            this.initialize(trans_info);
        }


        Transition.prototype = {
            initialize : function(trans_info) {
                //Todo: some initialize
                this.trans_info = trans_info;
            },

            render : function() {
                var from = this.trans_info.from, to = this.trans_info.to, text = this.trans_info.name, type = this.trans_info.type;
                var fromNode = this.display_nodes[from], toNode = this.display_nodes[to];
                //draw line
                this.drawLine(fromNode, toNode, text);
                this.bindEvent();
            },

            drawLine : function(fromNode, toNode, text) {
                var fromNodeX = fromNode.getX(), fromNodeY = fromNode.getY(), fromNodeX2 = fromNode.getX2(), fromNodeY2 = fromNode.getY2(), fromNodeTopAnchor = fromNode.getTopAnchor(), fromNodeRightAnchor = fromNode.getRightAnchor(), fromNodeBottomAnchor = fromNode.getBottomAnchor(), fromNodeLeftAnchor = fromNode.getLeftAnchor();

                var toNodeX = toNode.getX(), toNodeY = toNode.getY(), toNodeX2 = toNode.getX2(), toNodeY2 = toNode.getY2(), toNodeTopAnchor = toNode.getTopAnchor(), toNodeRightAnchor = toNode.getRightAnchor(), toNodeBottomAnchor = toNode.getBottomAnchor(), toNodeLeftAnchor = toNode.getLeftAnchor();

                //this relative position is base the current node(from node)
                var isOnSameColumn = (fromNodeX < toNodeX2 && fromNodeX2 > toNodeX), isOnSameLine = (fromNodeY < toNodeY2 && fromNodeY2 > toNodeY), isUnder = fromNodeY2 < toNodeY, isUpper = fromNodeY > toNodeY2, isLeft = fromNodeX > toNodeX2, isRight = fromNodeX2 < toNodeX;

                var maxX = 0, lineGroup, //[line,line_text]
                lineLength = this.options.trans['line-length'], lineWith = this.options.trans['line-width'];

                if (isOnSameColumn && isUnder) {
                    lineGroup = this.renderLine(this.paper, fromNodeBottomAnchor, toNodeTopAnchor, text);
                } else if (isOnSameLine && isRight) {
                    lineGroup = this.renderLine(this.paper, fromNodeRightAnchor, toNodeLeftAnchor, text);
                } else if (isOnSameLine && isLeft) {
                    lineGroup = this.renderLine(this.paper, fromNodeLeftAnchor, toNodeRightAnchor, text);
                } else if (isOnSameColumn && isUpper) {
                    lineGroup = this.renderLine(this.paper, fromNodeTopAnchor, toNodeBottomAnchor, text);
                } else if (isLeft) {
                    if (isUpper) {
                        lineGroup = this.renderLine(this.paper, fromNodeTopAnchor, toNodeBottomAnchor, text);
                    } else if (isUnder) {
                        lineGroup = this.renderLine(this.paper, fromNodeBottomAnchor, toNodeTopAnchor, text);
                    }
                } else if (isRight) {
                    if (isUpper) {
                        lineGroup = this.renderLine(this.paper, fromNodeTopAnchor, toNodeBottomAnchor, text);
                    } else if (isUnder) {
                        lineGroup = this.renderLine(this.paper, fromNodeBottomAnchor, toNodeTopAnchor, text);
                    }
                }

                if (!lineGroup[0]) {
                    var self = this;
                    for (var l = 0, llen = this.chart.lines.length; l < llen; l++) {
                        var otherLine = this.chart.lines[l];
                        var i, len, intersections, inter;

                        var ePath = otherLine.attr('path'), lPath = line.attr('path');

                        for (var iP = 0, lenP = ePath.length - 1; iP < lenP; iP++) {
                            var newPath = [];
                            newPath.push(['M', ePath[iP][1], ePath[iP][2]]);
                            newPath.push(['L', ePath[iP + 1][1], ePath[iP + 1][2]]);

                            var line1_from_x = newPath[0][1];
                            var line1_from_y = newPath[0][2];
                            var line1_to_x = newPath[1][1];
                            var line1_to_y = newPath[1][2];

                            for (var lP = 0, lenlP = lPath.length - 1; lP < lenlP; lP++) {
                                var newLinePath = [];
                                newLinePath.push(['M', lPath[lP][1], lPath[lP][2]]);
                                newLinePath.push(['L', lPath[lP + 1][1], lPath[lP + 1][2]]);

                                var line2_from_x = newLinePath[0][1];
                                var line2_from_y = newLinePath[0][2];
                                var line2_to_x = newLinePath[1][1];
                                var line2_to_y = newLinePath[1][2];

                                var res = checkLineIntersection(line1_from_x, line1_from_y, line1_to_x, line1_to_y, line2_from_x, line2_from_y, line2_to_x, line2_to_y);
                                if (res.onLine1 && res.onLine2) {

                                    var newSegment;
                                    if (line2_from_y === line2_to_y) {
                                        if (line2_from_x > line2_to_x) {
                                            newSegment = ['L', res.x + lineWith * 2, line2_from_y];
                                            lPath.splice(lP + 1, 0, newSegment);
                                            newSegment = ['C', res.x + lineWith * 2, line2_from_y, res.x, line2_from_y - lineWith * 4, res.x - lineWith * 2, line2_from_y];
                                            lPath.splice(lP + 2, 0, newSegment);
                                            line.attr('path', lPath);
                                        } else {
                                            newSegment = ['L', res.x - lineWith * 2, line2_from_y];
                                            lPath.splice(lP + 1, 0, newSegment);
                                            newSegment = ['C', res.x - lineWith * 2, line2_from_y, res.x, line2_from_y - lineWith * 4, res.x + lineWith * 2, line2_from_y];
                                            lPath.splice(lP + 2, 0, newSegment);
                                            line.attr('path', lPath);
                                        }
                                    } else {
                                        if (line2_from_y > line2_to_y) {
                                            newSegment = ['L', line2_from_x, res.y + lineWith * 2];
                                            lPath.splice(lP + 1, 0, newSegment);
                                            newSegment = ['C', line2_from_x, res.y + lineWith * 2, line2_from_x + lineWith * 4, res.y, line2_from_x, res.y - lineWith * 2];
                                            lPath.splice(lP + 2, 0, newSegment);
                                            line.attr('path', lPath);
                                        } else {
                                            newSegment = ['L', line2_from_x, res.y - lineWith * 2];
                                            lPath.splice(lP + 1, 0, newSegment);
                                            newSegment = ['C', line2_from_x, res.y - lineWith * 2, line2_from_x + lineWith * 4, res.y, line2_from_x, res.y + lineWith * 2];
                                            lPath.splice(lP + 2, 0, newSegment);
                                            line.attr('path', lPath);
                                        }
                                    }

                                    lP += 2;
                                    len += 2;
                                }
                            }
                        }
                    }
                }
            },

            renderLine : function(paper, from, to, text) {
                var i, len;

                if (Object.prototype.toString.call(to) !== '[object Array]') {
                    to = [to];
                }

                var path = 'M{0},{1}';
                for ( i = 2, len = 2 * to.length + 2; i < len; i += 2) {
                    path += ' L{' + i + '},{' + (i + 1) + '}';
                }
                var pathValues = [from.x, from.y];
                for ( i = 0, len = to.length; i < len; i++) {
                    pathValues.push(to[i].x);
                    pathValues.push(to[i].y);
                }

                var line = paper.path(path, pathValues);
                line.attr({
                    stroke : this.options.trans['line-color'],
                    'stroke-width' : this.options.trans['line-width'],
                    'arrow-end' : this.options.trans['arrow-end']
                });

                var font = this.options.text['font'];
                var fontF = this.options.text['font-family'];
                var fontW = this.options.text['font-weight'];

                if (font)
                    line.attr({
                        'font' : font
                    });
                if (fontF)
                    line.attr({
                        'font-family' : fontF
                    });
                if (fontW)
                    line.attr({
                        'font-weight' : fontW
                    });
                this.group.push(line);

                if (text) {
                    var centerText = true;

                    var textPath = paper.text(0, 0, text);

                    var isHorizontal = false;
                    var firstTo = to[0];

                    if (from.y === firstTo.y) {
                        isHorizontal = true;
                    }

                    var x = 0, y = 0;
                    if (centerText) {
                        if (from.x > firstTo.x) {
                            x = from.x - (from.x - firstTo.x) / 2;
                        } else {
                            x = firstTo.x - (firstTo.x - from.x) / 2;
                        }
                        if (from.y > firstTo.y) {
                            y = from.y - (from.y - firstTo.y) / 2;
                        } else {
                            y = firstTo.y - (firstTo.y - from.y) / 2;
                        }
                        if (isHorizontal) {
                            x -= textPath.getBBox().width / 2;
                            y -= this.options.text['text-margin'];
                        } else {
                            x += this.options.text['text-margin'];
                            y -= textPath.getBBox().height / 2;
                        }
                    } else {
                        x = from.x;
                        y = from.y;
                        if (isHorizontal) {
                            x += this.options.text['text-margin'] / 2;
                            y -= this.options.text['text-margin'];
                        } else {
                            x += this.options.text['text-margin'] / 2;
                            y += this.options.text['text-margin'];
                        }
                    }

                    textPath.attr({
                        'text-anchor' : 'start',
                        'font-size' : this.options.text['font-size'],
                        'fill' : this.options.text['font-color'],
                        x : x,
                        y : y
                    });

                    if (font)
                        textPath.attr({
                            'font' : font
                        });
                    if (fontF)
                        textPath.attr({
                            'font-family' : fontF
                        });
                    if (fontW)
                        textPath.attr({
                            'font-weight' : fontW
                        });

                    //set element class
                    textPath.node.id = this.id;
                    textPath.node.setAttribute("class", "trans-text");

                    this.group.push(textPath);
                }
                this.group.attr({
                    cursor : "pointer"
                });
                return this.group;
            },
            bindEvent : function() {
                if ( typeof this.options.trans.click == 'function') {
                    this.group.click(this.options.trans.click);
                } else if ( typeof this.options.trans.post != "undefined") {
                    if (this.options.trans.post.hasOwnProperty("baseUrl")) {
                        var baseUrl = this.options.trans.post.baseUrl;
                        var id = this.id;
                        this.group.click(function() {
                            jQuery.post(baseUrl, {
                                id : id,
                                type : 'trans'
                            }, function(data) {
                                //do something after post successful
                            });
                        });

                    }
                }
                /*
                * Todo double click
                */
                //if(this.options.trans.dblclick){this.group.dblclick(this.options.trans.dblclick);}
            },
        };

        /**
         * The node class
         */
        function Node(paper, node_info, options) {
            this.defaultOptions = {
                text : {
                    'text-margin' : 18,
                    'font-size' : 12,
                    'font' : 'normal',
                    'font-family' : 'Helvetica',
                    'font-weight' : 'normal',
                    'font-color' : 'black'
                },
                node : {
                    'fill' : '#fff',
                    'stroke' : '#ccc',
                    'stroke-width' : '1',
                    click : null
                }
            };

            this.options = merge(this.defaultOptions, options);
            // do the merge

            this.id = node_info.id;
            this.paper = paper;
            this.group = this.paper.set();
            this.childBox = null;
            this.initialize(node_info);
        }


        Node.prototype = {
            initialize : function(node_info) {
                this.name = node_info.name;
                this.nodeType = node_info.type;
                this.text = this.paper.text(0, 0, strNewLine(this.name, 25));

                this.text.attr({
                    'fill' : this.options.text['font-color'],
                    'font-size' : this.options.text['font-size'],
                    'font' : this.options.text['normal'],
                    'font-family' : this.options.text['Helvetica'],
                    'font-weight' : this.options.text['normal'],
                    cursor : "pointer",
                });

                this.group.push(this.text);

                var src = "";
                var src_prefix = this.options.theme.srcPrefix;
                //running|waiting|completed
                var status = node_info.status;
                //successful|error|warning
                var outcome = node_info.outcome;
                if (status != "completed") {
                    src = src_prefix + "/images/" + status + ".png";
                } else {
                    src = src_prefix + "/images/" + outcome + ".png";
                }
                this.status = this.paper.image(src, 0, 0, 18, 18);
                this.group.push(this.status);

                var displayNode;
                //console.log(node_info);
                var node_style = {
                    'fill' : node_info.disable && this.options.node.stroke || this.options.node.fill,
                    'stroke' : this.options.node.stroke,
                    'stroke-width' : this.options.node['stroke-width'],
                    cursor : "pointer",
                    "fill-opacity" : 0.8,
                    title : node_info.name,
                };
                switch (this.nodeType) {
                    case 'subworkflow':
                        displayNode = this.__workflowNode(node_style);
                        break;
                    case 'subjob':
                        displayNode = this.__actionNode(node_style);
                        break;
                    case 'noaction':
                        displayNode = this.__nullNode(node_style);
                        break;
                    default:
                        return new Error('Wrong symbol type!');
                }

                this.group.push(displayNode);
                displayNode.insertBefore(this.text);

                this.text.attr({
                    'x' : displayNode.getBBox().width / 2,
                    'y' : (displayNode.getBBox().height / 2 + this.status.getBBox().height / 2)
                });

                this.status.attr({
                    'x' : (displayNode.getBBox().width / 2 - this.status.getBBox().width / 2),
                    'y' : (this.status.getBBox().height / 2)
                });

                //if displayNode is workflow node. revise the workflow icon
                if (displayNode.type == 'set') {
                    //reset the wf tag position
                    if (displayNode.length > 1) {
                        var wf_tag = displayNode[1];
                        wf_tag.attr({
                            'x' : (displayNode.getBBox().width - wf_tag.getBBox().width),
                            'y' : 4
                        });
                    }
                }

                //reset group style and set the group element id
                this.group.attr({
                    cursor : "pointer"
                });

                this.width = this.group.getBBox().width;
                this.height = this.group.getBBox().height + 4;

                //bind click handler
                this.bindEvent();
            },

            __actionNode : function(node_style) {
                var text_width = this.text.getBBox().width;
                var text_height = this.text.getBBox().height;
                var text_margin = this.options.text['text-margin'];

                extend(node_style, {
                    'width' : text_width + 3 * text_margin,
                    'height' : text_height + 2 * text_margin
                });

                var node_sym = this.paper.rect(0, 0, 0, 0);
                node_sym.node.id = this.id;
                node_sym.node.setAttribute("class", "node");
                node_sym.attr(node_style);
                return node_sym;
            },

            __workflowNode : function(node_style) {
                var text_width = this.text.getBBox().width;
                var text_height = this.text.getBBox().height;
                var text_margin = this.options.text['text-margin'];

                extend(node_style, {
                    'width' : text_width + 4 * text_margin,
                    'height' : text_height + 2 * text_margin
                });

                var node_sym = this.paper.rect(0, 0, 0, 0);
                node_sym.node.id = this.id;
                node_sym.node.setAttribute("class", "node");
                node_sym.attr(node_style);

                var src = this.options.theme.srcPrefix + "/images/workflow.png";
                var wf_icon = this.paper.image(src, 0, 0, 16, 16);
                return this.paper.set().push(node_sym, wf_icon);
                //return node_sym;
            },

            __nullNode : function(node_style) {
                var text_width = this.text.getBBox().width;
                var text_height = this.text.getBBox().height;
                var text_margin = this.options.text['text-margin'];

                extend(node_style, {
                    'width' : text_width + 2 * text_margin,
                    'height' : text_height + 2 * text_margin
                });
                var node_sym = this.paper.rect(0, 0, 0, 0, 36);
                node_sym.node.id = this.id;
                node_sym.node.setAttribute("class", "node");
                node_sym.attr(node_style);
                return node_sym;
            },

            bindEvent : function() {
                if ( typeof this.options.node.click == 'function') {
                    this.group.click(this.options.node.click);
                } else if (( typeof this.options.node.post) != "undefined") {
                    if (this.options.node.post.hasOwnProperty("baseUrl")) {
                        var baseUrl = this.options.node.post.baseUrl;
                        var id = this.id;
                        this.group.click(function() {
                            jQuery.post(baseUrl, {
                                id : id,
                                type : 'node'
                            }, function(data) {
                                //do something after post successful
                            });
                        });

                    }
                } else if ( typeof this.options.node.get != "undefined") {
                    if (this.options.node.get.hasOwnProperty("baseUrl")) {
                        var baseUrl = this.options.node.get.baseUrl;
                        var id = this.id;
                        this.group.click(function() {
                            window.open(baseUrl + "/" + id, '_blank');
                        });

                    }
                }
                /*
                * Todo double click
                */
                //if(this.options.node.dblclick){this.group.dblclick(this.options.node.dblclick);}

            },

            getCenter : function() {
                return {
                    x : this.getX() + this.width / 2,
                    y : this.getY() + this.height / 2
                };
            },

            __getElemCenter : function(elem) {
                return {
                    x : elem.getX() + elem.width / 2,
                    y : elem.getY() + elem.height / 2
                };
            },

            getX : function() {
                return this.group.getBBox().x;
            },

            getX2 : function() {
                return this.group.getBBox().x2;
            },

            getY : function() {
                return this.group.getBBox().y;
            },

            getY2 : function() {
                return this.group.getBBox().y2;
            },

            setChildBox : function(x, y, x2, y2) {
                if (x != null && y != null && x2 != null && y2 != null) {
                    this.childBox = {
                        x : x,
                        y : y,
                        x2 : x2,
                        y2 : y2
                    };
                } else if (this.childBox != null) {
                    if (x == null) {
                        x = this.childBox.x;
                    }
                    if (y == null) {
                        y = this.childBox.y;
                    }
                    if (x2 == null) {
                        x2 = this.childBox.x2;
                    }
                    if (y2 == null) {
                        y2 = this.childBox.y2;
                    }
                    this.childBox = {
                        x : x,
                        y : y,
                        x2 : x2,
                        y2 : y2
                    };
                }
            },

            shiftX : function(x) {
                this.group.transform('t' + (this.getX() + x) + ',' + this.getY());
            },

            setX : function(x) {
                this.group.transform('t' + x + ',' + this.getY());
            },

            shiftY : function(y) {
                this.group.transform('t' + this.getX() + ',' + (this.getY() + y));
            },

            setY : function(y) {
                this.group.transform('t' + this.getX() + ',' + y);
            },

            shift : function(x, y) {
                this.group.transform('t' + (this.getX() + x) + ',' + (this.getY() + y));
            },

            setRelativeTop : function(elem, x, y) {
                var elem_x = elem.group.getBBox().x;
                var elem_y = elem.group.getBBox().y;
                this.group.transform('t' + elem_x + ',' + (elem_y - y));
            },

            setRelativeLeft : function(elem, x, y) {
                var elem_x = elem.group.getBBox().x2;
                var elem_y = elem.group.getBBox().y;
                this.group.transform('t' + (elem_x + x) + ',' + elem_y);
            },

            setRelativeBottom : function(elem, x, y) {
                var elem_x = elem.group.getBBox().x;
                var elem_y = elem.group.getBBox().y2;
                this.group.transform('t' + elem_x + ',' + (elem_y + y));
            },

            setRelativeRight : function(elem, x, y) {
                var elem_x = elem.group.getBBox().x;
                var elem_y = elem.group.getBBox().y;
                this.group.transform('t' + (elem_x - x) + ',' + elem_y);
            },

            getTopAnchor : function() {
                var y = this.getY();
                var x = this.getX() + this.width / 2;
                return {
                    x : x,
                    y : y
                };
            },

            getBottomAnchor : function() {
                var y = this.getY() + this.height;
                var x = this.getX() + this.width / 2;
                return {
                    x : x,
                    y : y
                };
            },

            getLeftAnchor : function() {
                var y = this.getY() + this.group.getBBox().height / 2;
                var x = this.getX();
                return {
                    x : x,
                    y : y
                };
            },

            getRightAnchor : function() {
                var y = this.getY() + this.group.getBBox().height / 2;
                var x = this.getX() + this.group.getBBox().width;
                return {
                    x : x,
                    y : y
                };
            }
        };

        /**
         * The chart class
         */
        function FlowChart() {
            this.defaultOptions = {
                chart : {
                    //id:xxx
                    canvasId : "canvas",
                    height : 600,
                    width : 320,
                    cellpadding : 60
                },
                theme : {
                    srcPrefix : "./theme/default"
                },
            };

            var userOptions = arguments.length > 0 && arguments[0] || {};
            this.init(userOptions);

            //object nodes & hierarchy
            this.nodes = {};
            this.transitions = {};
            this.nodes_hierarchy = {};
            this.display_nodes = {};
            this.display_trans = {};
        };

        FlowChart.prototype = {
            /**
             * Initialize an individual series, called internally before render time
             */
            init : function(userOptions) {
                this.options = merge(this.defaultOptions, userOptions);
                // do the merge
                var chart = this.options.chart;
                this.id = chart.id || "jqflow";
            },

            parse : function(json) {
                //get all nodes
                for (var i = 0, l = json.workflow.activities.length; i < l; i++) {
                    var activity = json.workflow.activities[i];
                    this.nodes[activity.id] = {
                        id : activity.id,
                        name : activity.name,
                        type : activity.subtype,
                        index : activity.index,
                        outcome : activity.outcome,
                        status : activity.status,
                        disable:activity.disable
                    };
                }
                //get all nodes relationship
                var nodes_relations = {};
                var nodes_from_index_sq = [];
                for (var i = 0, l = json.workflow.transitions.length; i < l; i++) {
                    var trans = json.workflow.transitions[i];
                    this.transitions[trans.id] = {
                        id : trans.id,
                        name : trans.name,
                        type : trans.type,
                        from : trans.from,
                        to : trans.to
                    };
                    if (!nodes_relations.hasOwnProperty(trans.from)) {
                        nodes_relations[trans.from] = [];
                        nodes_from_index_sq.push([trans.from, this.nodes[trans.from].index]);
                    }
                    nodes_relations[trans.from].push(trans.to);
                }
                //sort the from nodes and get the
                nodes_from_index_sq.sort(function(a, b) {
                    return a[1] - b[1];
                });
                var nodes_from_sq = [];
                for (var i = 0, l = nodes_from_index_sq.length; i < l; i++) {
                    nodes_from_sq.push(nodes_from_index_sq[i][0]);
                }
                //build nodes hierarchy
                this.__build_nodes_hirerarchy(nodes_from_sq, this.nodes_hierarchy, nodes_relations);
                //check nodes not in the nodes_relations and insert to nodes hierarchy
                this.__check_nodes_notin_relationshipset(this.nodes, this.nodes_hierarchy, nodes_relations);
            },

            /**
             * Check nodes not in the nodes relationship set
             * @param {element} array element
             */
            __check_nodes_notin_relationshipset : function(nodes, nodes_hierarchy, nodes_relations) {
                var allNodesIds = [];
                for (var key in nodes) {
                    allNodesIds.push(key);
                }

                var allNodesInRelationshipSet = [];
                for (var key in nodes_relations) {
                    allNodesInRelationshipSet.push(key);
                    allNodesInRelationshipSet = allNodesInRelationshipSet.concat(nodes_relations[key]);
                }

                var allNodesNotInRelationshipSet = allNodesIds.diff(allNodesInRelationshipSet);
                for (var i = 0, l = allNodesNotInRelationshipSet.length; i < l; i++) {
                    nodes_hierarchy[allNodesNotInRelationshipSet[i]] = null;
                }
            },

            __build_nodes_hirerarchy : function(check_acti_keys, acti_hierarchy, trans) {
                while (check_acti_keys.length != 0) {
                    var key = check_acti_keys.shift();

                    var next_acti = trans[key];
                    var next_actis = [];
                    if ( typeof next_acti == "string") {
                        next_actis.push(next_acti);
                    } else if ( typeof next_acti == "object") {
                        next_actis = next_acti;
                    }

                    for (var ii = 0, l = next_actis.length; ii < l; ii++) {
                        //check next trans
                        var next_acti = next_actis[ii];
                        if (check_acti_keys.indexOf(next_acti) == -1) {
                            if (!acti_hierarchy.hasOwnProperty(key)) {
                                acti_hierarchy[key] = {};
                            }
                            //check the hierarchy
                            if (acti_hierarchy.hasOwnProperty(next_acti)) {
                                acti_hierarchy[key][next_acti] = acti_hierarchy[next_acti];
                                //remove the sub path from acti_hierarchy
                                delete acti_hierarchy[next_acti];
                            } else {
                                acti_hierarchy[key][next_acti] = null;
                            }
                        } else {
                            if (!acti_hierarchy.hasOwnProperty(key)) {
                                acti_hierarchy[key] = {};
                            }
                            acti_hierarchy[key][next_acti] = {};
                            this.__build_sub_hirerarchy(check_acti_keys, acti_hierarchy[key], acti_hierarchy, [key, next_acti], trans);
                        }
                    }
                }
            },

            __build_sub_hirerarchy : function(check_acti_keys, sub_hierarchy, acti_hierarchy, path_nodes, trans) {
                var key = "";
                if (path_nodes.length != 0) {
                    key = path_nodes[path_nodes.length - 1];
                    check_acti_keys.remove(key);
                } else {
                    key = check_acti_keys.shift();
                }

                var next_acti = trans[key];
                var next_actis = [];
                if ( typeof next_acti == "string") {
                    next_actis.push(next_acti);
                } else if ( typeof next_acti == "object") {
                    next_actis = next_acti;
                }

                for (var ii = 0, l = next_actis.length; ii < l; ii++) {
                    //check next trans
                    var next_acti = next_actis[ii];
                    if (path_nodes.indexOf(next_acti) != -1) {
                        continue;
                    }
                    if (check_acti_keys.indexOf(next_acti) == -1) {
                        if (!sub_hierarchy.hasOwnProperty(key)) {
                            sub_hierarchy[key] = {};
                        }
                        //check the hierarchy
                        if (acti_hierarchy.hasOwnProperty(next_acti)) {
                            sub_hierarchy[key][next_acti] = acti_hierarchy[next_acti];
                            //remove the sub path from acti_hierarchy
                            delete acti_hierarchy[next_acti];
                        } else {
                            sub_hierarchy[key][next_acti] = null;
                        }
                    } else {
                        if (!sub_hierarchy.hasOwnProperty(key)) {
                            sub_hierarchy[key] = {};
                        }
                        sub_hierarchy[key][next_acti] = {};
                        path_nodes = path_nodes.concat([next_acti]);
                        this.__build_sub_hirerarchy(check_acti_keys, sub_hierarchy[key], acti_hierarchy, path_nodes, trans);
                    }
                }
            },

            drawFlowChart : function(json) {
                this.clean();
                this.paper = new Raphael(this.options.chart.canvasId);
                this.parse(json);
                //clean paper
                //construct nodes in the paper.
                for (var key in this.nodes) {
                    var node = this.nodes[key];
                    this.display_nodes[key] = new Node(this.paper, node, this.options);
                }
                this.render();
            },

            clean : function() {
                if (this.paper) {
                    this.nodes = {};
                    this.transitions = {};
                    this.nodes_hierarchy = {};
                    this.display_nodes = {};
                    this.display_trans = {};
                    this.display_nodes = {};
                    this.display_trans = {};
                    this.resize();
                    this.paper.clear();
                }
            },

            reloadChart : function(json) {
                this.clean();
                this.drawFlowChart(json);
            },

            /**
             * render all nodes on the chart
             */
            __renderNodes : function(nodes_hierarchy, display_nodes, parent) {
                var siblingNum = 0;
                var cellpadding = this.options.chart.cellpadding;
                var cellpaddingX2 = 1.5 * cellpadding;
                var sibling;
                /**
                 * Todo: Sort the keys by node index
                 */
                for (var key in nodes_hierarchy) {
                    var children = nodes_hierarchy[key];
                    var display_node = display_nodes[key];
                    if (siblingNum == 0) {
                        //first node will be shift base on the parent
                        if (parent == null) {
                            display_node.shift(cellpadding, cellpadding);
                        } else {
                            display_node.setRelativeBottom(parent, cellpaddingX2, cellpaddingX2);
                            parent.setChildBox(display_node.getX(), display_node.getY(), display_node.getX2(), display_node.getY2());
                        }
                    } else {
                        //other nodes shift base on the sibling
                        if (sibling.childBox != null && sibling.getX2() < sibling.childBox.x2) {
                            cellpaddingX2 += (sibling.childBox.x2 - sibling.getX2());
                        } else {
                            cellpaddingX2 = 1.5 * cellpadding;
                        }
                        display_node.setRelativeLeft(sibling, cellpaddingX2, cellpaddingX2);
                        if (parent != null) {
                            parent.setChildBox(null, null, display_node.getX2(), display_node.getY2());
                            parent.shiftX(parent.childBox && (parent.childBox.x2 - parent.getX() - parent.width) / 2 || 0);
                        }
                    }
                    if (children != null) {
                        this.__renderNodes(children, display_nodes, display_node);
                        //inherit the child's childbox
                        if (parent != null && display_node.childBox != null) {
                            parent.setChildBox(null, null, display_node.childBox.x2, display_node.childBox.y2);
                            parent.shiftX(parent.childBox && (parent.childBox.x2 - parent.getX() - parent.width) / 2 || 0);
                        }
                    }
                    sibling = display_node;
                    siblingNum += 1;
                }
            },

            /**
             * Todo:
             * revise the node offset. make it more beautiful
             */
            __reviseNodesOffset : function(display_nodes) {
            },

            /**
             * render transition base on the display nodes position
             */
            __renderTransitons : function(display_nodes, display_trans, transitions) {
                for (var key in transitions) {
                    var transition = transitions[key];
                    display_trans[key] = new Transition(this.paper, display_nodes, transition, this.options);
                    display_trans[key].render();
                }
            },

            render : function() {
                var cellpadding = this.options.chart.cellpadding;
                var chartWidth = 0;
                var chartHeight = 0;
                //render node
                this.__renderNodes(this.nodes_hierarchy, this.display_nodes, null);
                this.__reviseNodesOffset(this.display_nodes);
                //render transition
                this.__renderTransitons(this.display_nodes, this.display_trans, this.transitions);

                //get the nodes the max chartwidth & chartheight
                for (var key in this.display_nodes) {
                    var node = this.display_nodes[key];
                    width = node.group.getBBox().x2;
                    chartWidth = chartWidth < width && width || chartWidth;
                    height = node.group.getBBox().y2;
                    chartHeight = chartHeight < height && height || chartHeight;
                }
                //get the transition the max chartwidth & chartheight
                for (var key in this.display_trans) {
                    var trans = this.display_trans[key];
                    width = trans.group.getBBox().x2;
                    chartWidth = chartWidth < width && width || chartWidth;
                    height = trans.group.getBBox().y2;
                    chartHeight = chartHeight < height && height || chartHeight;
                }
                this.paper.setSize(chartWidth + cellpadding, chartHeight + cellpadding);
            },
            
            resize:function() {
                var cellpadding = this.options.chart.cellpadding;
                var chartWidth = 0;
                var chartHeight = 0;
                //get the nodes the max chartwidth & chartheight
                for (var key in this.display_nodes) {
                    var node = this.display_nodes[key];
                    width = node.group.getBBox().x2;
                    chartWidth = chartWidth < width && width || chartWidth;
                    height = node.group.getBBox().y2;
                    chartHeight = chartHeight < height && height || chartHeight;
                }
                //get the transition the max chartwidth & chartheight
                for (var key in this.display_trans) {
                    var trans = this.display_trans[key];
                    width = trans.group.getBBox().x2;
                    chartWidth = chartWidth < width && width || chartWidth;
                    height = trans.group.getBBox().y2;
                    chartHeight = chartHeight < height && height || chartHeight;
                }
                this.paper.setSize(chartWidth + cellpadding, chartHeight + cellpadding);
            },

            /**
             * add new nodes event
             */
            addNewNode : function() {

            }
        };

        // global variables, register some function, this is API
        extend(jqFlow, {
            // Constructors
            FlowChart : FlowChart,
            product : 'jqFlow',
            version : '1.0.0'
        });

    }()); 