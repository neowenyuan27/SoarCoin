import React from "react";
import {render} from "react-dom";
import {renderRoutes} from "./router";
import injectTapEventPlugin from "react-tap-event-plugin";

logger = 0;

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

// Render the main app react component into the app div.
// For more details see: https://facebook.github.io/react/docs/top-level-api.html#react.render
Meteor.startup(() => {
    logger = _LTracker;
    logger.info = logger.push;
    logger.debug = logger.push;
    logger.error = logger.push;

    Session.set("language", navigator.language.substr(0, 2));

    render(
        renderRoutes(),
        document.getElementById('app')
    );
});
