import { Session } from 'meteor/session';
import React from 'react';
import {render} from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Main from '../import/ui/Main'; // Our custom react component

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

// Render the main app react component into the app div.
// For more details see: https://facebook.github.io/react/docs/top-level-api.html#react.render
Meteor.startup(() => {
    function getLang () {
        return (
            navigator.languages && navigator.languages[0] ||
            navigator.language ||
            navigator.browserLanguage ||
            navigator.userLanguage ||
            'en-US'
        );
    }

    Session.set("locale", getLang());

    render(
        <Main />,
        document.getElementById('app')
    );
});
