import React from "react";
import "./disclaimer.css";

const Disclaimer = () => {
  return (
    <div className="container-lg">
      <h6 className="launchpad-hero-title mb-4">Dypius Disclaimer</h6>
      <div className="purple-wrapper d-flex flex-column gap-3 p-3">
        <p className="disclaimer-text ">
          Dypius is a decentralized platform that people can use for yield
          farming, staking, and enabling users to leverage the advanced trading
          tools of the DYP. Your use of the Dypius involves various risks,
          including, but not limited to, losses while digital assets are being
          supplied to the Uniswap / PancakeSwap / Pangolin protocol and losses
          due to the fluctuation of prices of tokens in a liquidity pool. Before
          using the Dypius, you should review the relevant documentation from
          our Github to make sure you understand how the Dypius works. The
          Dypius project is public, open-source or source-available software
          including a set of smart contracts that are deployed on the Ethereum
          Blockchain, BNB Chain, and Avalanche Network.
        </p>
        <p className="disclaimer-text">
          Additionally, just as you can access email protocols such as SMTP
          through multiple email clients, you can access the Dypius through
          dozens of web or mobile interfaces. You are responsible for doing your
          own diligence on those interfaces to understand the fees and risks
          they present.
        </p>
        <p className="disclaimer-text">
          All content available on our website, on hyperlinked websites, and on
          applications, forums, blogs, social media accounts and other platforms
          associated with Dypius is intended solely to provide you with general
          information. We make no warranties of any kind with respect to our
          content, including, but not limited to, the accuracy and currency of
          the information. None of the content we provide should be construed as
          financial, legal or any other type of advice on which you may
          specifically rely for any purpose. Any use or reliance you place on
          our content is solely at your own risk. What you should do is conduct
          your own research, review and analysis, and verify our content before
          relying on it. Trading is a high-risk activity that can result in
          significant losses, so you should consult with your financial advisor
          before making any decisions. Nothing on our Site should be considered
          an invitation or offer to take any action.
        </p>
        <p className="disclaimer-bold">
          AS DESCRIBED IN THE DYPIUS LICENSES, THE SMART CONTRACTS AND SERVICE
          ARE PROVIDED WITHOUT WARRANTY OF ANY KIND, ALL THE LIABILITIES ARE
          DISCLAIMED, WE’RE NOT RESPONSIBLE FOR ANY DAMAGE RELATED TO OR OUT OF
          THE USE OF SOFTWARE OR SERVICES DELIVERED BY US. DAMAGES CANNOT BE
          INVOICED TO US. IN CASE OF A HACK OR EXPLOIT WE CANNOT HELP IN ANY
          WAY.
        </p>
        <p className="disclaimer-text">
          LICENSE & DISCLAIMER BSD 3-Clause License Copyright (c) BC &
          Contributors All rights reserved.
        </p>
        <p className="disclaimer-text">
          Redistribution and use in source and binary forms, with or without
          modification, are permitted provided that the following conditions are
          met:
        </p>
        <p className="disclaimer-text">
          1. Redistributions of source code must retain the above copyright
          notice, this list of conditions and the following disclaimer.
        </p>
        <p className="disclaimer-text">
          2. Redistributions in binary form must reproduce the above copyright
          notice, this list of conditions and the following disclaimer in the
          documentation and/or other materials provided with the distribution.
        </p>
        <p className="disclaimer-text">
          3. Neither the name of the copyright holder nor the names of its
          contributors may be used to endorse or promote products derived from
          this software without specific prior written permission.
        </p>
        <p className="disclaimer-bold">
          THIS SOFTWARE AND / OR SERVICE IS PROVIDED BY THE COPYRIGHT HOLDERS,
          CONTRACTOR AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
          WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
          MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
          IN NO EVENT SHALL THE COPYRIGHT HOLDER, CONTRACTOR OR CONTRIBUTORS BE
          LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
          CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
          SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
          BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
          WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
          OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
          IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
        </p>
      </div>
    </div>
  );
};

export default Disclaimer;
