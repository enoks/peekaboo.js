/**
 * peekaboo v1.2.1
 * https://github.com/enoks/peekaboo.js
 *
 * Copyright 2019, Stefan Käsche
 * https://github.com/enoks
 *
 * Licensed under MIT
 * https://github.com/enoks/peekaboo.js/blob/master/LICENSE
 */

;
( function( context, definition ) {
    'use strict';

    // AMD module
    if ( typeof define === 'function' && define.amd ) {
        define( 'peekaboo', [], function() {
            return definition;
        } );
    } // CommonJS module
    else if ( typeof module === 'object' && typeof module.exports === 'object' ) {
        module.exports = definition;
    } else {
        context.peekaboo = definition;
    }
} )( this, function() {
    "use strict";

    var jobs = [], // array of all peekaboo() calls
        busy = false; // be patient

    // check jobs
    function peekaboo( i ) {
        // no jobs ... nothing to do
        if ( !jobs.length ) return;

        if ( !busy ) {
            // using window's requestAnimationFrame for throttle/debounce
            if ( !!window.requestAnimationFrame ) return busy = window.requestAnimationFrame( peekaboo.bind( peekaboo, i ) );
            else busy = true;
        }
        else if ( !window.requestAnimationFrame ) return;

        // collect window's top, bottom, left and right
        var wt = window.pageYOffset,
            wb = wt + ( Math.max( document.documentElement.clientHeight, window.innerHeight || 0 ) ),
            wl = window.pageXOffset,
            wr = wl + ( Math.max( document.documentElement.clientWidth, window.innerWidth || 0 ) );

        // loop through jobs
        jobs.forEach( function( job, j ) {
            // specific job is requested (on init of job)
            if ( ( typeof i === 'number' && i !== j ) ) return;

            // loop through job elements
            job.$.forEach( function( $element, i ) {
                if ( !$element ) return job.$[i] = null;

                // collect element's top, bottom, left and right
                var et = $element.getBoundingClientRect().top + window.pageYOffset - document.documentElement.clientTop,
                    eb = et + $element.clientHeight,
                    el = $element.getBoundingClientRect().left + window.pageXOffset - document.documentElement.clientLeft,
                    er = el + $element.clientWidth;

                // check if element is in viewport
                // ... or should be loaded anyway
                if ( job.options.loadInvisible === true ||
                    ( ( job.options.loadInvisible == 'vertical' || eb >= wt - job.options.threshold && et <= wb + job.options.threshold ) &&
                        ( job.options.loadInvisible == 'horizontal' || er >= wl - job.options.threshold && el <= wr + job.options.threshold ) )
                ) {
                    if ( job.options[ 'class' ] && $element.className.split( / +/ ).indexOf( job.options[ 'class' ].trim() ) < 0 )
                        $element.className = ( $element.className += ' ' + job.options[ 'class' ].trim() ).trim();

                    job.options.callback.call( $element, job.options );

                    // don't need element anymore
                    job.$[i] = null;
                }
            } );

            // note: splice inside the forEach loop interferes with the array key :/ ... so:
            // remove peekaboo'ed elements
            job.$ = job.$.filter( function( item ) {
                return item;
            } );
        } );

        // remove completed jobs
        jobs = jobs.filter( function( job ) {
            return job.$.length;
        } );

        // release the function again
        if ( typeof busy == 'boolean') setTimeout( function () {
            busy = false;
        }, 16 );
        else busy = false;
    }

    var supportsEventOptions = false;
    // determines if event listeners support options instead of only boolean (useCapture)
    // @link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    try { window.addEventListener('test', null, Object.defineProperty({}, 'passive', { get: function() { supportsEventOptions = true; } }));
    } catch(err) {}

    // listen carefully my friend
    window.addEventListener( 'load', peekaboo, supportsEventOptions ? {once: true, passive: true} : false );
    window.addEventListener( 'scroll', peekaboo, supportsEventOptions ? {passive: true} : false );
    window.addEventListener( 'resize', peekaboo, supportsEventOptions ? {passive: true} : false );

    /**
     * @param string|NodeList|HTMLCollection|HTML...Element $elements
     * @param object|function oSettings
     */
    return function( $elements, oSettings ) {
        if ( !$elements ) return;

        if ( typeof $elements === 'string' ) $elements = document.querySelectorAll( $elements );
        else if ( $elements instanceof HTMLElement ) $elements = [ $elements ];

        if ( !$elements.length ) return;

        // make sure to have an array
        $elements = Array.prototype.slice.call( $elements );

        // callback shortcut
        if ( typeof oSettings === 'function' ) oSettings = {
            callback: oSettings
        };

        // default options
        var oOptions = {
            threshold: 0,
            loadInvisible: false,
            'class': 'peekaboo',
            callback: function( oOptions ) {}
        };

        // merge options aka settings
        if ( Object.prototype.toString.call( oSettings ) === '[object Object]' ) {
            for ( var option in oSettings ) {
                if ( !oSettings.hasOwnProperty( option ) ) continue;

                if ( option == 'loadInvisible' ) {
                    switch ( ( oSettings[ option ] + '' ).toLowerCase() ) {
                        case 'true':
                        case '1':
                            oSettings[ option ] = true;
                            break;

                        case 'horizontal':
                        case 'x':
                            oSettings[ option ] = 'horizontal';
                            break;

                        case 'vertical':
                        case 'y':
                            oSettings[ option ] = 'vertical';
                            break;

                        default:
                            continue;
                    }
                }
                // check expected vs send option value type
                else switch ( typeof oOptions[ option ] ) {
                    case 'undefined':
                        // custom option ... just pass through
                        break;

                    default:
                        // compare types
                        if ( typeof oOptions[ option ] !== typeof oSettings[ option ] ) {
                            console.debug( "Passed value for option '" + option + "' (type of " + typeof oSettings[ option ] + ") doesn't match expected value type (" + typeof oOptions[ option ] + ")." );
                            continue;
                        }
                        break;

                    case 'number':
                        oSettings[ option ] = parseFloat( oSettings[ option ] );
                        if ( isNaN( oSettings[ option ] ) ) {
                            console.debug( "Passed value for option '" + option + "' isn't of type number at all." );
                            continue;
                        }
                        break;
                }

                // override/extend oOptions
                oOptions[ option ] = oSettings[ option ];
            }
        }

        // add call to array of jobs
        jobs.push( {
            $: $elements,
            options: oOptions
        } );

        // initial call
        peekaboo( jobs.length - 1 );
    };

}() );