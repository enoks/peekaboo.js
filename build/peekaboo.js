/**
 * peekaboo v1.0.1
 * https://github.com/enoks/peekaboo.js
 *
 * Copyright 2016, Stefan Käsche
 * https://github.com/enoks
 *
 * Licensed under GNU GENERAL PUBLIC LICENSE Version 3
 * https://github.com/enoks/peekaboo.js/blob/master/LICENSE
 */

;
(function(context, definition) {
    'use strict';

    // AMD module
    if (typeof define === 'function' && define.amd) {
        define('peekaboo', [], function() {
            return definition;
        });
    } // CommonJS module
    else if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = definition;
    } else {
        window.peekaboo = definition;
    }
})(this, function(undefined) {
    "use strict";

    /**
     * @param string|NodeList|HTMLCollection|HTML...Element $elements
     * @param object|function oSettings
     */
    return function($elements, oSettings) {
        if (!$elements) return;

        if (typeof $elements === 'string') $elements = document.querySelectorAll($elements);
        else if (typeof $elements.length == 'undefined') $elements = [$elements];

        if (!$elements.length) return;

        // make sure to have an array
        var arrayOfElements = [];
        for (var i = 0; i < $elements.length; i++) {
            arrayOfElements.push($elements[i]);
        }
        $elements = arrayOfElements;

        // callback shortcut
        if (typeof oSettings === 'function') {
            oSettings = {callback: oSettings};
        }

        // default options
        var oOptions = {
            threshold: 0,
            'class': 'peekaboo',
            callback: function(oOptions) {}
        };

        // merge options aka settings
        if (Object.prototype.toString.call(oSettings) === '[object Object]') {
            for (var option in oSettings) {
                if (!oSettings.hasOwnProperty(option)) continue;

                // check expected vs send option value type
                switch (typeof oOptions[option]) {
                    case 'undefined':
                        // custom option ... just pass through
                        break;

                    default:
                        // compare types
                        if (typeof oOptions[option] !== typeof oSettings[option]) {
                            console.debug("Passed value for option '" + option + "' (type of " + typeof oSettings[option] + ") doesn't match expected value type (" + typeof oOptions[option] + ").");
                            continue;
                        }
                        break;

                    case 'number':
                        oSettings[option] = parseFloat(oSettings[option]);
                        if (isNaN(oSettings[option])) {
                            console.debug("Passed value for option '" + option + "' isn't of type number at all.");
                            continue;
                        }
                        break;
                }

                // override/extend oOptions
                oOptions[option] = oSettings[option];
            }
        }

        // be patient
        var busy = false;

        function peekaboo() {
            if (busy || !$elements.length) return;

            busy = true;

            $elements.forEach(function($element, i) {
                if ($element == undefined || $element.className.indexOf(oOptions['class']) >= 0) return;

                // collect window's and element's top and bottom
                var wt = window.pageYOffset,
                    wb = wt + (Math.max(document.documentElement.clientHeight, window.innerHeight || 0)),
                    et = $element.getBoundingClientRect().top + window.pageYOffset - document.documentElement.clientTop,
                    eb = et + $element.clientHeight;

                // check if element is in viewport
                if (eb >= wt - oOptions.threshold && et <= wb + oOptions.threshold) {
                    $element.className += ' ' + oOptions['class'];
                    oOptions.callback.call($element, oOptions);

                    // don't need this anymore
                    delete $elements[i];
                }
            });

            busy = false;
        }

        // listen carefully my friend
        window.addEventListener('load', peekaboo);
        window.addEventListener('scroll', peekaboo);
        window.addEventListener('resize', peekaboo);

        // initial call
        peekaboo();
    };

}());