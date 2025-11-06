/*global history */
sap.ui.define([
	"de/axelspringer/sd/advertising/Angebots_Liste/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"de/axelspringer/sd/advertising/Angebots_Liste/model/formatter",
	"sap/ui/core/EventBus",
	"sap/base/Log"

], function (BaseController, JSONModel, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, MessageBox, MessageToast, formatter,
	EventBus, Log) {
	"use strict";

	//	var showConsole = false;
	var showConsole = false;
	var consoleIdx = 0;
	var sModus = "UNKNOWN";

	const MasterController = BaseController.extend("de.axelspringer.sd.advertising.Angebots_Liste.controller.Master", {

		formatter: formatter

	});

	/**
	 * To handle the offers, you have to choose one on this controller
	 * After choosing an offer, the detail content will dispalyed in the middle section of the window.
	 * 
	 * 
	 **/

	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */

	/**
	 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
	 * @public
	 */
	MasterController.prototype.onInit = function (event) {
		// Control state model

		consoleIdx = 0;

		// var oCore = sap.ui.getCore();

		// window["sap-ui-config"] = {
		// 	frameOptions: 'allow',
		// 	frameOptionsConfig: {
		// 		callback: function (bSuccess) {
		// 			if (bSuccess) {
		// 				alert("App is allowed to run!");
		// 			} else {
		// 				alert("App is not allowed to run!");
		// 			}
		// 		}
		// 	}
		// };

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

		//			var sParameters = var sValue = jQuery.sap.getUriParameters().get("myUriParam");

		var oList = this.byId("list"),
			oViewModel = this._createViewModel(),
			// Put down master list's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the master list is
			// taken care of by the master list itself.

			iOriginalBusyDelay = oList.getBusyIndicatorDelay();

		var oEventBus = sap.ui.getCore().getEventBus();
		oEventBus.subscribe("Detail", "reLoadMaster", this.onReload, this);
		// oEventBus.subscribe("ErrorHandler", "getModus", this.getModus,  this);
		// oEventBus.subscribe("Detail", "updateFinishedMaster", this.onUpdateFinished, this );

		// Handle URl-Parameter

		// var complete_url = window.location.href;
		// var modus = this.getHeaderData4Modus(complete_url);

		// sModus = modus;

		this._oGroupFunctions = {
			ZzBns: function (oContext) {
				var iGrouper = oContext.getProperty('ZzBns'),
					key, text;
				if (iGrouper <= 20) {
					key = "LE20";
					text = this.getResourceBundle().getText("masterGroup1Header1");
				} else {
					key = "GT20";
					text = this.getResourceBundle().getText("masterGroup1Header2");
				}
				return {
					key: key,
					text: text
				};
			}.bind(this)
		};

		this._oList = oList;
		// keeps the filter and search state

		this._oListFilterState = {
			aFilter: [],
			aSearch: []
		};

		this.setModel(oViewModel, "masterView");
		// Make sure, busy indication is showing immediately so there is no
		// break after the busy indication for loading the view's meta data is
		// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
		oList.attachEventOnce("updateFinished", function () {
			//			oList.attachEvent("updateFinished", function () {
			// Restore original busy indicator delay for the list

			oViewModel.setProperty("/delay", iOriginalBusyDelay);
		});

		this.initDate();

		this.getView().addEventDelegate({
			onBeforeFirstShow: function () {

				// this.getModel("appView").setProperty("/", modus);
				this.getOwnerComponent().oListSelector.setBoundMasterList(oList);

			}.bind(this)
		});

		// Routing Stuff
		var oRouter = this.getRouter();

		oRouter.getRoute("master").attachPatternMatched(this._onMasterMatched, this);
		// oRouter.getRoute("masterWithParameter").attachPatternMatched(
		// 	this._onMasterParamMatched, this);
		oRouter.getRoute("detail").attachPatternMatched(this._onDetailMatched, this);

		oRouter.attachBypassed(this.onBypassed, this);

		// set the new filter to the view (preset for filter needed)
		oList.bindItems("/HeaderCollection", this.getView().byId("masterRow"), null, this.getFilterDate());

	};

	// Date Functions -------------------------------------------

/**
 * * <p> set the correct dates for the first oData call </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} eEvent = not used
 */
	// init the date for DatePicker
	MasterController.prototype.initDate = function () {

		this.show2Log("initDate", "A");

		// actual date
		var toDate = new Date();
		// reference to the view
		let oModel = this.getModel("masterView");

		// 14 days ago
		var oDateF = this.manipulateDate(toDate, 14, "sub");
		// actual day
		var oDateT = this.manipulateDate(toDate, 0, "add");

		// Set the Dates into the Model
		this.setDateValue("DP1", oDateF);
		this.setDateValue("DP2", oDateT);
		this.show2Log("initDate-END", "E");

	};

/**
 * * <p> set the correct date range to 14 days to the past </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} date = starting date
 * @param {Object} days = period to the past
 * @param {Object} operation = "add" or "sub" - add or subtraction
 */
	// set the from to range (14 days)
	MasterController.prototype.manipulateDate = function (date, days, operation) {

		this.show2Log("manipulateDate", "A");

		// add and subtract days from date
		var dateOffset = (24 * 60 * 60 * 1000) * days;
		var myDate = new Date();
		if (operation === "sub") {
			myDate.setTime(date.getTime() - dateOffset);
		} else if (operation === "add") {
			myDate.setTime(date.getTime() + dateOffset);
		}
		this.show2Log("manipulateDate-END", "E");
		return myDate;
	};

/**
 * * <p> checks, if date from is lower then date to </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} dateFrom = from Date
 * @param {Object} dateTo = to Date
 */
	// check, if dateF > dateT =>>> ERROR
	MasterController.prototype.checkDateValues = function (dateFrom, dateTo) {

		this.show2Log("checkDateValues", "A");

		if (dateFrom > dateTo) {
			this.show2Log("checkDateValues-END -1", "E");
			return -1;
		} else {
			this.show2Log("checkDateValues-END 1", "E");
			return 1;
		}
	};

/**
 * * <p> get the Date from the Model </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} dateId = Reference to the model-property
 */
	// 
	MasterController.prototype.getDateValue = function (dateId) {

		this.show2Log("getDateValue", "A");

		// get data from view
		let oModel = this.getModel("masterView");

		let search = "/" + dateId;
		let oDate = oModel.getProperty(search);
		this.show2Log("getDateValue-END", "E");
		return oDate;

	};

/**
 * * <p> set the Date to the Model </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} dateId = Reference to the model-property
 * @param {Object} date = Date value
 */
	// set the Date to the Model
	MasterController.prototype.setDateValue = function (dateId, date) {

		this.show2Log("setDateValue", "A");

		// get data from view
		let oModel = this.getModel("masterView");
		let search = "/" + dateId;
		let oDate = oModel.setProperty(search, date);
		this.show2Log("setDateValue-END", "E");

	};

/**
 * * <p> call oData with chanegd date values </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} oEvent = not used
 */
	MasterController.prototype.handleChangeDate = function (oEvent) {

		this.show2Log("handleChangeDate", "A");

		// // get data from view
		// var oDateF = this.getView().byId("DP1").getValue();
		// var oDateT = this.getView().byId("DP2").getValue();
		var mDateF = this.getDateValue("DP1");
		var mDateT = this.getDateValue("DP2");
		if (this.checkDateValues(mDateF, mDateT) < 1) {
			this.showError();
		}
		this.show2Log("handleChangeDate-END", "E");
	};

/**
 * * <p> get the from and to date </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} oEvent = not used
 */
	MasterController.prototype.getFilterDate = function () {

		this.show2Log("getFilterDate", "A");

		// get data from view

		var oDateF = this.getDateValue("DP1");
		var oDateT = this.getDateValue("DP2");

		var mDateF = this.convertDate4Sap(oDateF);
		var mDateT = this.convertDate4Sap(oDateT);

		var pFilter = [];
		// build the fiter array

		//				pFilter.push(new Filter("ApprovDate", FilterOperator.BT,mDateF, mDateT ));
		pFilter.push(new Filter("SelDate", FilterOperator.BT, mDateF, mDateT));
		//	pFilter.push(new Filter("Vbeln", FilterOperator.BT, mDateF, mDateT));

		// get the Approval Group
		let oMcomboBox = this.byId("ApprovGrp");
		let tKeys = oMcomboBox.getSelectedKeys();

		for (var i = 0; i < tKeys.length; i++) {
			pFilter.push(new Filter("ApprovGrp", FilterOperator.EQ, tKeys[i]));
		}
		// set the mode filter
		var oViewModel = this.getModel("masterView");

		var sParam = oViewModel.getProperty("/Modus");

		if (sParam === "UNKNOWN") {
			// on Init is running
			sParam = sModus;
		}

		pFilter.push(new Filter("Modus", FilterOperator.EQ, sParam));

		this.show2Log("getFilterDate-END", "E");
		return pFilter;

	};
	
/**
 * * <p> reformat the date value to internal SAP format </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} value = UI5-Date-Format
 */
	
	MasterController.prototype.convertDate4Sap = function (value) {

		this.show2Log("convertDate4Sap", "A");

		// re-arrange the date value dd-mm-yyyy => yyyymmdd
		let dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			pattern: "YYYYMMdd"
		});
		let dateFormatted = dateFormat.format(value);

		//var newDate = value.substring(6, 10) + value.substring(3, 5) + value.substring(0, 2);
		this.show2Log("convertDate4Sap-END", "E");
		return dateFormatted;
	};

	// Date Functions -----------END--------------------------------

