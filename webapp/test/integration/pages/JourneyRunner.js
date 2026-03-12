sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"zdg/mm/gatepass/test/integration/pages/HeaderList",
	"zdg/mm/gatepass/test/integration/pages/HeaderObjectPage",
	"zdg/mm/gatepass/test/integration/pages/ItemObjectPage"
], function (JourneyRunner, HeaderList, HeaderObjectPage, ItemObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('zdg/mm/gatepass') + '/test/flp.html#app-preview',
        pages: {
			onTheHeaderList: HeaderList,
			onTheHeaderObjectPage: HeaderObjectPage,
			onTheItemObjectPage: ItemObjectPage
        },
        async: true
    });

    return runner;
});

