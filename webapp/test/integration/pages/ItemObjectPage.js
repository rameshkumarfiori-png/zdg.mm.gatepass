sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'zdg.mm.gatepass',
            componentId: 'ItemObjectPage',
            contextPath: '/Header/_item'
        },
        CustomPageDefinitions
    );
});