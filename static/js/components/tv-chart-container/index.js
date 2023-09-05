import * as React from 'react';
import { widget } from '../../charting_library';

import getDataFeed from '../../functions/datafeed'

function getLanguageFromURL() {
	const regex = new RegExp('[\\?&]lang=([^&#]*)');
	const results = regex.exec(window.location.search);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

export class TVChartContainer extends React.PureComponent {
	static defaultProps = {
		symbol: '--',
		interval: '15',
		theme: 'Light',
		containerId: 'tv_chart_container',
		datafeedUrl: 'https://demo_feed.tradingview.com',
		libraryPath: '/charting_library/',
		chartsStorageUrl: 'https://saveload.tradingview.com',
		chartsStorageApiVersion: '1.1',
		clientId: 'tradingview.com',
		userId: 'public_user_id',
		fullscreen: false,
		autosize: true,
		studiesOverrides: {},
		
	};

	tvWidget = null;

	componentDidMount() {
		let mainToken = this.props.mainToken
		let symbol = `${mainToken.symbol}/USD`
		let pairId = this.props.pair.id
		let registerBarSubscription = this.props.registerBarSubscription
		let onBarsRequest = this.props.onBarsRequest
		let network = this.props.networkId
		const datafeed = getDataFeed({symbol, pairId, registerBarSubscription, onBarsRequest, mainToken, network})
		const widgetOptions = {
			symbol: this.props.symbol,
			height: '100%',
			width: '100%',
			// autosize: true,
			// BEWARE: no trailing slash is expected in feed URL
			// datafeed: new window.Datafeeds.UDFCompatibleDatafeed(this.props.datafeedUrl),
			datafeed,
			interval: this.props.interval,
			container_id: this.props.containerId,
			library_path: this.props.libraryPath,

			theme: this.props.theme,

			locale: getLanguageFromURL() || 'en',
			disabled_features: ['header_symbol_search', 'header_saveload', 'header_compare', 'use_localstorage_for_settings', 'timeframes_toolbar'],
			enabled_features: [],
			charts_storage_url: this.props.chartsStorageUrl,
			charts_storage_api_version: this.props.chartsStorageApiVersion,
			client_id: this.props.clientId,
			user_id: this.props.userId,
			fullscreen: this.props.fullscreen,
			// autosize: this.props.autosize,
			studies_overrides: this.props.studiesOverrides,
		};

		const tvWidget = new widget(widgetOptions);
		this.tvWidget = tvWidget;

		// tvWidget.onChartReady(() => {
		// 	tvWidget.headerReady().then(() => {
		// 		const button = tvWidget.createButton();
		// 		button.setAttribute('title', 'Click to show a notification popup');
		// 		button.classList.add('apply-common-tooltip');
		// 		button.addEventListener('click', () => tvWidget.showNoticeDialog({
		// 			title: 'Notification',
		// 			body: 'TradingView Charting Library API works correctly',
		// 			callback: () => {
		// 				console.log('Noticed!');
		// 			},
		// 		}));

		// 		button.innerHTML = 'Check API';
		// 	});
		// });
	}

	componentWillUnmount() {
		if (this.tvWidget !== null) {
			this.tvWidget.remove();
			this.tvWidget = null;
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.theme != this.props.theme) {
			if (this.tvWidget && typeof this.tvWidget.changeTheme == 'function') {
				this.tvWidget.changeTheme(this.props.theme)
			}
		}
	}

	render() {
		return (
			<div
				id={ this.props.containerId }
				className={ 'TVChartContainer' }
			/>
		);
	}
}
