sap.ui.define([
	"de/axelspringer/sd/advertising/Angebots_Liste/controller/BaseController"
	], function (BaseController) {
		"use strict";
	
		const NotFoundController = BaseController.extend("de.axelspringer.sd.advertising.Angebots_Liste.controller.NotFound", {});

		

			NotFoundController.prototype.onInit = function () {
				this.getRouter().getTarget("notFound").attachDisplay(this._onNotFoundDisplayed, this);
			};

			NotFoundController.prototype._onNotFoundDisplayed = function () {
					this.getModel("appView").setProperty("/layout", "OneColumn");
			};
		return NotFoundController;
	}
);