/**
 * * <p> handle the error output </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} oEvent = not used
 */

	MasterController.prototype.showError = function () {

		this.show2Log("showError", "A");

		// sap.m.MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("dateErrorText"));
		var messagetxt = this.getView().getModel("i18n").getResourceBundle().getText("dateErrorText");
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

		MessageBox.show(messagetxt, {
			icon: MessageBox.Icon.WARNING,
			title: "Warning",
			actions: [MessageBox.Action.OK],
			id: "messageBoxId1",
			details: "<p><strong>Ursache:</strong></p>\n" +
				"<ul>" +
				"<li><em>Enddatum<em> ist größer als <em>Startdatum<em>.</li>" +
				"<br>oder" +
				"<li><em>Startdatum<em> ist größer als <em>Endedatum<em></li>" +
				"</ul>",
			styleClass: bCompact ? "sapUiSizeCompact" : "",
			contentWidth: "100px"
		});
		this.show2Log("showError-END", "E");
	};

	/* =========================================================== */
	/* event handlers                                              */
	/* =========================================================== */

	/**
	 * Before list data is available, 
	 * @param {sap.ui.base.Event} oEvent the update started event
	 * @public 
	 **/

/**
 * * <p> Update started event, initializing data </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} oEvent = not used
 */

	MasterController.prototype.onUpdateStarted = function (oEvent) {

		this.show2Log("onUpdateStarted", "A");

		this.initializeData();

		this.show2Log("onUpdateStarted-END", "E");
		// 
	};

	/**
	 * After list data is available, this handler method updates the
	 * master list counter
	 * @param {sap.ui.base.Event} oEvent the update finished event
	 * @public
	 */
	MasterController.prototype.onUpdateFinished = function (oEvent) {

		this.show2Log("onUpdateFinished", "A");

		this.objectId = null;

		// // // reset the model			
		//var oModel = sap.ui.getCore().getModel(); //Get Hold of the Model
		// oModel.setData(null); 
		// set to one Column
		//this.getModel("appView").setProperty("/layout", "OneColumn");

		var oList = this.getView().byId("list");
		var oFirstItem = oList.getItems()[0];

		if (typeof oFirstItem === "undefined") {
			// nothing found - clear details
			this.initializeData();
			// } else {
			// 	// set to first row

			// 	// this.objectId = oFirstItem.mProperties.intro;
		}

		// seect the first row
		oList.setSelectedItem(oFirstItem, true, true);

		// // is something selected

		// update the master list object counter after new data is loaded
		this._updateListItemCount(oEvent.getParameter("total"));

		// if (this.objectId) {
		let list = this.byId("list");

		if (!list.getSelectedItem()) {
			let items = list.getItems();
			let selectedItem = items.find(function (item) {
				let context = item.getBindingContext().getObject();
				return context.Vbeln === this.objectId;
			}.bind(this));

			if (selectedItem) {
				list.setSelectedItem(selectedItem, true, true);
			}
		}
		// 	this.objectId = null;

		// } else {
		// 	this.showDetailAfterFirstDisplay();
		// }

		//this.onSelectionChange(oEvent);

		this.show2Log("onUpdateFinished-END", "E");
		// 
	};

	/**
	 * Event handler for the master search field. Applies current
	 * filter value and triggers a new search. If the search field's
	 * 'refresh' button has been pressed, no new search is triggered
	 * and the list binding is refresh instead.
	 * @param {sap.ui.base.Event} oEvent the search event
	 * @public
	 */
	MasterController.prototype.onSearch = function (oEvent) {

		this.show2Log("onSearch", "A");

		if (oEvent.getParameters().refreshButtonPressed) {
			// Search field's 'refresh' button has been pressed.
			// This is visible if you select any master list item.
			// In this case no new search is triggered, we only
			// refresh the list binding.
			this.onRefresh();
			return;
		}

		//var sQuery = oEvent.getParameter("query");

		//if (sQuery) {

		// var oFromDate = this.getView().byId('DP1').getValue();
		// var oToDate = this.getView().byId('DP2').getValue();

		this._oListFilterState.aSearch = [this.getFilterDate()];
		// this._oListFilterState.aSearch = [new Filter("Vbeln", FilterOperator.Contains, sQuery)];
		// } else {
		// 	this._oListFilterState.aSearch = [];
		// }
		this._applyFilterSearch();
		this.show2Log("onSearch-END", "E");

	};

