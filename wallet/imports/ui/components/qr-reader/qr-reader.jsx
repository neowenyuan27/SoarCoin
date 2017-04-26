import { Random } from 'meteor/random'
import {EJSON} from "meteor/ejson";
import React, {PureComponent} from "react";
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class QrCodeReader extends PureComponent {
    constructor(props, context) {
        super(props, context);

        this.elementId = "v" + Random.id(4);

        this.state = {
            open: false,
            windowWidth: window.outerWidth,
            windowHeight: window.outerWidth,
        };
        this._onSuccess = this._onSuccess.bind(this);
        this._createScanner = this._createScanner.bind(this);
    }

    _onSuccess(scan) {
        console.log("QR content", scan);
        let value = null;
        try{
            value = EJSON.parse(scan);
        } catch(err) {
            value = scan;
        }
        // this._createScanner();
        if(typeof this.props.onSuccess == "function")
            this.props.onSuccess(value);
    }

    _onError(error) {
        console.log(error)
    }

    _createScanner() {
        let elementId = "#" + this.elementId;
        let onSuccess = this._onSuccess;
        let onError = this.props.onError || this._onError;
        QrReader.getBackCamera().then(function(device) {
            new QrReader({
                sucessCallback: onSuccess, // Required
                errorCallback: onError, // Required
                videoSelector: elementId, // If not provided creates an invisible element and decode in background
                stopOnRead: true, // Default false, When true the video will stop once the first QR is read.
                deviceId: device.deviceId, // Id of the device used for recording video.
            });
        });
    }

    componentDidMount() {
        this._createScanner();
    }

    render() {
        return <video width={this.state.windowWidth + "px"} height={this.state.windowHeight + "px"} id={this.elementId} autoPlay></video>
    }
}

