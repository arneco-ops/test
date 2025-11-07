sap.ui.define([
	"sap/ui/core/format/FileSizeFormat"
], function (FileSizeFormat) {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		// INIT unknown
		// GENE yellow
		// GEN2 yellow
		// GEN3 Yellow
		// GENV yellow
		// FREI green
		// BFRE Yellow
		// ABGE red
		// ANGB green
		// ANGE green
		// ZURU unknown
		// ERST unknown
		// IARB yellow
		// KABG red
		// INAK red
		// OTHERS unknown

		// List: Color BNS
		getBnsColor: function (sValue) {
			if (sValue < 40) {
				return "Good";
			} else if (sValue >= 70) {
				return "Error";
			} else {
				return "Critical";
			}
		},

		getPositionIcon: function (sValue, iIndex) {
			if (sValue === null) {
				return "sap-icon://status-negative";
			}
			if (iIndex === null) {
				return "sap-icon://status-negative";
			}

			let icon = "";
			let iEnd = iIndex++;
			let char = sValue.substring(iIndex, iEnd);
			switch (char) {
			case "9":
				icon = "sap-icon://status-in-process";
				break;
			case "8":
				icon = "sap-icon://status-positive";
				break;
			default:
				icon = "sap-icon://status-inactive";
			}
			return icon;

		},
		getPositionColor: function (sValue, iIndex) {
			let sState = "Error";
			let iEnd = iIndex++;

			if (sValue === null) {
				return sState;
			}
			if (iIndex === null) {
				return sState;
			}

			let char = sValue.substring(iIndex, iEnd);
			switch (char) {
			case "9":
				sState = "Warning";
				break;
			case "8":
				sState = "Success";
				break;
			default:
				sState = "Error";
			}
			return sState;

		},
		// List and Header: Status Icon
		getStatusIcon: function (sValue) {
			var icon = "";
			switch (sValue) {
			case "INIT":
				icon = "sap-icon://status-inactive";
				break;
			case "GENE":
				icon = "sap-icon://status-in-process";
				break;
			case "GEN2":
				icon = "sap-icon://status-in-process";
				break;
			case "FREI":
				icon = "sap-icon://status-positive";
				break;
			case "INAK":
				icon = "sap-icon://status-negative";
				break;
			default:
				icon = "sap-icon://status-negative";
			}
			return icon;

		},
		// List and Header: Status Icon
		isManualPricing: function (sValue) {
			var icon = "";
			switch (sValue) {
			case "X":
				icon = "sap-icon://accept";
				break;
			default:
				icon = "";
			}
			return icon;

		},
		// List and Header: Color Status Icon
		color: function (sValue) {
			var colorStatus = 0;
			switch (sValue) {
			case "INIT":
				colorStatus = 9;
				break;
			case "GENE":
				colorStatus = 1;
				break;
			case "GEN2":
				colorStatus = 1;
				break;
			case "FREI":
				colorStatus = 8;
				break;
			case "INAK":
				colorStatus = 3;
				break;
			default:
				colorStatus = 3;
			}
			return colorStatus;

		},
		// Header: Color Status
		status: function (sValue) {
			if (!sValue) {
				return "Information";
			} else if (sValue === "INIT") {
				return "Information";
			} else if (sValue === "GENE") {
				return "Warning";
			} else if (sValue === "GEN2") {
				return "Warning";
			} else if (sValue === "FREI") {
				return "Success";
			} else if (sValue === "INAK") {
				return "Error";
			} else {
				return "Error";
			}
		},
		// List: Icon Partner visible
		partnerIcon: function (sValue) {
			if (!sValue) {
				return "";
			} else {
				return "sap-icon://person-placeholder";
			}
		},
		// List: Icon Partner visible
		getFileType: function (sValue) {
			var icon = "";
			switch (sValue) {
			case "pdf":
				icon = "sap-icon://pdf-attachment";
				break;
			case "xls":
				icon = "sap-icon://excel-attachment";
				break;
			case "doc":
				icon = "sap-icon://word-attachment";
				break;
			case "ppt":
				icon = "sap-icon://ppt-attachment";
				break;	
			case "jpg":
				icon = "sap-icon://attachment-photo";
				break;
			case "txt":
				icon = "sap-icon://document-text";
				break;
			case "msg":
				icon = "sap-icon://email";
				break;
			default:
				icon = "sap-icon://document";
			}
			return icon;
		},
		//Single: review		
		showminus: function (sValue1) {
			var showminus = " - ";
			if (!sValue1) {
				showminus = "";
			}
			return (showminus);
		},
		//Single: Icon gruop or employee
		approvTxt: function (sValue) {
			if (!sValue) {
				return "sap-icon://group";
			} else {
				return "sap-icon://employee-approvals";
			}
		},
		//Single: Status Color employee Icon
		noApprovState: function (sValue) {
			if (!sValue) {
				return "None";
			} else {
				return "Success";
			}
		},
		//Single: Text for no Approval 
		noApprovtxt: function (sValue) {
			if (!sValue) {
				return "offen";
			}
			return (sValue);
		},
		//Single: Build Text for Format mode = T (for Tooltip)
		buidlFormatText: function (sShow, sMode, sWidth, sWidthM, sHeight, sHeightM) {
			var result = "";
			var widthM = "";
			var heightM = "";
			var minus = " - ";
			if (sMode === "T") {
				minus = "";
			} else {
				if (sShow !== true) {
					return result;
				}
			}
			switch (sWidthM) {
			case "SP":
				widthM = "Sp.";
				break;
			case "MM":
				widthM = "mm";
				break;
			default:
				widthM = sWidthM;
			}
			switch (sHeightM) {
			case "MM":
				heightM = "mm";
				break;
			default:
				heightM = sHeightM;
			}
			result = minus + sWidth + " " + widthM + " x " + sHeight + " " + heightM;
			return result;
		},
		showValue: function (sValue1) {
			if (!sValue1) {
				return ("");
			}
			return sValue1;
		},
		//Single: Build Text for Ad Specials
		buildAdsText: function (sValue1, sValue2, sValue3) {
			//var oCurrency = new sap.ui.model.type.Currency({
			//      showMeasure: false       
			//  });
			//var oCurrency =  oCurrency.formatValue(sValue3);
			// var sMenge = (parseFloat(sValue3).toFixed(0)) * 1;

			var sAdSText = sValue1 + " - " + sValue2 + " g" + " - " + sValue3 + " St.";
			if (!sValue1) {
				sAdSText = "";
			}
			return sAdSText;
		},
		//Single: Flex Box Ad Special visible?
		AdSX: function (sValue1) {
			var sAdSX = true;
			if (!sValue1) {
				sAdSX = false;
			}
			return sAdSX;
		},
		//Single: Flex Box Print visible?
		PrintX: function (sValue1) {
			var sPrintX = true;
			if (!sValue1) {
				sPrintX = false;
			}
			return sPrintX;
		},
		

		//Single: Button Layout multiple "Format" visible
		MultipleX: function (sValue1, sValue2) {
			var sMultiple = true;
			if (!sValue1 & !sValue2 ) {
				sMultiple = false;
			}
			return sMultiple;
		},
		
		//Single: Button multiple Werbeträger visible
		WtMultipleX: function (sValue1) {
			var sWtMultiple = true;
			if (!sValue1) {
				sWtMultiple = false;
			}
			return sWtMultiple;
		},
		//Single: Flex Box multiple "Format" visible
		FormatMultipleX1: function (sValue1) {
			var sFormatMultiple = true;
			if (!sValue1) {
				sFormatMultiple = false;
			}
			return sFormatMultiple;
		},
		//Single: Flex Box multiple "Format" visible
		FormatMultipleX2: function (sValue1) {
			var sFormatMultiple = false;
			if (!sValue1) {
				sFormatMultiple = true;
			}
			return sFormatMultiple;
		},
		
		//Single: Flex Box multiple "Werbeträger" visible
		WtMultipleX1: function (sValue1) {
			var sWtMultiple = true;
			if (!sValue1) {
				sWtMultiple = false;
			}
			return sWtMultiple;
		},
		//Single: Flex Box multiple "Werbeträger" visible
		WtMultipleX2: function (sValue1) {
			var sWtMultiple = false;
			if (!sValue1) {
				sWtMultiple = true;
			}
			return sWtMultiple;
		},
		
		// Currency
		currencyValue: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		// ApprovGroup
		approvGrp: function (sValue) {
			if (!sValue) {
				return false;
			} else if (sValue === "FREE") {
				return true;
			} else {
				return false;
			}
		},
		// Modus
		modus: function (sValue) {
			if (!sValue) {
				return false;
			} else if (sValue === "FREE") {
				return true;
			} else {
				return false;
			}
		},
		// Datepicker
		modusDatepicker: function (sValue) {
			if (!sValue) {
				return true;
			} else if (sValue === "FREE") {
				return false;
			} else {
				return true;
			}
		},
		// MultiSelect
		selectMode: function (sValue) {
			if (!sValue) {
				return "None";
			} else if (sValue === "FREE") {
				return "MultiSelect";
			} else {
				return "None";
			}
		},
		// Footer Detail
		footerDetail: function (sValue) {
			if (!sValue) {
				return false;
			} else if (sValue === "FREE") {
				return true;
			} else {
				return false;
			}
		},
		// Footer Header
		footerHeader: function (sValue) {
			if (!sValue) {
				return false;
			} else if (sValue === "PLM") {
				return true;
			} else {
				return false;
			}
		},
		// obsolete
		currencyValue0: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(0);
		},
		// Flagged for 070 Vkbur
		vkburCentralTeam: function (sValue) {
			if (!sValue) {
				return "TextOnly";
			} else if (sValue === "070") {
				return "IconOnly";
			} else {
				return "TextOnly";
			}

		},
		// Copy Flagged for 070 Vkbur
		vkburCentralTeamCopy: function (sValue) {
			if (!sValue) {
				return "";
			} else if (sValue === "070") {
				return "- Zentralteam";
			}

		},

		// build the AttachmentLink
		getAttachment: function (sDocId) {
			let oModel = this.getModel();
			let sModelPath = oModel.sServiceUrl;
			sModelPath = sModelPath + oModel.createKey("/AttachmentCollection", {
				DocumentId: sDocId
			}) + "/$value";
			return sModelPath;

			// let sLink = "/sap/opu/odata/SAP/ZQU_PM_LIST_SRV/AttachmentCollection('" + sDocId + "')/$value";
			// return sLink;
		},
		formatAttribute: function (sValue) {
			if (jQuery.isNumeric(sValue)) {
				return FileSizeFormat.getInstance({
					binaryFilesize: false,
					maxFractionDigits: 1,
					maxIntegerDigits: 3
				}).format(sValue);
			} else {
				return sValue;
			}
		},

	};

});