/**
 * * <p> press the reload button and restart the selection (odata call) </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} sChannel = when undifined, initial call
 * @param {Object} sEvent = not used
 * @param {Object} oObject = not used
 * 
 */
	
	
	MasterController.prototype.onReload = function (sChannel, sEvent, oObject) {

		this.show2Log("onReload", "A");

		if (sChannel === undefined) {
			this.show2Log("onReload-END-NULL");
			return;
		}

		var oList = this.getView().byId("list");
		var oBinding = oList.getBinding("items");

		var mDateF = this.getDateValue("DP1");
		var mDateT = this.getDateValue("DP2");

		if (this.checkDateValues(mDateF, mDateT) < 1) {
			this.showError();
		} else {

			// filter binding
			// Application-Eintrag ist wichtig, sonst fliegt Filter wieder raus!
			//				oBinding.filter(this.getFilterDate(),"Application");
			oBinding.filter(this.getFilterDate(), sap.ui.model.FilterType.Application);
		}

		this.show2Log("onReload-END", "E");
	};

	/**
	 * Event handler for refresh event. Keeps filter, sort
	 * and group settings and refreshes the list binding.
	 * @public
	 */
	MasterController.prototype.onRefresh = function () {

		this.show2Log("onRefresh", "A");

		this._oList.getBinding("items").refresh();
		this.show2Log("onRefresh-END", "E");
	};

	/**
	 * Event handler for the filter, sort and group buttons to open the ViewSettingsDialog.
	 * @param {sap.ui.base.Event} oEvent the button press event
	 * @public
	 */
	MasterController.prototype.onOpenViewSettings = function (oEvent) {

		this.show2Log("onOpenViewSettings", "A");

		if (!this._oViewSettingsDialog) {
			this._oViewSettingsDialog = sap.ui.xmlfragment("de.axelspringer.sd.advertising.angebotsliste.view.ViewSettingsDialog", this);
			this.getView().addDependent(this._oViewSettingsDialog);
			// forward compact/cozy style into Dialog
			this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
		var sDialogTab = "sort";
		if (oEvent.getSource() instanceof sap.m.Button) {
			var sButtonId = oEvent.getSource().sId;
			if (sButtonId.match("filter")) {
				sDialogTab = "filter";
			} else if (sButtonId.match("group")) {
				sDialogTab = "group";
			}
		}
		this._oViewSettingsDialog.open(sDialogTab);
		this.show2Log("onOpenViewSettings-END", "E");
	};

	/**
	 * Event handler called when ViewSettingsDialog has been confirmed, i.e.
	 * has been closed with 'OK'. In the case, the currently chosen filters, sorters or groupers
	 * are applied to the master list, which can also mean that they
	 * are removed from the master list, in case they are
	 * removed in the ViewSettingsDialog.
	 * @param {sap.ui.base.Event} oEvent the confirm event
	 * @public
	 */
	MasterController.prototype.onConfirmViewSettingsDialog = function (oEvent) {

		this.show2Log("onConfirmViewSettingsDialog", "A");

		var aFilterItems = oEvent.getParameters().filterItems,
			aFilters = [],
			aCaptions = [];

		// update filter state:
		// combine the filter array and the filter string
		aFilterItems.forEach(function (oItem) {
			switch (oItem.getKey()) {
			case "Filter1":
				aFilters.push(new Filter("ZzBns", FilterOperator.LE, 100));
				break;
			case "Filter2":
				aFilters.push(new Filter("ZzBns", FilterOperator.GT, 100));
				break;
			default:
				break;
			}
			aCaptions.push(oItem.getText());
		});

		this._oListFilterState.aFilter = aFilters;
		this._updateFilterBar(aCaptions.join(", "));
		this._applyFilterSearch();
		this._applySortGroup(oEvent);
		this.show2Log("onConfirmViewSettingsDialog-END", "E");
	};

	/**
	 * Apply the chosen sorter and grouper to the master list
	 * @param {sap.ui.base.Event} oEvent the confirm event
	 * @private
	 */
	MasterController.prototype._applySortGroup = function (oEvent) {

		this.show2Log("_applySortGroup", "A");

		var mParams = oEvent.getParameters(),
			sPath,
			bDescending,
			aSorters = [];
		// apply sorter to binding
		// (grouping comes before sorting)
		if (mParams.groupItem) {
			sPath = mParams.groupItem.getKey();
			bDescending = mParams.groupDescending;
			var vGroup = this._oGroupFunctions[sPath];
			aSorters.push(new Sorter(sPath, bDescending, vGroup));
		}
		sPath = mParams.sortItem.getKey();
		bDescending = mParams.sortDescending;
		aSorters.push(new Sorter(sPath, bDescending));
		this._oList.getBinding("items").sort(aSorters);
		this.show2Log("_applySortGroup-END", "E");
	};

	/**
	 * Event handler for the list selection event
	 * @param {sap.ui.base.Event} oEvent the list selectionChange event
	 * @public
	 */
	MasterController.prototype.onSelectionChange = function (oEvent) {

		this.show2Log("onSelectionChange", "A");

		var oList = oEvent.getSource(),
			bSelected = oEvent.getParameter("selected");

		// skip navigation when deselecting an item in multi selection mode
		if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
			// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
			this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		}
		this.show2Log("onSelectionChange-END", "E");
	};

	/**
	 * Event handler for the bypassed event, which is fired when no routing pattern matched.
	 * If there was an object selected in the master list, that selection is removed.
	 * @public
	 */
	MasterController.prototype.onBypassed = function () {

		this.show2Log("onBypassed", "A");

		this._oList.removeSelections(true);
		this.show2Log("onBypassed", "E");
	};

	/**
	 * Used to create GroupHeaders with non-capitalized caption.
	 * These headers are inserted into the master list to
	 * group the master list's items.
	 * @param {Object} oGroup group whose text is to be displayed
	 * @public
	 * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
	 */
	MasterController.prototype.createGroupHeader = function (oGroup) {

		//this.show2Log("createGroupHeader","A");

		return new GroupHeaderListItem({
			title: oGroup.text,
			upperCase: false
		});
	};

	/**
	 * Event handler for navigating back.
	 * We navigate back in the browser historz
	 * @public
	 */
	MasterController.prototype.onNavBack = function () {

		//this.show2Log("onNavBack","A");

		history.go(-1);
		//this.show2Log("onNavBack","E");
	};

	/* =========================================================== */
	/* begin: internal methods                                     */
	/* =========================================================== */

