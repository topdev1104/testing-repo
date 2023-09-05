import React from "react";
import ReactTooltip from "react-tooltip";
import Clipboard from "react-clipboard.js";
import copy from "./assets/copy.svg";

export default function Address(props) {
  let id = Math.random().toString(36);
  return (
    <span {...props} style={{ display: "flex", alignItems: "center" }}>
      <a
        style={{ fontSize: "12px", color: "#75CAC2" }}
        rel="noopener noreferrer"
        target="_blank"
        href={`${
          props.chainId === 1
            ? window.config.etherscan_baseURL
            : props.chainId === 56
            ? window.config.bscscan_baseURL
            : window.config.snowtrace_baseURL
        }/${props.token ? "token" : "address"}/${props.a}`}
      >
        {props.a?.slice(0, 7) + "..." + props.a?.slice(props.a.length - 5)}
      </a>
      <Clipboard
        component="span"
        onSuccess={(e) => {
          setTimeout(() => ReactTooltip.hide(), 2000);
        }}
        data-event="click"
        data-for={id}
        data-tip="Address Copied To Clipboard!"
        data-clipboard-text={props.a}
      >
        <span
          title="Copy address to clipboard"
          style={{
            cursor: "pointer",
            // position: 'absolute',
            paddingLeft: ".4rem",
          }}
        >
          <img src={copy} alt="" />
        </span>
      </Clipboard>
      <ReactTooltip id={id} effect="solid" />
    </span>
  );
}
