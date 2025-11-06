sap.ui.define([
	"de/axelspringer/sd/advertising/Angebots_Liste/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	const AppController = BaseController.extend("de.axelspringer.sd.advertising.Angebots_Liste.controller.App", {});

/**
 * 
 * This app was designed to handle the offers created in SAP-SD Werbemanagenemt.
 * 
 * ******************************************************
 * It has two options:
 * ******************************************************
 * 1.: show the PLM the offers above 40 % discount
 * 2.: approve the offers for the next step
 * 
 * This app replaces the ALV-functionality in SAP-SD and is embedded as a frame inside the Salesforce Region System.
 * 
 * ******************************************************
 * The App has two flags: 
 * ******************************************************
 * Modus:		FREE/PLM
 * Debug:		true/false
 * 
 * ******************************************************
 * MODUS*
 * ******************************************************
 *		PLM
 * ******************************************************
 * The PLM has the oppertunity to select offers over a time selection
 * 
 * ******************************************************
 *		FREE
 * ******************************************************
 * This mode allows the user to approve the offers into the next Step.
 * Actually it is a two step hierarchy implemented
 * 
 * 
 * 
 * ******************************************************
 * DEBUG *
 * ******************************************************
 * When turning the Debug on, the app writes all function calls to the console log.
 * 
 * 
 * 
 **/
 



	AppController.prototype.onInit = function () {

		var oViewModel,
			fnSetAppNotBusy,
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

		oViewModel = new JSONModel({
			busy: true,
			delay: 0,
			layout: "OneColumn",
			previousLayout: "",
			modFree: "FREE",
			modPlm: "PLM",
			modus1: "UNKNOWN",
			actionButtonsInfo: {
				midColumn: {
					fullScreen: false
				}
			}
		});

		this.setModel(oViewModel, "appView");

		fnSetAppNotBusy = function () {
			oViewModel.setProperty("/busy", false);
			oViewModel.setProperty("/delay", iOriginalBusyDelay);
		};

		// since then() has no "reject"-path attach to the MetadataFailed-Event to disable the busy indicator in case of an error
		this.getOwnerComponent().getModel().metadataLoaded().then(fnSetAppNotBusy);
		this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

		// apply content density mode to root view
		this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

		this.initializeData();

		// this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
		// // No item should be selected on master after detail page is closed
		// this.getOwnerComponent().oListSelector.clearMasterListSelection();
		// this.getRouter().navTo("master");
		// var oView = sap.ui.view({
		// 	id: "detailPage",
		// 	viewName: "Detail",
		// 	type: sap.ui.core.mvc.ViewType.XML
		// });
		// //oView.destroy();

		// oView = sap.ui.view({
		// 	id: "singlePage",
		// 	viewName: "Single",
		// 	type: sap.ui.core.mvc.ViewType.XML
		// });
		// //oView.destroy();

	};
	return AppController;

});