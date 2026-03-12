/**
 * AMD wrapper for html2canvas library
 * This allows html2canvas to be loaded via sap.ui.define
 */
sap.ui.define([], function() {
    'use strict';
    
    // Return the global html2canvas object that was loaded by the actual library
    return window.html2canvas;
});
