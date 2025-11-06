/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History) {
	"use strict";
	
	/**
	 * Collection iof service-functions
	 * Remenber: these functions are not available during the onInit-Event
	 * 
	 * 
	 * 
	 **/
	 

	const BaseController = Controller.extend("de.axelspringer.sd.advertising.Angebots_Liste.controller.BaseController", {});

	/**
	 * Convenience method for accessing the router in every controller of the application.
	 * @public
	 * @returns {sap.ui.core.routing.Router} the router for this component
	 */
	BaseController.prototype.getRouter = function () {
		return this.getOwnerComponent().getRouter();
	};

	/**
	 * Convenience method for getting the view model by name in every controller of the application.
	 * @public
	 * @param {string} sName the model name
	 * @returns {sap.ui.model.Model} the model instance
	 */
	BaseController.prototype.getModel = function (sName) {
		return this.getView().getModel(sName);
	};

	/**
	 * Convenience method for setting the view model in every controller of the application.
	 * @public
	 * @param {sap.ui.model.Model} oModel the model instance
	 * @param {string} sName the model name
	 * @returns {sap.ui.mvc.View} the view instance
	 */
	BaseController.prototype.setModel = function (oModel, sName) {
		return this.getView().setModel(oModel, sName);
	};

	/**
	 * Convenience method for getting the resource bundle.
	 * @public
	 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
	 */
	BaseController.prototype.getResourceBundle = function () {
		return this.getOwnerComponent().getModel("i18n").getResourceBundle();
	};

	/**
	 * Event handler for navigating back.
	 * It there is a history entry we go one step back in the browser history
	 * If not, it will replace the current entry of the browser history with the master route.
	 * @public
	 */
	BaseController.prototype.onNavBack = function () {
		var sPreviousHash = History.getInstance().getPreviousHash();

		if (sPreviousHash !== undefined) {
			history.go(-1);
		} else {
			this.getRouter().navTo("master", {}, true);
		}
	};
	BaseController.prototype.initializeData = function () {
		this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
		// No item should be selected on master after detail page is closed
		this.getModel("appView").setProperty("/layout", "OneColumn");
		this.getOwnerComponent().oListSelector.clearMasterListSelection();

		var oModel = sap.ui.getCore().getModel(); //Get Hold of the Model
		if (oModel !== undefined) {
			oModel.setData(null); //Set the model data to blank / null
		}

	};

	/*
		read the Text from i18-proper-file
	*/
	BaseController.prototype.getI18Text = function (param) {

		var sText = this.getView().getModel("i18n").getResourceBundle().getText(param);
		return sText;
	};

	/**
	 *	Convenience method for setting view model properties in every controller of the application.
	 * */
	BaseController.prototype.setModelValue = function (sModel, sProperty, sValue) {
		this.getModel(sModel).setProperty(sProperty, sValue);
	};
	BaseController.prototype.getModelValue = function (sModel, sProperty) {
		return this.getModel(sModel).getProperty(sProperty);
	};

	BaseController.prototype.getHeaderData4Modus = function (sUrl) {
		var pieces = sUrl.split("?");

		var params = pieces[1].split("&");
		var modus = "FREE"; // default

		if (params !== undefined) {
			$.each(params, function (key, value) {

				//remove #
				var newValue = value.replace("#", "");

				var param_value = newValue.split("=");

				// console.log(key + ": " + value + " | " + param_value[0] + " > " + param_value[1]);
				if (param_value[0] === "Modus") {

					var params2 = param_value[1].split("/");

					modus = params2[0];
					return false;
				}
			});
		}
		return modus;

	};


	BaseController.prototype.setModeParameter = function (modus) {
		var iVisibleDate = false;
		var iVisibleBox = true;

		switch (modus) {
		case "INIT":
			// Anweisungen werden ausgeführt,
			// falls expression mit value1 übereinstimmt
			break;
		case "FREE":
			// Anweisungen werden ausgeführt,
			// falls expression mit value2 übereinstimmt
			iVisibleDate = false;
			iVisibleBox = true;
			break;
		case "PLM":
			// Anweisungen werden ausgeführt,
			// falls expression mit valueN übereinstimmt
			iVisibleDate = true;
			iVisibleBox = false;
			break;
		default:
			// Anweisungen werden ausgeführt,
			// falls keine der case-Klauseln mit expression übereinstimmt
			iVisibleDate = true;
			iVisibleBox = false;
			break;
		}
		this.getView().getModel("masterView").setProperty("/DatePickerVisible", iVisibleDate);
		this.getView().getModel("masterView").setProperty("/MultiComboBoxVisible", iVisibleBox);

	};
	// Test

	return BaseController;

});