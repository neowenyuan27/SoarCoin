import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {Tabs, Tab} from 'material-ui/Tabs';
import MapsPersonPin from 'material-ui/svg-icons/maps/person-pin';
// From https://github.com/oliviertassinari/react-swipeable-views
import SwipeableViews from 'react-swipeable-views';
import enMsg from '../i18n/en-labels.json';
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

export default class WalletBottomNavigation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            slideIndex: 0,
            contentHeight: "400px"
        };
        this.handleChange = this.handleChange.bind(this);
        // this._registerRef = props.registerRef;
    }

    handleChange(value) {
        this.setState({slideIndex: value});
    };

    componentDidMount() {
        let tabsNode = ReactDOM.findDOMNode(this.navigationTabs);
        let viewNode = ReactDOM.findDOMNode(this.views);
        let viewHeight = tabsNode.offsetTop - tabsNode.clientHeight - viewNode.offsetTop - 8;
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
                <Tabs style={{position: "absolute", bottom: 8, left: 8, right: 8}}
                      onChange={this.handleChange}
                      value={this.state.slideIndex}
                      ref={(input) => {
                          this.navigationTabs = input;
                      }}
                >
                <Tab icon={<SendCoinsIcon/>} label={enMsg.appBar.send} value={0}/>
                <Tab icon={<ReceiveCoinsIcon/>} label={enMsg.appBar.receive} value={1}/>
                <Tab icon={<HistoryIcon/>} label={enMsg.appBar.history} value={2}/>
            </Tabs>
            </div >
        );
    }
}

/*
WalletBottomNavigation.propTypes = {
    registerRef: PropTypes.func
};*/
