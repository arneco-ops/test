/*global location */
sap.ui.define([
	"de/axelspringer/sd/advertising/Angebots_Liste/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"de/axelspringer/sd/advertising/Angebots_Liste/model/formatter",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/m/PDFViewer",
	"sap/base/Log",
	"sap/ui/core/EventBus"
], function (BaseController, JSONModel, formatter, MessagePopover, MessagePopoverItem, PDFViewer, Log, EventBus) {
	"use strict";

	//Global variables
	var changedData = [];

	//	var showConsole = false;
	var showConsole = false;
	var sModus = null;
	var consoleIdx = 0;

	const DetailController = BaseController.extend("de.axelspringer.sd.advertising.Angebots_Liste.controller.Detail", {

		formatter: formatter
	});

	/**
	 * This Controller handles the midscreen information ("Position-View").
	 * Depending on the mode, it allows the user to approve the offer to the next step
	 * After clicking on a position, additional information will be shown on the right side, e.g. the price calculation
	 * 
	 * 
	 **/

	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */

	DetailController.prototype.onInit = function () {
		// Model used to manipulate control states. The chosen values make sure,
		// detail page is busy indication immediately so there is no break in
		// between the busy indication for loading the view's meta data

		var oViewModel = new JSONModel({
			busy: false,
			delay: 0,
			pos0: 0,
			pos1: 1,
			countattach: 0,
			lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading"),
			attachmentItemListTitle: this.getResourceBundle().getText("detailAttachmentItemTableHeading")
		});

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

		// oMessageManager.addMessages(
		// 	new sap.ui.core.message.Message({
		// 		message: "Something wrong happened",
		// 		type: sap.ui.core.MessageType.Error,
		// 		processor: oMessageProcessor
		// 	})
		// );

		this.getRouter().getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

		this.setModel(oViewModel, "detailView");

		this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

		// PDF viewer
		this._pdfViewer = new PDFViewer();
		this.getView().addDependent(this._pdfViewer);

	};

	/* =========================================================== */
	/* event handlers                                              */
	/* =========================================================== */

	/**
	 * Event handler when the share by E-Mail button has been clicked
	 * @public
	 */
	DetailController.prototype.onSendEmailPress = function () {

		this.show2Log("onSendEmailPress", "A");

		var oViewModel = this.getModel("detailView");

		sap.m.URLHelper.triggerEmail(
			null,
			oViewModel.getProperty("/shareSendEmailSubject"),
			oViewModel.getProperty("/shareSendEmailMessage")
		);
		this.show2Log("onSendEmailPress", "E");
	};

	/**
	 * Updates the item count within the line item table's header
	 * @param {object} oEvent an event containing the total number of items in the list
	 * @private
	 */
	DetailController.prototype.onListUpdateFinished = function (oEvent) {

		this.show2Log("onListUpdateFinished", "A");

		var sTitle,
			iTotalItems = oEvent.getParameter("total"),
			oViewModel = this.getModel("detailView");

		// only update the counter if the length is final
		if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
			if (iTotalItems) {
				sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
			} else {
				//Display 'Line Items' instead of 'Line items (0)'
				sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
			}
			oViewModel.setProperty("/lineItemListTitle", sTitle);

			this.disableCheckboxes();

			// set also the attachment counter
			this.onAttachmentUpdateFinished(oEvent);
		}
		this.show2Log("onListUpdateFinished-END", "E");
	};

	/**
	 * * <p> Called after the Upload is completed. It shows the counter of the attachments </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = not used
	 */

	DetailController.prototype.onAttachmentUpdateFinished = function (oEvent) {

		this.show2Log("onAttachmentUpdateFinished", "A");

		let iTotalItems = this.byId("UploadCollection2").getBinding("items").iLength;
		let oViewModel = this.getModel("detailView");

		oViewModel.setProperty("/countattach", iTotalItems);
		this.show2Log("onAttachmentUpdateFinished-END", "E");

	};

	/**
	 * * <p> Opens the right information side for displaying calculations </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = Context for the navigation
	 */

	DetailController.prototype.toSingle = function (oEvent) {

		this.show2Log("toSingle", "A");

		// var oList = oEvent.getSource(),
		// 	bSelected = oEvent.getParameter("selected");

		// skip navigation when deselecting an item in multi selection mode => NO, not nessessary!!!! Han, 06.09.2019
		//if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
		// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
		// var oItem = oEvent.getSource();
		var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

		// var oContext = oItem.getBindingContext();
		// Die Daten die benutzt werden können stehen im Array "oData"

		//var sPathAll = oEvent.getSource().getBindingContext();
		var sPath = oEvent.getSource().getBindingContext().getPath().substring(15);
		oRouter.navTo("single", {
			single: sPath
		});
		// }
		this.show2Log("toSingle-END", "E");
	};

	/**
	 * * <p> Disables all the checkboxes </p>
	 * @author A. Hansson
	 * @instance 
	 
	 */

	DetailController.prototype.disableCheckboxes = function () {

		this.show2Log("disableCheckboxes", "A");

		// disable checkboxes
		var tbl = this.getView().byId(this.getTableId());

		var header = tbl.$().find('thead');
		var selectAllCb = header.find('.sapMCb');
		selectAllCb.remove();

		tbl.getItems().forEach(function (r) {

			var obj = r.getBindingContext().getObject();

			var oSelectable = obj.Selectable;
			var cb = r.$().find('.sapMCb');
			var oCb = sap.ui.getCore().byId(cb.attr('id'));

			if (oCb !== undefined) {
				// all is disabled
				oCb.setEnabled(false);
				if (oSelectable === "X") {
					oCb.setEnabled(true);
				} else {
					//setSelectedItem(oCb, false);
				}
			}
		});
		this.show2Log("disableCheckboxes-END", "E");
	};

	// onSelectionChange: function (oEvent) {},

	/**
	 * * <p> Approve the selected offers </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = not used
	 */
	DetailController.prototype.onReleaseButtonPress = function (oEvent) {

		this.show2Log("onReleaseButtonPress", "A");

		// Reset the data
		changedData = [];

		var oTable = this.getView().byId(this.getTableId());

		var oItems = oTable.getSelectedItems();

		var myView = this.getView();
		var myModel = myView.getModel();

		var mySelectableCnt = 0;

		//var oObject = this.byId("single");

		// jQuery.sap.log.error("Hallo");

		for (var i = 0; i < oItems.length; i++) {
			var sPath = oItems[i].getBindingContext().getPath();

			var oFullPath = sPath + "/IsChanged";

			// // Remeber the Data 
			changedData.push(oFullPath);

			myModel.setProperty(oFullPath, "X");

		}

		// close the single view
		//this.getModel("appView").setProperty("/layout", "MidColumnFullScreen"); 
		this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");

		// whatever you're doing that might cause an error

		var self = this;

		myModel.submitChanges({
			//groupId: "EquiChars",
			//merge: false,
			success: function (oData, sResponse) {

				if (oData !== undefined) {

					if (oData.__batchResponses[0].response !== undefined) {
						// Error
						var oBody = JSON.parse(oData.__batchResponses[0].response.body);

						// reset the Selection
						// let oModel = myView.getModel();
						// oModel.refresh(true, false);
					} else {
						if (oData.__batchResponses[0].__changeResponses !== undefined) {
							// OK
							// reset the Selections
							self.resetDetailModelValues();
						}
					}
				}
				// reset the Data in the Model - otherwise is the checkbox in memory
				let oModel = myView.getModel();
				for (var i = 0; i < changedData.length; i++) {
					oModel.setProperty(changedData[i], "");
				}
				// check if one item is selectable
				mySelectableCnt = 0;
				oItems = oTable.getItems();

				for (var i = 0; i < oItems.length; i++) {
					var obj = oItems[i].getBindingContext().getObject();

					if (obj.Selectable === "X") {
						mySelectableCnt++;
					}
				}

				// reset the Selections	

				// in Callback functions "this" refers to the false object. You have to predefine the "this" to 
				// a new variable ***	var self = this;*** - so you can use it inside a callback function

				if (mySelectableCnt < 1) {
					// refresh the model
					//myView.getModel().refresh();
					let oEventBus = sap.ui.getCore().getEventBus();
					oEventBus.publish("Detail", "reLoadMaster", this);

					//sap.ui.getCore().byId("master").getController().onReload();
					//sap.ui.core.mvc.controller("de.axelspringer.sd.advertising.Angebots_Liste.controller.Master").onReload();
				}

			},

			error: function (oError) {
				//debugger;
				//var a = 1;
				//	oTable.removeSelections();

			}
		});

		this.show2Log("onReleaseButtonPress-END", "E");
	};

	/**
	 * * <p> Shows the collected Messages </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = Context for this function
	 */

	DetailController.prototype.onMessagesButtonPress = function (oEvent) {

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
	 * * <p> Get the Name for the List-Control </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = not used
	 */

	DetailController.prototype.getTableId = function () {
		//this.show2Log("getTableId");

		return 'lineItemsList';
	};

	/**
	 * * <p> Shows the selected attachment </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = Context for this function
	 */

	DetailController.prototype.onShowAttachment = function (oEvent) {

		this.show2Log("onShowAttachment", "A");

		let sPath = oEvent.getSource().getBindingContext().getPath();
		let oModel = this.getModel();
		let obj = oModel.getProperty(sPath);
		if (obj !== undefined) {
			//let sModelPath = this.getView().getModel().sServiceUrl;
			var sModelPath = oModel.sServiceUrl;
			sModelPath = sModelPath + oModel.createKey("/AttachmentCollection", {
				DocumentId: obj.DocumentId
			}) + "/$value";

			sap.m.URLHelper.redirect(sModelPath, true);

		}

		this.show2Log("onShowAttachment-END", "E");
	};

	/**
	 * * <p> Reset the detailModelContext </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} event = not used
	 */
	BaseController.prototype.resetDetailModelValues = function () {

		var myModel = this.getView().getModel();
		var oTable = this.getView().byId(this.getTableId());

		oTable.removeSelections();

		var oItems = oTable.getItems();

		for (var i = 0; i < oItems.length; i++) {
			var sPath = oItems[i].getBindingContext().getPath();

			var oFullPath = sPath + "/IsChanged";

			if (myModel.getProperty(oFullPath) !== "") {

				myModel.setProperty(oFullPath, "");
			}
		}
		// remove all messages
		sap.ui.getCore().getMessageManager().removeAllMessages();
	};

	/**
	 * * <p> Handle the Console-Outputs for debugging </p>
	 * @author A. Hansson
	 * @instance 
	 * @param {Object} sValue = name of the function
	 * @param {Object} sOpt   = A: Anfang, E: Ende => start and end of a functioncall
	 */

	DetailController.prototype.show2Log = function (sValue, sOpt) {
		if (showConsole === true) {
			switch (sOpt) {
			case "A":
				consoleIdx++;
				break;
			case "E":
				consoleIdx--;
				break;
			}

			//				Log.info("****[2] (" + consoleIdx + ") DetailView: " + sValue);
			//console.log("****[2] (" + consoleIdx + ") DetailView: " + sValue);
			Log.info("****[2] (" + consoleIdx + ") DetailView: " + sValue);
		}
	};

	/* =========================================================== */
	/* begin: internal methods                                     */
	/* =========================================================== */

	/**
	 * Binds the view to the object path and expands the aggregated line items.
	 * @function
	 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
	 * @private
	 */
	DetailController.prototype._onObjectMatched = function (oEvent) {

		this.show2Log("_onObjectMatched", "A");

		var sObjectId;

		// sModus = oEvent.getParameter("arguments").modus;

		// var complete_url = window.location.href;
		// var modus = this.getHeaderData4Modus(complete_url);

		// if (this.getOwnerComponent().getModel("global").getProperty("/fromMaster")) {
		sObjectId = oEvent.getParameter("arguments").objectId;
		if (sObjectId !== undefined) {
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("HeaderCollection", {
					Vbeln: sObjectId

				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		}
		// } else {
		// 	//close FLP
		// 	// this.getModel("appView").setProperty("/layout", "OneColumn");
		// }

		//this.resetDetailModelValues();

		this.show2Log("_onObjectMatched-END", "E");
	};

	/**
	 * Binds the view to the object path. Makes sure that detail view displays
	 * a busy indicator while data for the corresponding element binding is loaded.
	 * @function
	 * @param {string} sObjectPath path to the object to be bound to the view.
	 * @private
	 */
	DetailController.prototype._bindView = function (sObjectPath) {

		this.show2Log("_bindView", "A");

		// Set busy indicator during view binding
		var oViewModel = this.getModel("detailView");

		// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
		oViewModel.setProperty("/busy", false);
		this.getView().getModel().setHeaders({
			"Modus": sModus
		});

		//sObjectPath= "/HeaderCollection(Vbeln='20016179', Modus='FREE')";

		this.getView().bindElement({
			path: sObjectPath,
		});
		// AB SAPUI5-Version 1.7x sind die Events das Problem, hier jetzt rausgenommen
			//parameters: "&Modus=FREE",
			// wenn hier functions definiert werden geht es nicht richtig beim Refresh!!!
		/*	
			events: {
				//change: this._onBindingChange.bind(this),

				dataRequested: 	oViewModel.setProperty("/busy", true),
				
				dataReceived: oViewModel.setProperty("/busy", false)
				
			}
			
		});
		*/
		this.show2Log("_bindView-END", "E");
	};

	DetailController.prototype._onBindingChange = function () {

		this.show2Log("_onBindingChange", "A");

		var oView = this.getView(),
			oElementBinding = oView.getElementBinding();

		// No data for the binding
		if (!oElementBinding.getBoundContext()) {
			this.getRouter().getTargets().display("detailObjectNotFound");
			// if object could not be found, the selection in the master list
			// does not make sense anymore.
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			return;
		}

		var sPath = oElementBinding.getPath(),
			oResourceBundle = this.getResourceBundle(),
			oObject = oView.getModel().getObject(sPath),
			sObjectId = oObject.Vbeln,
			sObjectName = oObject.Vbeln,
			oViewModel = this.getModel("detailView");

		this.getOwnerComponent().oListSelector.selectAListItem(sPath);

		oViewModel.setProperty("/shareSendEmailSubject",
			oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
		oViewModel.setProperty("/shareSendEmailMessage",
			oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		this.show2Log("_onBindingChange-END", "E");
	};

	DetailController.prototype._onMetadataLoaded = function () {

		this.show2Log("_onMetadataLoaded", "A");

		// Store original busy indicator delay for the detail view
		var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
			oViewModel = this.getModel("detailView"),
			oLineItemTable = this.byId(this.getTableId()),
			iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

		// Make sure busy indicator is displayed immediately when
		// detail view is displayed for the first time
		oViewModel.setProperty("/delay", 0);
		oViewModel.setProperty("/lineItemTableDelay", 0);

		oLineItemTable.attachEventOnce("updateFinished", function () {
			// Restore original busy indicator delay for line item table
			oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
		});

		// Binding the view will set it to not busy - so the view is always busy if it is not bound

		oViewModel.setProperty("/busy", true);

		// Restore original busy indicator delay for the detail view
		oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		this.show2Log("_onMetadataLoaded-END", "E");
	};

	/**
	 * Set the full screen mode to false and navigate to master page
	 */
	DetailController.prototype.onCloseDetailPress = function () {

		this.show2Log("onCloseDetailPress", "A");

		this.initializeData();

		// this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
		// // No item should be selected on master after detail page is closed
		// this.getOwnerComponent().oListSelector.clearMasterListSelection();
		// this.getRouter().navTo("master");
		this.show2Log("onCloseDetailPress-END", "E");
	};

	/**
	 * Toggle between full and non full screen mode.
	 */
	DetailController.prototype.toggleFullScreen = function () {

		this.show2Log("toggleFullScreen", "A");

		var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
		this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
		if (!bFullScreen) {
			// store current layout and go full screen
			this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
			this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
		} else {
			// reset to previous layout
			this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"));
		}
		this.show2Log("toggleFullScreen", "E");
	};

	return DetailController;

});