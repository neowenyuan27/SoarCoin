import React from "react";
import ReactDOM from "react-dom";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import {Tab, Tabs} from "material-ui/Tabs";
// From https://github.com/oliviertassinari/react-swipeable-views
import SwipeableViews from "react-swipeable-views";
import msgs from "../i18n/labels.js";
import SendCoinsIcon from "../icons/send-coins";
import ReceiveCoinsIcon from "../icons/receive-coins";
import HistoryIcon from "../icons/history";
import SendCoins from "./send-coins";
import ReceiveCoins from "./receive-coins";
import TxHistory from "./transaction-history";

const styles = {
    headline: {
        fontSize: 24,
        paddingTop: 16,
        marginBottom: 12,
        fontWeight: 400,
    },
    slide: {
        padding: 10,
    },
};

export default class WalletBottomNavigation extends TrackerReact(React.Component) {

    constructor(props) {
        super(props);
        this.state = {
            slideIndex: 0,
            contentHeight: "400px"
        };

        this.initialHeight = window.innerHeight;

        this.handleChange = this.handleChange.bind(this);
        // this._registerRef = props.registerRef;
    }

    handleChange(value) {
        this.setState({slideIndex: value});
    };

    componentDidMount() {
        let tabsNode = ReactDOM.findDOMNode(this.navigationTabs);
        let viewNode = ReactDOM.findDOMNode(this.views);
        let viewHeight = tabsNode.offsetTop - viewNode.offsetTop - 8;
        this.setState({contentHeight: viewHeight.toString() + "px"})
    }

    render() {
        return (
            <div>
                <SwipeableViews
                    index={this.state.slideIndex}
                    onChangeIndex={this.handleChange}
                    ref={(input) => {
                        this.views = input;
                    }}
                >
                    <div style={styles.slide}>
                        <SendCoins wait={this.props.wait}
                                   hasFocus={this.state.slideIndex === 0}
                                   password={this.props.password}/>
                    </div>
                    <div style={styles.slide}>
                        <ReceiveCoins hasFocus={this.state.slideIndex === 1}/>
                    </div>
                    <div style={styles.slide}>
                        <TxHistory hasFocus={this.state.slideIndex === 2} contentHeight={this.state.contentHeight}/>
                    </div>
                </SwipeableViews>
                <Tabs style={{position: "absolute", top: (this.initialHeight - 80), left: 8, right: 8}}
                      onChange={this.handleChange}
                      value={this.state.slideIndex}
                      ref={(input) => {
                          this.navigationTabs = input;
                      }}
                >
                    <Tab icon={<SendCoinsIcon/>} label={msgs().appBar.send} value={0}/>
                    <Tab icon={<ReceiveCoinsIcon/>} label={msgs().appBar.receive} value={1}/>
                    <Tab icon={<HistoryIcon/>} label={msgs().appBar.history} value={2}/>
            </Tabs>
            </div >
        );
    }
}

/*
WalletBottomNavigation.propTypes = {
    registerRef: PropTypes.func
};*/
