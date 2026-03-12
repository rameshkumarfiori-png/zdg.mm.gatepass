/**
 * AMD wrapper for jsPDF library
 * This allows jsPDF to be loaded via sap.ui.define
 */
sap.ui.define([], function() {
    'use strict';
    
    // Return the global jsPDF object that was loaded by the actual library
    return window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
});