/**
 * * <p> Create internal view model </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} sEvent = not used
 * 
 */
	MasterController.prototype._createViewModel = function () {

		this.show2Log("_createViewModel", "A");

		var oJson = new JSONModel({
			isFilterBarVisible: false,
			filterBarLabel: "",
			delay: 0,
			DP1: new Date("2019-01-01"),
			DP2: new Date("9999-12-31"),
			DatePickerVisible: false,
			MultiComboBoxVisible: false,
			Modus: "UNKNOWN",
			HeaderCount: 0,
			title: this.getResourceBundle().getText("masterTitleCount", [0]),
			noDataText: this.getResourceBundle().getText("masterListNoDataText"),
			sortBy: "Vbeln",
			groupBy: "None"
		});
		this.show2Log("_createViewModel-END", "E");
		return oJson;

	};

/**
 * * <p> not used </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} sEvent = not used
 * 
 */

	MasterController.prototype._onMasterMatched = function (event) {

		this.show2Log("_onMasterMatched", "A");

		//Set the layout property of the FCL control to 'OneColumn'
		//-----------------------------------------------------------------
		// Macht ärger
		//this.getModel("appView").setProperty("/layout", "OneColumn");
		// Macht ärger
		//-----------------------------------------------------------------

		this.show2Log("_onMasterMatched-END");
	};

