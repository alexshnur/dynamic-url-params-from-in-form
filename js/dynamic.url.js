/*global $:false, jQuery:false*/
/*
Dynamic URL params from/in form v.0.1
by Aleksandr Nikitin (a.nikitin@i.ua)
 https://github.com/alexshnur/dynamic-url-params-from-in-form
*/
(function($, window){
	var readUrlForm, _this, getParam = {};

	function supportsHistoryApi() {
		return !!(window.history && history.pushState);
	}

	readUrlForm = (function(){
		var $form, $formControl, $button;
		function initializationForm (form, options){
			_this = this;
			_this.options = $.extend({}, _this.options, options);
			$form = form;
			$formControl = $(_this.options.formControl);
			$button = $(_this.options.buttonSubmit)
			_this.openPage();
			$button.on('click', _this.readFormControl);
		}

		initializationForm.prototype = {
			options: {
				removeKeyInUrl: ['offset', 'limit', 't', 'heightScrollPosition', 'idAfterRows'],
				formControl: '.form-control',
				buttonSubmit: '.btn'
			},
			openPage: function(){
				_this.readUrl();
				window.onload = function() {
					window.setTimeout(function(){
						window.addEventListener('popstate', function() {
							_this.readUrl();
						}, false);
					}, 1);
				};
			},
			readUrl: function(){
				var urlQueryString = location.search;
				$form[0].reset();
				if (urlQueryString !== '') {
					getParam = {};
					_this.readUrlParam();
					$.each(getParam, function(key, value){
						$form.find('[data-name="' + key + '"]').val(value);
					});
				}
			},
			readUrlParam: function(){
				var urlQueryString = location.search,
					getTmp1, getTmp2;
				getParam = {};
				if (urlQueryString !== '') {
					getTmp1 = (urlQueryString.substr(1)).split('&');
					for (var i = 0; i < getTmp1.length; i++) {
						getTmp2 = getTmp1[i].split('=');
						getParam[getTmp2[0]] = getTmp2[1];
					}
				}
			},
			readFormControl: function(){
				var data = {};
				$formControl.each(function(){
					var key = $(this).data('name');
					if (($(this).val() !== 'manual_input') || $(this).val()) {
						data[key] = $(this).val();
					}
				});
				_this.removeEmptyProperties(data);
				_this.setUrlParameters(data);
			},
			setUrlParameters: function(data){
				if (supportsHistoryApi()) {
					var arr = _this.removeKeyFromObject(data, _this.options.removeKeyInUrl);
					var urlParameters = '';
					$.each(arr, function(key, value){
						urlParameters = urlParameters + '&' + key + '=' + value;
					});
					if (urlParameters) {
						history.pushState(null, null, '?' + urlParameters.substr(1));
					}
				}
			},
			removeKeyFromObject: function (object, keys) {
				var newObject = {};
				$.each(object, function(key, value){
					newObject[key] = value;
				});
				keys.forEach(function(e){
					delete newObject[e];
				});
				return newObject;
			},
			removeEmptyProperties: function (object) {
				for (var key in object) {
					if (object[key] === '' || object[key] === null || object[key] === undefined || object[key] === 'undefined') {
						delete object[key];
					}
				}
			}
		};

		return initializationForm;

	})();

	return $.fn.extend({
		readUrlForm: function(){
			var option = (arguments[0]);
			return this.each(function() {
				var $form = $(this);
				new readUrlForm($form, option);
			});
		}
	});

})(window.jQuery, window);