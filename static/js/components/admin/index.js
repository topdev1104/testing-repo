import React from "react";
import getFormattedNumber from "../../functions/get-formatted-number";
import { NavLink } from "react-router-dom";

const keys_to_delete = ["project_comment_private", "pair_ids"];

const { BigNumber } = window;

export default class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      coinbase: "",
    };
  }

  componentDidMount() {
    window
      .getFavorites()
      .then((favorites) => this.setState({ favorites }))
      .catch(console.error);

    if (window.isConnectedOneTime) {
      this.onComponentMount();
    } else {
      window.addOneTimeWalletConnectionListener(this.onComponentMount);
    }
  }
  componentWillUnmount() {
    window.removeOneTimeWalletConnectionListener(this.onComponentMount);
  }

  onComponentMount = async () => {
    this.setState({ coinbase: await window.getCoinbase() });
  };

  handleFarmFileUpload = async (e) => {
    e.preventDefault();
    let file = e.target.files[0];
    let input = e.target;
    if (!file) return;

    let text = await window.readAsText(file);
    input.value = "";
    text = text.trim();

    let json = await window.csvToJSON(text);
    console.log(json);

    json = json.map((item) => {
      if (isNaN(Number(item.apy_percent))) {
        item.apy_percent_url = item.apy_percent;
        item.apy_percent = 0;
      }
      if (isNaN(Number(item.tvl_usd))) {
        item.tvl_usd_url = item.tvl_usd;
        item.tvl_usd = 0;
      }
      return item;
    });

    let items = json;

    // take signature here
    let auth_token = null;

    let signature = await window.sign(
      window.config.metamask_message,
      await window.getCoinbase()
    );
    console.log({ signature });
    auth_token = signature;
    // end taking signature logic

    json = JSON.stringify(items);
    let m = window.alertify.message("Processing...");

    try {
      m.ondismiss = (f) => false;

      await window.jQuery.ajax({
        url: `${window.config.api_baseurl}/api/farm-info`,
        method: "POST",
        data: { json },
        // processData: false,
        headers: {
          "auth-token": auth_token,
        },
      });

      window.alertify.message("Upload done!");
    } catch (e) {
      window.alertify.error("Something went wrong!" + e.responseText);
    } finally {
      m.ondismiss = (f) => true;
      m.dismiss();
    }
  };

  handleProjectFileUpload = async (e) => {
    e.preventDefault();
    let file = e.target.files[0];
    let input = e.target;
    if (!file) return;

    let text = await window.readAsText(file);
    input.value = "";
    text = text.trim();

    let json = await window.csvToJSON(text);
    console.log(json);

    json = json.map((item) => {
      item.ts_score_security *= 1;
      item.ts_score_information *= 1;
      item.ts_score_liquidity *= 1;
      item.ts_score_tokenomics *= 1;

      item.ts_score_avg =
        (item.ts_score_security +
          item.ts_score_information +
          item.ts_score_liquidity +
          item.ts_score_tokenomics) /
        4;

      return item;
    });

    let items = [];

    for (let item of json) {
      console.log({ item });
      if (!item.pair_ids) alert(JSON.stringify(item, null, 4));
      let pair_ids = item.pair_ids
        .split(",")
        .map((i) => i.trim().toLowerCase());

      for (let pair_id of pair_ids) {
        items.push({ pair_id, ...item });
      }
    }

    let seen = {};
    items = items
      .filter((item) => {
        if (seen[item.pair_id]) return false;
        seen[item.pair_id] = true;
        return true;
      })
      .map((item) => {
        for (let k of keys_to_delete) {
          delete item[k];
        }
        return item;
      });

    // take signature here
    let auth_token = null;

    let signature = await window.sign(
      window.config.metamask_message,
      await window.getCoinbase()
    );
    console.log({ signature });
    auth_token = signature;
    // end taking signature logic

    json = JSON.stringify(items);
    let m = window.alertify.message("Processing...");

    try {
      m.ondismiss = (f) => false;

      await window.jQuery.ajax({
        url: `${window.config.api_baseurl}/api/pair-info`,
        method: "POST",
        data: { json },
        // processData: false,
        headers: {
          "auth-token": auth_token,
        },
      });

      window.alertify.message("Upload done!");
    } catch (e) {
      window.alertify.error("Something went wrong!" + e.responseText);
    } finally {
      m.ondismiss = (f) => true;
      m.dismiss();
    }
  };

  GetAdminForm = () => {
    return (
      <div>
        <strong style={{ fontSize: "1.2rem" }} className="d-block mb-3">
          UPDATE PAIR INFORMATION
        </strong>
        <form style={{ maxWidth: "600px" }} onSubmit={this.handleSubscribe}>
          <p className="text-muted mb-4" style={{ fontSize: ".8rem" }}>
            <i className="fas fa-info-circle"></i> This will authenticate admin
            and update project information including trust scores and links
            related to projects.
          </p>

          {/* <p className='mt-4'>Enter Pair Address</p>
                    <input value={this.state.pair_address} onChange={this.handlePairChange} className='form-control' type='text' placeholder='Pair Address' />
                    <br /> */}
          {this.props.appState.isConnected ? (
            <div>
              <label
                style={{ minWidth: "250px" }}
                disabled={!this.props.appState.isConnected}
                className="btn v1 p-2"
                type="submit"
              >
                UPLOAD PROJECT CSV
                <input
                  className="d-none"
                  type="file"
                  onChange={this.handleProjectFileUpload}
                  accept="text/csv"
                />
              </label>
              <br />
              <br />
              <label
                style={{ minWidth: "250px" }}
                disabled={!this.props.appState.isConnected}
                className="btn v1 p-2"
                type="submit"
              >
                UPLOAD FARM CSV
                <input
                  className="d-none"
                  type="file"
                  onChange={this.handleFarmFileUpload}
                  accept="text/csv"
                />
              </label>
            </div>
          ) : (
            <div>
              <p>
                <i className="fas fa-wallet"></i> Connect Wallet to Proceed
              </p>
              {/* <p>DYP Locked in Subscription: {getFormattedNumber(this.props.appState.subscribedPlatformTokenAmount/1e18, 6)} DYP</p> */}
              <button
                disabled={this.props.appState.isConnected}
                onClick={this.props.handleConnection}
                className="btn v1"
                type="button"
              >
                CONNECT WALLET
              </button>
            </div>
          )}
        </form>
      </div>
    );
  };

  render() {
    return (
      <div className="locker">
        <h2 style={{ display: "block", color: `var(--preloader-clr)` }}>
          Admin, Pair Info Update
        </h2>

        <p>Update pairs information, upload spreadsheet file.</p>
        <div className="l-table-wrapper-div p-4">
          <div className="mb-4">{this.GetAdminForm()}</div>
        </div>
      </div>
    );
  }
}
