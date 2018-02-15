/**
 * peekaboo v1.1.2
 * https://github.com/enoks/peekaboo.js
 *
 * Copyright 2017, Stefan Käsche
 * https://github.com/enoks
 *
 * Licensed under GNU GENERAL PUBLIC LICENSE Version 3
 * https://github.com/enoks/peekaboo.js/blob/master/LICENSE
 */

;
(function ( context, definition ) {
    'use strict';

    // AMD module
    if ( typeof define === 'function' && define.amd ) {
        define( 'peekaboo', [], function () {
            return definition;
        } );
    } // CommonJS module
    else if ( typeof module === 'object' && typeof module.exports === 'object' ) {
        module.exports = definition;
    } else {
        window.peekaboo = definition;
    }
})( this, function () {
    "use strict";

    var jobs = [], // array of all calls
        busy = false; // be patient

    // check jobs
    function peekaboo( i ) {
        if ( !jobs.length || busy ) return;
        busy = true;

        // collect window's top, bottom, left and right
        var wt = window.pageYOffset,
            wb = wt + (Math.max( document.documentElement.clientHeight, window.innerHeight || 0 )),
            wl = window.pageXOffset,
            wr = wl + (Math.max( document.documentElement.clientWidth, window.innerWidth || 0 ));

        // loop through jobs
        jobs.forEach( function ( job, j ) {
            // specific job is requested (on init of job)
            if ( typeof i === 'number' && i !== j ) return;

            // loop through job elements
            job.$.forEach( function ( $element, i ) {
                if ( !$element ) return delete job.$[i];

                // collect element's top, bottom, left and right
                var et = $element.getBoundingClientRect().top + window.pageYOffset - document.documentElement.clientTop,
                    eb = et + $element.clientHeight,
                    el = $element.getBoundingClientRect().left + window.pageXOffset - document.documentElement.clientLeft,
                    er = el + $element.clientWidth;

                // check if element is in viewport
                // or should be loaded anyway
                if ( job.options.loadInvisible === true
                    || ((job.options.loadInvisible == 'vertical' || eb >= wt - job.options.threshold && et <= wb + job.options.threshold)
                        && (job.options.loadInvisible == 'horizontal' || er >= wl - job.options.threshold && el <= wr + job.options.threshold))
                ) {
                    if ( job.options['class'] && $element.className.indexOf( job.options['class'] ) < 0 ) $element.className += ' ' + job.options['class'];
                    job.options.callback.call( $element, job.options );

                    // don't need this anymore
                    delete job.$[i];
                }
            } );

            // clean jobs from completed ones
            if ( (job.$ = job.$.filter( function ( $element ) {
                    return $element;
                } )) && !job.$.length )
                jobs.splice( i, 1 );
        } );

        setTimeout( function () {
            busy = false;
        }, 200 );
    }

    // listen carefully my friend
    window.addEventListener( 'load', peekaboo );
    window.addEventListener( 'scroll', peekaboo );
    window.addEventListener( 'resize', peekaboo );

    /**
     * @param string|NodeList|HTMLCollection|HTML...Element $elements
     * @param object|function oSettings
     */
    return function ( $elements, oSettings ) {
        if ( !$elements ) return;

        if ( typeof $elements === 'string' ) $elements = document.querySelectorAll( $elements );
        else if ( $elements instanceof HTMLElement ) $elements = [$elements];

        if ( !$elements.length ) return;

        // make sure to have an array
        $elements = Array.prototype.slice.call( $elements );

        // callback shortcut
        if ( typeof oSettings === 'function' ) {
            oSettings = { callback: oSettings };
        }

        // default options
        var oOptions = {
            threshold: 0,
            loadInvisible: false,
            'class': 'peekaboo',
            callback: function ( oOptions ) {
            }
        };

        // merge options aka settings
        if ( Object.prototype.toString.call( oSettings ) === '[object Object]' ) {
            for ( var option in oSettings ) {
                if ( !oSettings.hasOwnProperty( option ) ) continue;

                if ( option == 'loadInvisible' ) {
                    switch ( (oSettings[option] + '').toLowerCase() ) {
                        case 'true':
                        case '1':
                            oSettings[option] = true;
                            break;

                        case 'horizontal':
                        case 'x':
                            oSettings[option] = 'horizontal';
                            break;

                        case 'vertical':
                        case 'y':
                            oSettings[option] = 'vertical';
                            break;

                        default:
                            continue;
                    }
                }
                // check expected vs send option value type
                else switch ( typeof oOptions[option] ) {
                    case 'undefined':
                        // custom option ... just pass through
                        break;

                    default:
                        // compare types
                        if ( typeof oOptions[option] !== typeof oSettings[option] ) {
                            console.debug( "Passed value for option '" + option + "' (type of " + typeof oSettings[option] + ") doesn't match expected value type (" + typeof oOptions[option] + ")." );
                            continue;
                        }
                        break;

                    case 'number':
                        oSettings[option] = parseFloat( oSettings[option] );
                        if ( isNaN( oSettings[option] ) ) {
                            console.debug( "Passed value for option '" + option + "' isn't of type number at all." );
                            continue;
                        }
                        break;
                }

                // override/extend oOptions
                oOptions[option] = oSettings[option];
            }
        }

        jobs.push( {
            $: $elements,
            options: oOptions
        } );

        // initial call
        peekaboo( jobs.length - 1 );
    };

}() );