/**
 * * <p> bundles the detail to the master </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} sEvent = Context for the function
 * 
 */

	MasterController.prototype._onDetailMatched = function (event) {
		this.show2Log("_onDetailMatched", "A");

		this.objectId = event.getParameters().arguments.objectId;

		this.show2Log("_onDetailMatched-END", "E");
	};
	/**
	 * Shows the selected item on the detail page
	 * On phones a additional history entry is created
	 * @param {sap.m.ObjectListItem} oItem selected Item
	 * @private
	 */

/**
 * * <p> navigates to the detail Page </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} oItem = Context for the function
 * 
 */

	MasterController.prototype._showDetail = function (oItem) {

		this.show2Log("_showDetail", "A");
		this.getOwnerComponent().getModel("global").setProperty("/fromMaster", true);

		var bReplace = !Device.system.phone;
		// set the layout property of FCL control to show two columns
		this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
		this.show2Log("_showDetail~navTo Detail", "A");

		this.getRouter().navTo("detail", {
			objectId: oItem.getBindingContext().getProperty("Vbeln")
				// modus: this.getModel("masterView").getProperty("/Modus")
		}, bReplace);
		this.show2Log("_showDetail~navTo Detail", "E");
		this.show2Log("_showDetail-END", "E");
	};

	/**
	 * Sets the item count on the master list header
	 * @param {integer} iTotalItems the total number of items in the list
	 * @private
	 */
	MasterController.prototype._updateListItemCount = function (iTotalItems) {

		this.show2Log("_updateListItemCount", "A");

		var sTitle;
		// only update the counter if the length is final
		if (this._oList.getBinding("items").isLengthFinal()) {
			sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
			this.getModel("masterView").setProperty("/title", sTitle);
		}
		this.show2Log("_updateListItemCount-END", "E");
	};

	/**
	 * Internal helper method to apply both filter and search state together on the list binding
	 * @private
	 */
	MasterController.prototype._applyFilterSearch = function () {

		this.show2Log("_applyFilterSearch", "A");

		var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
			oViewModel = this.getModel("masterView");
		this._oList.getBinding("items").filter(aFilters, "Application");
		// changes the noDataText of the list in case there are no filter results
		if (aFilters.length !== 0) {
			oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
		} else if (this._oListFilterState.aSearch.length > 0) {
			// only reset the no data text to default when no new search was triggered
			oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
		}
		this.show2Log("_applyFilterSearch-END", "E");
	};

	/**
	 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
	 * @param {string} sFilterBarText the selected filter value
	 * @private
	 */
	MasterController.prototype._updateFilterBar = function (sFilterBarText) {

		this.show2Log("_updateFilterBar", "A");

		var oViewModel = this.getModel("masterView");
		oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
		oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));

		this.show2Log("_updateFilterBar", "E");

	};


