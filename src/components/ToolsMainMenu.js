import {Ballot, ImportExport, SaveAlt, Settings} from "@material-ui/icons";
import { formatMessage, MainMenuContribution, withModulesManager } from "@openimis/fe-core";
import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { RIGHT_REGISTERS, RIGHT_REPORTS, RIGHT_EXTRACTS } from "../constants";

class ToolsMainMenu extends Component {
  constructor(props) {
    super(props);
    this.isWorker = props.modulesManager.getConf("fe-core", "isWorker", false);
    this.canRedirect = props.modulesManager.getConf("fe-tools", "canRedirect", false)
  }

  enablers = (enablers) => {
    var e;
    for (e of enablers) {
      if (this.props.rights.includes(e)) return true;
    }
    return false;
  };

  render() {
    if (this.isWorker) return null;

    let entries = [];

    if (this.enablers(RIGHT_REGISTERS)) {
      entries.push({
        text: formatMessage(this.props.intl, "tools", "menu.registers"),
        icon: <ImportExport />,
        route: "/tools/registers",
      });
    }
    if (this.enablers(RIGHT_EXTRACTS)) {
      entries.push(
        { text: formatMessage(this.props.intl, "tools", "menu.extracts"), icon: <SaveAlt />, route: "/tools/extracts" },
      )
    }
    if (this.enablers(RIGHT_REPORTS)) {
      entries.push({
        text: formatMessage(this.props.intl, "tools", "menu.reports"),
        icon: <Ballot />,
        route: "/tools/reports",
        redirectToUrl: !!this.canRedirect && this.canRedirect == true ?  'https://csureport.minsante.cm/': null
      });
    }

    if (!entries.length) return null;
    
    return (
      <MainMenuContribution
        {...this.props}
        header={formatMessage(this.props.intl, "tools", "mainMenu")}
        icon={<Settings />}
        entries={entries}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default injectIntl(withModulesManager(connect(mapStateToProps)(ToolsMainMenu)));
