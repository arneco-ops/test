sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageBox"
], function (UI5Object, MessageBox) {
	"use strict";

	var oMessageProcessor;
	var oMessageManager;
	var errorText4Start1 = "";
	var errorText4Start2 = "";
	var errorText4StartDetail = "";

	const ErrorHandlerController = UI5Object.extend("de.axelspringer.sd.advertising.Angebots_Liste.controller.ErrorHandler", {

		/**
		 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
		 * @class
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @public
		 * @alias de.axelspringer.sd.advertising.Angebots_Liste.controller.ErrorHandler
		 */

		constructor: function (oComponent) {
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oComponent = oComponent;
			this._oModel = oComponent.getModel();
			this._bMessageOpen = false;
			this._sErrorText = this._oResourceBundle.getText("errorText");
			errorText4Start1 = this._oResourceBundle.getText("errorTextStart1");
			errorText4Start2 = this._oResourceBundle.getText("errorTextStart2");
			errorText4StartDetail = this._oResourceBundle.getText("errorTextStartDetail");

			this._oModel.attachMetadataFailed(function (oEvent) {
				var oParams = oEvent.getParameters();
				this._showServiceError(oParams.response);
			}, this);

			this._oModel.attachRequestFailed(function (oEvent) {
				var oParams = oEvent.getParameters();
				// An entity that was not found in the service is also throwing a 404 error in oData.
				// We already cover this case with a notFound target so we skip it here.
				// A request that cannot be sent to the server is a technical error that we have to handle though
				if (oParams.response.statusCode !== "404" || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf(
						"Cannot POST") === 0)) {
					this._showServiceError(oParams.response);
				}
			}, this);
		}
	});

	ErrorHandlerController.prototype.getMessageProcessor = function () {

		if (oMessageProcessor === undefined) {
			oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
		}
		return oMessageProcessor;
	};

	ErrorHandlerController.prototype.getMessageManager = function () {
		if (oMessageManager === undefined) {
			oMessageManager = sap.ui.getCore().getMessageManager();
		}
		return oMessageManager;
	};

	/**
	 * Shows a {@link sap.m.MessageBox} when a service call has failed.
	 * Only the first error message will be display.
	 * @param {string} sDetails a technical error to be displayed on request
	 * @private
	 */
	ErrorHandlerController.prototype._showServiceError = function (sDetails) {
		// debugger;

		var hdrMessageObject = "";
		var myMsg = "";

		// this.getView().getModel("detailView").setProperty("/showMsgIndicator",true);
		// this.setModelValue("detailView","/showMsgIndicator",true);

		if (sDetails.responseText === undefined) {
			hdrMessageObject = sDetails.body;
			myMsg = sDetails.statusCode + ": " + hdrMessageObject;
		} else {
			hdrMessageObject = JSON.parse(sDetails.responseText);
			myMsg = hdrMessageObject.error.code + ": " + hdrMessageObject.error.message.value;
		}

		var sModeTt = myMsg.substr(0, 1);

		// in PLM-Mode use the Messagebox

		switch (sModeTt) {
		case "P":

			// MessageBox.show(myMsg, {
			// 	icon: MessageBox.Icon.Error,
			// 	title: "Fehler",
			// 	actions: [MessageBox.Action.OK],
			// 	id: "messageBoxId1",
			// 	details: "<p><strong>Fehlersotuation:</strong></p>\n" +
			// 		"<ul>" +
			// 		"<li><em>Enddatum<em> ist größer als <em>Startdatum<em>.</li>" +
			// 		"<br>oder" +
			// 		"<li><em>Startdatum<em> ist größer als <em>Endedatum<em></li>" +
			// 		"</ul>",
			// 	styleClass: bCompact ? "sapUiSizeCompact" : "",
			// 	contentWidth: "200px"
			// });				

			// parse msg

			var pieces = myMsg.split(":");

			var pMod = pieces[0].substr(1, 1);

			var displayMsg = errorText4Start1 + pMod + errorText4Start2 + errorText4StartDetail;

			this._bMessageOpen = true;
			MessageBox.error(
				displayMsg, {
					id: "serviceErrorMessageBox",
					styleClass: this._oComponent.getContentDensityClass(),
					actions: [MessageBox.Action.CLOSE],
					onClose: function () {
						this._bMessageOpen = false;
					}.bind(this)
				}
			);

			// this._bMessageOpen = true;
			// MessageBox.error(
			// 	this._sErrorText, {
			// 		id: "serviceErrorMessageBox",
			// 		details: myMsg,
			// 		styleClass: this._oComponent.getContentDensityClass(),
			// 		actions: [MessageBox.Action.CLOSE],
			// 		onClose: function () {
			// 			this._bMessageOpen = false;
			// 		}.bind(this)
			// 	}
			// );
			break;
		default:

			this.getMessageManager().addMessages(
				new sap.ui.core.message.Message({
					message: myMsg,
					type: sap.ui.core.MessageType.Error,
					processor: this.getMessageProcessor().oMessageProcessor
				})
			);

			break;
		}
	};

	return ErrorHandlerController;

});