/**
 * * <p> show the detail after first start of the app </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} sEvent = not used
 * 
 */


	MasterController.prototype.showDetailAfterFirstDisplay = function () {

		this.show2Log("showDetailAfterFirstDisplay", "A");

		var oList = this.getView().byId("list"),
			oFirstItem = oList.getItems()[0];

		if (typeof oFirstItem === "undefined") {
			// nothing found - clear details
			this.initializeData();
		} else {
			oList.setSelectedItem(oFirstItem, true, true);
		}
		this.show2Log("showDetailAfterFirstDisplay-END", "E");
	};
	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf de.axelspringer.sd.advertising.angebotsliste.view.StartAsFree
	 */
	MasterController.prototype.onBeforeRendering = function () {

		this.show2Log("onBeforeRendering", "A");

		// set the correct settings
		var oViewModel = this.getModel("masterView");
		oViewModel.setProperty("/Modus", sModus);
		//var oViewModel = this.getModel("masterView");

		this.getModel().reset;

		this.setModeParameter(oViewModel.getProperty("/Modus"));

		this.show2Log("onBeforeRendering-END", "E");
	};
	MasterController.prototype.onAfterRendering = function () {

		this.show2Log("onAfterRendering", "A");
		// var oList = this.byId("list")
		// oList.removeSelections();

		// //			this.setModeParameter("INIT");
		// var sModus = this.getModelValue("appView", "/modus");
		// this.setModeParameter(sModus);

		// set Data for Header
		// set the correct settings
		// var oViewModel = this.getModel("masterView");
		// var param = oViewModel.getProperty("/Modus");
		// var oDataModel = this.getModel();
		// oDataModel.setHeaders({
		// 	"ModusHuhu": "MvValueHalo"
		// });

		// // set the counter
		// var oList = this.getView().byId("list"),
		// 	oCnt = oList.getBinding("rows").getLength();

		// var oViewModel = this.getModel("masterView");
		// oViewModel.setProperty("/HeaderCount", oCnt);

		this.show2Log("onAfterRendering-END", "E");

	};
	MasterController.prototype.onExit = function () {

		this.show2Log("onExit", "A");

		var oEventBus = sap.ui.getCore().getEventBus();
		oEventBus.unsubscribe("Detail", "reLoadMaster", this.onReload, this);
		// oEventBus.unsubscribe("ErrorHandler", "getModus", this.getModus, this);
		this.show2Log("onExit-END", "E");

	};

/**
 * * <p> Handle the Console-Outputs for debugging </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} sValue = name of the function
 * @param {Object} sOpt   = A: Anfang, E: Ende => start and end of a functioncall
 */
	MasterController.prototype.show2Log = function (sValue, sOpt) {
		if (showConsole === true) {
			switch (sOpt) {
			case "A":
				consoleIdx++;
				break;
			case "E":
				consoleIdx--;
				break;
			}
			//				console.log("*(" + consoleIdx + ") MasterView: " + sValue);
			//				Log.debug("*(" + consoleIdx + ") MasterView: " + sValue);
			Log.info("*(" + consoleIdx + ") MasterView: " + sValue);
		}
	};
/**
 * * <p> retuirn the modus value </p>
 * @author A. Hansson
 * @instance 
 * @param {Object} sEvent = not used
 */	
	MasterController.prototype.getModus = function () {
		return sModus;
	};

	return MasterController;
});