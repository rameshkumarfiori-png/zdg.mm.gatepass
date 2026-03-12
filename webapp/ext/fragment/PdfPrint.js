sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/model/Filter"
], function(MessageToast, Filter) {
    'use strict';

    return {
        /**
         * Generate PDF entirely with native HTML/JavaScript
         * No SAP UI5 XML fragment - pure DOM approach
         * A4 Landscape format, clean table layout
         */
        onPress: async function(oEvent) {
            try {
                if (this.setBusy) {
                    this.setBusy(true);
                }

                // Get the current binding context (header)
                const oView = this.editFlow.getView();
                const oModel = oView.getModel();
                const oHeaderContext = oView.getBindingContext();
                
                let headerData = {};
                let itemsData = [];
                let eventsData = [];

                debugger;

                // Fetch header data
                if (oHeaderContext) {
                    headerData = oHeaderContext.getObject() || {};
                    
                    // Fetch items data from navigation property
                    try {
                        const oListBinding = oHeaderContext.getModel().bindList(
                            "_item",           // Navigation property name
                            oHeaderContext,       // Header context
                            null,                 // Sorters
                            null,                 // Filters
                            null
                        );

                        const aItemContexts = await oListBinding.requestContexts();
                        itemsData = aItemContexts.map(ctx => ctx.getObject());
                        const a='';
                    } catch (itemError) {
                        console.warn("Could not fetch items from OData:", itemError);
                        itemsData = [];
                    }
                    debugger;
                    // Fetch events data from navigation property with filter
                    try {
                        const oEventsBinding = oHeaderContext.getModel().bindList(
                            "_event",                    // Navigation property name
                            oHeaderContext,              // Header context
                            null,                        // Sorters
                            null, //[new Filter("Event", "BT", "01", "04")], // Filter for events 01-04
                            null
                        );

                        const aEventContexts = await oEventsBinding.requestContexts();
                        eventsData = aEventContexts.map(ctx => ctx.getObject());
                    } catch (eventError) {
                        console.warn("Could not fetch events from OData:", eventError);
                        eventsData = [];
                    }
                } else {
                    console.warn("No binding context found");
                }

                // Utility functions
                const escape = function(str) {
                    if (!str) return '';
                    const div = document.createElement('div');
                    div.textContent = str;
                    return div.innerHTML;
                };

                const formatDate = function(date) {
                    if (!date) return '';
                    if (typeof date === 'string') {
                        const d = new Date(date);
                        if (isNaN(d.getTime())) return date;
                        return d.toLocaleDateString('en-GB');
                    }
                    if (date instanceof Date) {
                        return date.toLocaleDateString('en-GB');
                    }
                    return '';
                };

                const formatNumber = function(num) {
                    if (!num && num !== 0) return '';
                    return parseFloat(num).toFixed(3);
                };

                const formatDateTime = function(dateTime) {
                    if (!dateTime) return '';
                    if (typeof dateTime === 'string') {
                        const d = new Date(dateTime);
                        if (isNaN(d.getTime())) return dateTime;
                        const dateStr = d.toLocaleDateString('en-GB');
                        const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        return `${dateStr} ${timeStr}`;
                    }
                    if (dateTime instanceof Date) {
                        const dateStr = dateTime.toLocaleDateString('en-GB');
                        const timeStr = dateTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        return `${dateStr} ${timeStr}`;
                    }
                    return '';
                };

                // Generate item rows HTML
                const generateItemRows = function(items) {
                    if (!items || items.length === 0) {
                        return '<tr><td colspan="9" style="border-bottom:1px solid #000;padding:4px;text-align:center;">No items</td></tr>';
                    }
                    return items.map(item => `
                        <tr>
                            <td style="border-bottom:1px solid #000;padding:4px;">${escape(item.LineItem || '')}</td>
                            <td style="border-bottom:1px solid #000;padding:4px;">${escape(item.ReferDoc || '')}</td>
                            <td style="border-bottom:1px solid #000;padding:4px;">${escape(item.ReferItm || '')}</td>
                            <td style="border-bottom:1px solid #000;padding:4px;">${escape(item.Product || '')}</td>
                            <td style="border-bottom:1px solid #000;padding:4px;">${escape(item.ProductDesc || '')}</td>
                            <td style="border-bottom:1px solid #000;padding:4px;text-align:right;">${formatNumber(item.Quantity)}</td>
                            <td style="border-bottom:1px solid #000;padding:4px;">${escape(item.ProductPkg || '')}</td>
                            <td style="border-bottom:1px solid #000;padding:4px;text-align:right;">${formatNumber(item.QuantityPkg)}</td>
                            <td style="border-bottom:1px solid #000;padding:4px;text-align:right;">${formatNumber(item.PackageWeight)}</td>
                        </tr>
                    `).join('');
                };

                // Generate event rows HTML
                const generateEventRows = function(events) {
                    if (!events || events.length === 0) {
                        return '<tr><td colspan="3" style="border-bottom:1px solid #000;padding:4px;text-align:center;">No events</td></tr>';
                    }
                    return events.map(event => `
                        <tr>
                            <td style="border-bottom:1px solid #000;padding:4px;">${escape(event.Event || '')}</td>
                            <td style="border-bottom:1px solid #000;padding:4px;">${escape(event.EventDesc || '')}</td>
                            <td style="border-bottom:1px solid #000;padding:4px;text-align:left;">${formatDateTime(event.TimestampR)}</td>
                        </tr>
                    `).join('');
                };
                debugger;
                // Generate PDF HTML
                const itemRows = generateItemRows(itemsData);
                const eventRows = generateEventRows(eventsData);
                const htmlContent = `
                    <div style="width:100%;margin:0;padding:0;font-size:12px;">
                        <!-- Company Header -->
                        <div style="text-align:center;margin-bottom:10px;">
                            <div style="font-weight:bold;font-size:16px;">Shivani Detergents Pvt. Ltd</div>
                            <div style="font-size:14px;margin-top:4px;">${escape(headerData.PlantName || '')}</div>
                            <div style="font-weight:bold;font-size:14px;margin-top:4px;">Material Note ${escape(headerData.Document || '')}</div>
                        </div>

                        <!-- Separator Line -->
                        <hr style="border:none;border-top:2px solid #000;margin:6px 0;padding:0;">

                        <!-- Master Data Section -->
                        <div style="margin-bottom:10px;">
                            <table style="width:100%;border-collapse:collapse;">
                                <tr>
                                    <td style="width:50%;padding:4px 0;vertical-align:top;border-bottom:1px solid #000;">
                                        <div style="display:flex;margin-bottom:3px;font-size:11px;">
                                            <span style="width:40%;font-weight:bold;">Business Partner</span>
                                            <span style="width:5%;text-align:center;">:</span>
                                            <span style="flex:1;">${escape(headerData.bpName || '')}(${escape(headerData.Partner || '')})</span>
                                        </div>
                                        <div style="display:flex;margin-bottom:3px;font-size:11px;">
                                            <span style="width:40%;font-weight:bold;">Direction</span>
                                            <span style="width:5%;text-align:center;">:</span>
                                            <span style="flex:1;">${escape(headerData.DirDesc || '')}(${escape(headerData.Direction || '')})</span>
                                        </div>
                                        <div style="display:flex;font-size:11px;">
                                            <span style="width:40%;font-weight:bold;">Date</span>
                                            <span style="width:5%;text-align:center;">:</span>
                                            <span style="flex:1;">${formatDate(headerData.TimestampCr)}</span>
                                        </div>
                                    </td>
                                    <td style="width:50%;padding:4px 0 4px 15px;vertical-align:top;border-bottom:1px solid #000;border-left:1px solid #000;">
                                        <div style="display:flex;margin-bottom:3px;font-size:11px;">
                                            <span style="width:40%;font-weight:bold;">Vehicle Number</span>
                                            <span style="width:5%;text-align:center;">:</span>
                                            <span style="flex:1;">${escape(headerData.VehicleNo || '')}</span>
                                        </div>
                                        <div style="display:flex;font-size:11px;">
                                            <span style="width:40%;font-weight:bold;">Driver Name</span>
                                            <span style="width:5%;text-align:center;">:</span>
                                            <span style="flex:1;">${escape(headerData.Name || '')}</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- Separator Line -->
                        <hr style="border:none;border-top:2px solid #000;margin:6px 0;padding:0;">

                        <!-- Items Table -->
                        <div style="margin:10px 0;">
                            <div style="font-weight:bold;font-size:12px;margin-bottom:6px;">Item Details</div>
                            <table style="width:100%;border-collapse:collapse;border:1px solid #000;font-size:10px;">
                                <thead>
                                    <tr style="background-color:#f5f5f5;">
                                        <th style="border:1px solid #000;padding:4px;text-align:left;font-weight:bold;width:6%;">Item</th>
                                        <th style="border:1px solid #000;padding:4px;text-align:left;font-weight:bold;width:11%;">Ref Doc</th>
                                        <th style="border:1px solid #000;padding:4px;text-align:left;font-weight:bold;width:7%;">Ref Item</th>
                                        <th style="border:1px solid #000;padding:4px;text-align:left;font-weight:bold;width:11%;">Product</th>
                                        <th style="border:1px solid #000;padding:4px;text-align:left;font-weight:bold;width:13%;">Product Desc</th>
                                        <th style="border:1px solid #000;padding:4px;text-align:left;font-weight:bold;width:9%;">Qty</th>
                                        <th style="border:1px solid #000;padding:4px;text-align:left;font-weight:bold;width:11%;">Pkg Product</th>
                                        <th style="border:1px solid #000;padding:4px;text-align:left;font-weight:bold;width:8%;">Pkg Qty</th>
                                        <th style="border:1px solid #000;padding:4px;text-align:left;font-weight:bold;width:9%;">Pkg Weight</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemRows}
                                </tbody>
                            </table>
                        </div>

                        <!-- Separator Line -->
                        <hr style="border:none;border-top:2px solid #000;margin:6px 0;padding:0;">

                        <!-- Event Details Section -->
                        <div style="margin:10px 0;">
                            <div style="font-weight:bold;font-size:12px;margin-bottom:6px;">Event Details</div>
                            <table style="width:100%;border-collapse:collapse;border:1px solid #000;font-size:10px;">
                                <thead>
                                    <tr style="background-color:#f5f5f5;">
                                        <th style="border:1px solid #000;padding:4px;text-align:left;font-weight:bold;width:15%;">Event</th>
                                        <th style="border:1px solid #000;padding:4px;text-align:left;font-weight:bold;width:35%;">Description</th>
                                        <th style="border:1px solid #000;padding:4px;text-align:left;font-weight:bold;width:50%;">Time Stamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${eventRows}
                                </tbody>
                            </table>
                        </div>

                        <!-- Separator Line -->
                        <hr style="border:none;border-top:2px solid #000;margin:6px 0;padding:0;">

                        <!-- Weight Details Section -->
                        <div style="margin:10px 0;">
                            <div style="font-weight:bold;font-size:12px;margin-bottom:6px;">Weight Details (in KG.)</div>
                            <table style="width:100%;border-collapse:collapse;">
                                <tr>
                                   <td style="width:33%;padding:4px 0 4px 15px;border-bottom:1px solid #000;border-left:1px solid #000;">
                                        <div style="display:flex;margin-bottom:2px;font-size:11px;">
                                            <span style="font-weight:bold;">Weighment at Entry:</span>
                                        </div>
                                        <div style="font-size:11px;color:#0066cc;">${escape(headerData.WeightWb1 || '')}</div>
                                    </td>
                                    <td style="width:33%;padding:4px 0 4px 15px;border-bottom:1px solid #000;border-left:1px solid #000;">
                                        <div style="display:flex;margin-bottom:2px;font-size:11px;">
                                            <span style="font-weight:bold;">Net Weight:</span>
                                        </div>
                                        <div style="font-size:11px;color:#0066cc;">${escape(headerData.WeightNet || '')}</div>
                                    </td>
                                    <td style="width:33%;padding:4px 0 4px 15px;border-bottom:1px solid #000;border-left:1px solid #000;">
                                        <div style="display:flex;margin-bottom:2px;font-size:11px;">
                                            <span style="font-weight:bold;">Deviation Weight:</span>
                                        </div>
                                        <div style="font-size:11px;color:#0066cc;">${escape(headerData.WeightDev || '')}</div>
                                    </td>

                                </tr>
                                <tr>
                                    <td style="width:33%;padding:4px 0 4px 15px;border-bottom:1px solid #000;border-left:1px solid #000;">
                                        <div style="display:flex;margin-bottom:2px;font-size:11px;">
                                            <span style="font-weight:bold;">Weighment at Exit:</span>
                                        </div>
                                        <div style="font-size:11px;color:#0066cc;">${escape(headerData.WeightWb2 || '')}</div>
                                    </td>
                                    <td style="width:33%;padding:4px 0 4px 15px;border-bottom:1px solid #000;border-left:1px solid #000;">
                                        <div style="display:flex;margin-bottom:2px;font-size:11px;">
                                            <span style="font-weight:bold;">Gross Weight:</span>
                                        </div>
                                        <div style="font-size:11px;color:#0066cc;">${escape(headerData.WeightGross || '')}</div>
                                    </td>
                                    <td style="width:33%;padding:4px 0 4px 15px;border-bottom:1px solid #000;border-left:1px solid #000;">
                                        <div style="display:flex;margin-bottom:2px;font-size:11px;">
                                            <span style="font-weight:bold;">Shortage:</span>
                                        </div>
                                        <div style="font-size:11px;color:#0066cc;">${escape(headerData.WeightShortage || '')}</div>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- Signature Section -->
                        <div style="margin-top:20px;margin-bottom:10px;">
                            <table style="width:100%;border-collapse:collapse;text-align:center;">
                                <tr>
                                    <td style="width:33%;padding-top:30px;">
                                        ___________________________<br>
                                        <span style="font-size:11px;">Driver Signature</span>
                                    </td>
                                    <td style="width:33%;padding-top:30px;">
                                        ___________________________<br>
                                        <span style="font-size:11px;">Security Signature</span>
                                    </td>
                                    <td style="width:33%;padding-top:30px;">
                                        ___________________________<br>
                                        <span style="font-size:11px;">Authorized Signature</span>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- Separator Line -->
                        <hr style="border:none;border-top:2px solid #000;margin:6px 0;padding:0;">
                    </div>
                `;

                // Create container with fixed A4 landscape dimensions
                const pdfContainer = document.createElement('div');
                pdfContainer.id = 'pdfRenderContainer';
                pdfContainer.style.cssText = 'position:fixed;left:0;top:0;width:297mm;height:210mm;padding:10mm;box-sizing:border-box;background:#fff;z-index:99999;font-family:Arial,sans-serif;color:#000;margin:0;overflow:auto;';
                pdfContainer.innerHTML = htmlContent;
                document.body.appendChild(pdfContainer);

                // Add print styles
                const styleTag = document.createElement('style');
                styleTag.innerHTML = `
                    @media print {
                        body * { display: none !important; }
                        #pdfRenderContainer, #pdfRenderContainer * { display: block !important; }
                        
                        #pdfRenderContainer {
                            position: static !important;
                            width: 297mm !important;
                            height: 210mm !important;
                            margin: 0 !important;
                            padding: 10mm !important;
                            box-sizing: border-box !important;
                            page-break-after: avoid !important;
                        }
                        
                        @page {
                            size: A4 landscape;
                            margin: 0;
                        }
                        
                        #pdfRenderContainer table {
                            width: 100% !important;
                            display: table !important;
                            border-collapse: collapse !important;
                        }
                        
                        #pdfRenderContainer thead { display: table-header-group !important; }
                        #pdfRenderContainer tbody { display: table-row-group !important; }
                        #pdfRenderContainer tr { display: table-row !important; }
                        #pdfRenderContainer td, #pdfRenderContainer th { 
                            display: table-cell !important; 
                            border: 1px solid #999 !important;
                        }
                        
                        #pdfRenderContainer div { display: block !important; }
                        #pdfRenderContainer span { display: inline !important; }
                        #pdfRenderContainer hr { display: block !important; }
                        
                        #pdfRenderContainer * {
                            color: #000 !important;
                            background-color: transparent !important;
                        }
                        
                        #pdfRenderContainer thead tr { background-color: #f5f5f5 !important; }
                    }
                `;
                document.head.appendChild(styleTag);

                // Wait for rendering
                await new Promise(resolve => setTimeout(resolve, 800));

                try {
                    // Trigger print dialog
                    window.print();
                    MessageToast.show("Select 'Save as PDF' and choose Landscape orientation");

                } finally {
                    // Cleanup
                    setTimeout(() => {
                        if (pdfContainer.parentNode) pdfContainer.parentNode.removeChild(pdfContainer);
                        if (styleTag.parentNode) styleTag.parentNode.removeChild(styleTag);
                    }, 500);
                }

            } catch (error) {
                MessageToast.show("Error generating PDF: " + error.message);
                console.error("PDF Error:", error);
            } finally {
                if (this.setBusy) {
                    this.setBusy(false);
                }
            }
        },

    };
});
