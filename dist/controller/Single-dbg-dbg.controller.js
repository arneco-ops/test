sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"de/axelspringer/sd/advertising/Angebots_Liste/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"de/axelspringer/sd/advertising/Angebots_Liste/model/formatter",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/base/Log"
], function (Fragment, Filter, FilterOperator, BaseController, JSONModel, formatter, MessagePopover, MessagePopoverItem, Log) {
	"use strict";

	var _oView;
	var sModus = null;
	var consoleIdx = 0;
	var showConsole = true;

	const SingleController = BaseController.extend("de.axelspringer.sd.advertising.Angebots_Liste.controller.Single", {

		formatter: formatter
	});

	/**
	 * This controller shows the price calculation and additional information about WT and formats
	 * 
	 * 
	 **/

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf de.axelspringer.sd.advertising.Angebots_Liste.view.Single
	 */
	SingleController.prototype.onInit = function () {
		var oRouter = sap.ui.core.UIComponent.getRouterFor(this); //Get Hold of Router
		//Registrierung Event (Methode welche aufgerufen werden sollen, wenn die Route angepsrungen wird
		oRouter.getRoute("single").attachMatched(this.onObjectMatched, this); //Attach Router Pattern

		/**
		 *	Handle the URL-Partameters
		 */

		var sParameters = jQuery.sap.getUriParameters();

		// set the debug-Modus if passed by URL
		var sDebug = sParameters.get("Debug");
		if (sDebug !== undefined) {
			switch (sDebug) {
			case "true":
				showConsole = true;
				break;
			case "false":
				// true and false are correct
				showConsole = false;
				break;
			}
		}

		// Set the Modus from URL
		var sModusT = sParameters.get("Modus");
		if (sModusT !== undefined) {
			switch (sModusT) {
			case "PLM":
			case "FREE":
				sModus = sModusT;
				break;
			default:
				sModus = "FREE";
				break;
			}
		} else {
			sModus = "FREE";
		}

		/**
		 *	Handle the URL-Partameters - END
		 */

		var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
		var oMessageManager = sap.ui.getCore().getMessageManager();

		oMessageManager.registerMessageProcessor(oMessageProcessor);

		_oView = this.getView();

		var oViewModel = new JSONModel({
			pos0: 0,
			pos1: 1
		});

		this.setModel(oViewModel, "singleView");

	};

	/**
	 * * <p> Actions after navigate to this  Page </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = Context for this function
	 */

	// das soll passieren wenn Einsprung über Route 2 Erfolgt ist
	SingleController.prototype.onObjectMatched = function (oEvent) {
		this.show2Log("onObjectMatched", "A");
		var oArgs, oView;

		// get the parameters 
		oArgs = oEvent.getParameter("arguments");
		oView = this.getView();

		// Variante 1
		/*                                          // path1: Pattern-name aus der Routendefinition, enthlt den übergebenen Werts
		                                               // in diesem Beispiel: Zeige den Wert auf der Detailseite an
		                                               oView.byId("test").setText(oArgs.path1);
		                                */

		var sPath = "/DetailCollection" + oArgs.single;
		// sModus = oArgs.modus;

		this.getView().getModel().setHeaders({
			"Modus": sModus
		});

		oView.bindElement(sPath);
		this.show2Log("onObjectMatched-END", "E");

	};

	// onCloseSinglePress1: function () {
	// 	var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");
	// 	this.navigateToView(sNextLayout, "Detail");
	// },

	/**
	 * * <p> Closes this Page </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = not used
	 */

	SingleController.prototype.onCloseSinglePress = function () {
		this.show2Log("onCloseSinglePress", "A");

		this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");

		// this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"));
		// // this.getModel("appView").setProperty("/actionButtonsInfo/endColumn/fullScreen", false);
		// // No item should be selected on master after detail page is closed
		// this.getOwnerComponent().oListSelector.clearListListSelection();
		// this.getRouter().navTo("detailt");
		this.show2Log("onCloseSinglePress-END", "E");

	};

	/**
	 * * <p> Shows the collected Messages </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = Context for this function
	 */
	SingleController.prototype.onMessagesButtonPress = function (oEvent) {
		this.show2Log("onMessagesButtonPress", "A");

		var oMessagesButton = oEvent.getSource();

		if (!this._messagePopover) {
			this._messagePopover = new MessagePopover({
				items: {
					path: "message>/",
					template: new MessagePopoverItem({
						description: "{message>description}",
						type: "{message>type}",
						title: "{message>message}"
							// description: "{message>description}",
							// type: "{message>type}",
							// title: "{message>message}"
					})
				}
			});
			oMessagesButton.addDependent(this._messagePopover);
		}
		this._messagePopover.toggle(oMessagesButton);
		this.show2Log("onMessagesButtonPress-END", "E");
	};

	/**
	 * * <p> Navigate back to the previous page </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = not used
	 */

	SingleController.prototype.onNavBack = function () {
		this.show2Log("onNavBack", "A");

		var oHistory = History.getInstance();
		var sPreviousHash = oHistory.getPreviousHash();

		if (sPreviousHash !== undefined) {
			window.history.go(-1);
		} else {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("master", true);
		}
		this.show2Log("onNavBack-END", "E");
	};

	/**
	 * * <p> Shows the information for the multiple WT  </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = Context for this function
	 */

	SingleController.prototype.onButtonWtPress = function (oEvent) {
		this.show2Log("onButtonWtPress", "A");
		//					var sPath = "/MultiWtCollection(Vbeln='4711',Posnr='010000',AdWerbet='')";
		// var sPath = "/MultiWtCollection(Vbeln='4711',Posnr='010000')";
		// var mView = this.getView();
		// this.getView().bindElement(sPath);
		// var myModel = this.getView().getModel();

		var oButton = oEvent.getSource();

		// create popover
		if (this._oPopover) {
			this._oPopover.destroy(true);
		}

		Fragment.load({
			id: "popoverWT",
			name: "de.axelspringer.sd.advertising.Angebots_Liste.view.Popover_WT",
			controller: this
		}).then(function (oPopover) {
			this._oPopover = oPopover;
			this.getView().addDependent(this._oPopover);
			this._oPopover.openBy(oButton);

		}.bind(this));
		this.show2Log("onButtonWtPress-END", "E");

	};

	/**
	 * * <p> Shows the information for the multiple formats  </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = Context for this function
	 */

	SingleController.prototype.onButtonFormatPress = function (oEvent) {
		this.show2Log("onButtonFormatPress", "A");

		var oButton = oEvent.getSource();

		// create popover
		if (this._oPopover) {
			this._oPopover.destroy(true);
		}

		Fragment.load({
			id: "popoverFormat",
			name: "de.axelspringer.sd.advertising.Angebots_Liste.view.Popover_Format",
			controller: this
		}).then(function (oPopover) {
			this._oPopover = oPopover;
			this.getView().addDependent(this._oPopover);
			this._oPopover.openBy(oButton);

		}.bind(this));

		this.show2Log("onButtonFormatPress-END", "E");
	};

	/**
	 * * <p> Event fired after ListUpdateFinished  </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = Context for this function
	 */

	SingleController.prototype._onListUpdateFinished = function (oEvent) {
		//debugger;
	};

	// _onWtListUpdateFinished: function (oEvent) {
	// 	// debugger;
	// },

	/**
	 * * <p> Event fired when ListUpdate (WT) started. Sets the correct filter-options for the odata call.  </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = Context for this function
	 */

	SingleController.prototype._onListUpdateStarted = function (oEvent) {
		this.show2Log("_onListUpdateStarted", "A");
		var oFilter = [];

		var mValue1 = this.getView().byId("Vbeln").getText();
		var mValue2 = this.getView().byId("Posnr").getText();

		oFilter.push(new Filter("Vbeln", FilterOperator.EQ, mValue1));
		oFilter.push(new Filter("Posnr", FilterOperator.EQ, mValue2));

		//			var oBinding = oEvent.getSource()._getBindingContext();
		var oBinding = oEvent.getSource().getBinding("items");
		oBinding.filter(oFilter);

		this.show2Log("_onListUpdateStarted-END", "E");
	};

	/**
	 * * <p> Event fired when FormatListUpdate started. Sets the correct filter-options for the odata call.  </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = Context for this function
	 */

	SingleController.prototype._onFormatListUpdateStarted = function (oEvent) {
		this.show2Log("_onFormatListUpdateStarted", "A");
		var oFilter = [];

		var mValue1 = this.getView().byId("Vbeln").getText();
		var mValue2 = this.getView().byId("Posnr").getText();

		oFilter.push(new Filter("Vbeln", FilterOperator.EQ, mValue1));
		oFilter.push(new Filter("Posnr", FilterOperator.EQ, mValue2));

		//			var oBinding = oEvent.getSource()._getBindingContext();
		var oBinding = oEvent.getSource().getBinding("items");
		oBinding.filter(oFilter);

		this.show2Log("_onFormatListUpdateStarted-END", "E");

	};

	/**
	 * * <p> Handle the Console-Outputs for debugging </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} sValue = name of the function
	 * @param {Object} sOpt   = A: Anfang, E: Ende => start and end of a functioncall
	 */
	SingleController.prototype.show2Log = function (sValue, sOpt) {
		if (showConsole === true) {
			switch (sOpt) {
			case "A":
				consoleIdx++;
				break;
			case "E":
				consoleIdx--;
				break;
			}
			//					console.log("********[3] (" + consoleIdx + ") SingleView: " + sValue);
			Log.info("********[3] (" + consoleIdx + ") SingleView: " + sValue);

		}
	};
	/**
		this.show2Log("onObjectMatched-END", "A");
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf de.axelspringer.sd.advertising.Angebots_Liste.view.Single
	 */
	//            onBeforeRendering: function() {
	//
	//            },

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf de.axelspringer.sd.advertising.Angebots_Liste.view.Single
	 */
	//            onAfterRendering: function() {
	//
	//            },

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf de.axelspringer.sd.advertising.Angebots_Liste.view.Single
	 */
	//            onExit: function() {
	//
	//            }

	return SingleController;

});