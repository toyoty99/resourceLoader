/*!
 * resourceLoader v1.0.0 *
 *
 * Copyright (c) 2015 @toyoty99.
 * Licensed under the MIT license.
 */

(function(window){
    if(!window.resourceLoader){
        /**
         * ResourceLoader class
         *
         * @class ResourceLoader
         */
        var ResourceLoader = (function() {
            /**
             * header element (or document element)
             *
             * @property header
             * @type Object
             */
            var header;
            /**
             * a map of whether resource is loaded or not
             *
             * @property loaded
             * @type Object
             */
            var loaded ={};
            /**
             * a map of callbacks whick will be invoked when resource is loaded
             *
             * @property callbacks
             * @type Object
             */
            var callbacks ={};
            /**
             * default options
             *
             * @property defaults
             * @type Object
             */
            var defaults ={
                regexpCss: /\.css\b|_css\b/,
                regexpJs: /\.js\b|_js\b/
            };

            /**
             * constructor
             *
             * @class ResourceLoader
             * @constructor
             */
            var ResourceLoader = function() {
                header  = document.getElementsByTagName("head")[0] || document.documentElement;
            };

            /**
             * add new element to header
             *
             * @method appendElement
             * @private
             * @param  {String}   type       a type of element
             * @param  {Object}   attributes attributes of element
             * @param  {Function} callback   callback function whick will be invoked when element is loaded
             */
            var appendElement = function(type, attributes, callback) {
                console.log("ResourceLoader.appendElement");
                var element = document.createElement(type);
                if (callback) {
                    if (element.readyState) {
                        element.onreadystatechange = function() {
                            if (element.readyState === "loaded" || element.readyState === "complete") {
                                element.onreadystatechange = null;
                                callback();
                            }
                        };
                    } else {
                        element.onload = callback;
                    }
                }
                for (var i in attributes) {
                    attributes[i] && (element[i] = attributes[i]);
                }
                console.log("element=", element);
                header.appendChild(element);
            };

            /**
             * load resources in serial
             *
             * arguments is supposed as follows:<br/>
             *   ["url1", "url2", ... "urlN", callback]<br/>
             *      or<br/>
             *   [["url1", "url2", ... "urlN"], callback]<br/>
             *      or<br/>
             *   combination of the above<br/>
             *
             * @method load
             * @private
             * @param {Object} ...urlAndCallback resource urls and callback
             * @return the instance of loader
             */
            var loadInSerial = function(){
                console.log("ResourceLoader.loadInSerial");
                console.log("arguments=", arguments);
                var args = arguments;
                var length = args.length;
                if (length === 0) {
                    return this;
                } else if (length === 1 && args[0] instanceof Function) {
                    args[0]();
                    return this;
                }
                var callback;
                if (length > 1) {
                    var that = this;
                    callback = function(){
                        loadInSerial.apply(
                            that,
                            [].slice.call(args, 1));
                    };
                }
                loadInParallel.call(
                    this,
                    args[0],
                    callback);
                return this;
            };

            /**
             * load resources in parallel
             *
             * @method loadInParallel
             * @private
             * @param  {String|Array}  url url(s) of resource
             * @param  {Function} callback callback function whick will be invoked when resource is loaded
             */
            var loadInParallel = function(url, callback){
                console.log("ResourceLoader.loadInParallel");
                console.log("url=", url);
                console.log("callback=", callback);
                if (url instanceof Array) {
                    // load in parallel
                    for (var i = 0; i < url.length; i++) {
                        loadResource(url[i]);
                    }
                    callback && url.push(callback);
                    // invoke callback-chain to ensure that all resources are loaded
                    loadInSerial.apply(this, url);
                } else {
                    loadResource(url, callback);
                }
            };

            /**
             * load resource
             *
             * @method loadResource
             * @private
             * @param  {String}   url      url of resource
             * @param  {Function} callback callback function whick will be invoked when resource is loaded
             */
            var loadResource = function(url, callback){
                console.log("ResourceLoader.loadResource");
                console.log("url=", url);
                console.log("callback=", callback);
                if (url.match(defaults.regexpCss)) {
                    loadCss(url, callback);
                } else if (url.match(defaults.regexpJs)) {
                    loadJs(url, callback);
                }
            };

            /**
             * load JavaScript
             *
             * @method loadJs
             * @private
             * @param  {String}   url      url of JavaScript
             * @param  {Function} callback callback function whick will be invoked when resource is loaded
             */
            var loadJs = function(url, callback){
                console.log("ResourceLoader.loadJs");
                console.log("url=", url);
                console.log("callback=", callback);
                console.log("callbacks[url]=", callbacks[url]);
                if (loaded[url] === true ) {
                    // already loaded
                    callback && callback();
                } else if (callbacks[url] !== undefined) {
                    // callbacks[url] is already registered
                    // (secandary or nth asking for loading the script)
                    if (callback) {
                        callbacks[url] = (function(originalCb, cb){
                            return function(){
                                // original callback function
                                originalCb();
                                // additional callback function
                                cb();
                            };
                        })(callbacks[url], callback);
                    }
                } else {
                    // first asking for loading the script
                    callbacks[url] = (function(cb){
                        return function() {
                            loaded[url] = true;
                            cb && cb();
                        };
                    })(callback);
                    appendElement(
                        "script",
                        {
                            type: "text/javascript",
                            src: url
                        },
                        function() {
                            callbacks[url]();
                        });
                }
            };

            /**
             * load Style Sheet
             *
             * @method loadCss
             * @private
             * @param  {String}   url      url of Style Sheet
             * @param  {Function} callback callback function whick will be invoked when resource is loaded
             */
            var loadCss = function(url, callback){
                console.log("ResourceLoader.loadCss");
                console.log("url=", url);
                console.log("callback=", callback);
                if (loaded[url] !== true ) {
                    appendElement(
                        "link",
                        {
                            type: "text/css",
                            rel:"stylesheet",
                            href: url
                        });
                }
                loaded[url] = true;
                callback && callback();
            };

            /**
             * load resources
             *
             * arguments is supposed as follows:<br/>
             *   ["url1", "url2", ... "urlN", callback]<br/>
             *      or<br/>
             *   [["url1", "url2", ... "urlN"], callback]<br/>
             *      or<br/>
             *   combination of the above
             *
             * @method load
             * @param {Object} ...urlAndCallback resource urls and callback
             * @return the instance of loader
             */
            ResourceLoader.prototype.load = function(){
                console.log("ResourceLoader.load");
                console.log("arguments=", arguments);
                loadInSerial.apply(
                    this,
                    arguments);
                return this;
            };

            /**
             * configure loader
             *
             * @method config
             * @param  {Object} options ResourceLoader options
             * @return the instance of loader
             */
            ResourceLoader.prototype.config = function(options){
                console.log("options=", options);
                if (options) {
                    for (name in options) {
                        value = options[name];
                        if (value) {
                            // shallow copy
                            defaults[name] = value;
                        }
                    }
                }
                console.log("defaults=", defaults);
                return this;
            };

            return ResourceLoader;
        })();

        window.resourceLoader = new ResourceLoader();
    }
})(window);
