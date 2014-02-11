/*global $:false, jQuery:false*/
/*
Dynamic URL params from/in form v.0.0.1
by Aleksandr Nikitin (a.nikitin@i.ua)
 https://github.com/alexshnur/dynamic-url-params-from-in-form
*/
(function($, window){
	var readUrlForm, _this, getParam = {};
	var selectors;
	var classNames = {};

	var buildSelectors = function(selectors, source, characterToPrependWith) {
		$.each(source, function(propertyName, value){
			selectors[propertyName] = characterToPrependWith + value;
		});
	};

	var buildClassSelectors = function(classNames) {
		var selectors = {};
		if(classNames) {
			buildSelectors(selectors, classNames, ".");
		}
		return selectors;
	};

	function supportsHistoryApi() {
		return !!(window.history && history.pushState);
	}

	readUrlForm = (function(){
		var $form, $formGroup, $button;
		function initializationForm (form, options){
			_this = this;
			_this.options = $.extend({}, _this.options, options);

			classNames = {
				displayNone: _this.options.displayNone,
				textWarning: _this.options.textWarning,
				formGroup: _this.options.formGroup,
				hasWarning: _this.options.hasWarning,
				buttonSubmit: _this.options.buttonSubmit
			};

			selectors = buildClassSelectors(classNames);

			$form = form;
			$formGroup = $(selectors.formGroup);
			$button = $(selectors.buttonSubmit);
			_this.openPage();
			$button.on('click', function(){
				_this.readFormControl();
				_this.hasWarningFunc();
			});
			$form.find('[data-verify="true"]').on('change', _this.hasWarningFunc);
			$form.find('[data-verify="true"]').on('input propertychange', _this.hasWarningFunc);
		}

		initializationForm.prototype = {
			options: {
				removeKeyInUrl: ['offset', 'limit', 't', 'heightScrollPosition', 'idAfterRows'],
				formGroup: 'form-group',
				hasWarning: 'has-warning',
				textWarning: 'text-warning',
				displayNone: 'display-none',
				isHasWarning: true,
				buttonSubmit: 'btn'
			},
			hasWarningFunc: function(elem){
				if (_this.options.isHasWarning) {
					var urlQueryString = location.search;
					if (urlQueryString !== '') {
						_this.readUrlParam();
						$form.find('[data-verify="true"]').each(function(){
							var key = $(this).data('name'),
								condition, valTemp,
								tempParam = getParam[key] === undefined ? '' : decodeURIComponent(getParam[key]);
							if (this.type === 'select-multiple') {
								valTemp = encodeURIComponent($(this).val()) === 'null' ? '' : encodeURIComponent($(this).val());
								condition = (encodeURIComponent(tempParam) !== valTemp);
							} else if (this.type === 'checkbox' && this.value === '') {
								valTemp = this.checked === true ? 'true' : '';
								condition = (tempParam !== valTemp);
							} else {
								condition = (tempParam !== $(this).val());
							}
							condition ? $(this).closest(selectors.formGroup).addClass(classNames.hasWarning) : $(this).closest(selectors.formGroup).removeClass(classNames.hasWarning);
						});
						if ($form.find(selectors.hasWarning).length > 0) {
							$(selectors.textWarning).removeClass(classNames.displayNone);
						} else {
							$(selectors.textWarning).addClass(classNames.displayNone);
						}
					} else {
						$form.find('[data-verify="true"]').each(function(){
							$(this).closest(selectors.formGroup).removeClass(classNames.hasWarning);
						});
					}
				}
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
						var elem = $form.find('[data-name="' + key + '"]');
						if (elem[0].type === 'select-multiple') {
							var getMultiple = value.split(',');
							for (var i = 0; i < elem[0].options.length; i++){
								$.each(getMultiple, function(key, value){
									if (elem[0].options[i].value === decodeURIComponent(getMultiple[key])) {
										elem[0].options[i].selected = true;
									}
								});
							}
						} else if (elem[0].type === 'checkbox' && value === 'true') {
							elem[0].checked = value;
						} else {
							elem.val(decodeURIComponent(value));
						}
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
				$form.find('[data-name]').each(function(){
					var key = $(this).data('name');
					if (($(this).val() !== 'manual_input') || $(this).val() || (this.checked && !this.value)) {
						data[key] = (this.checked && !this.value) ? this.checked : $(this).val();
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
					history.pushState(null, null, urlParameters === '' ? location.pathname : '?' + urlParameters.substr(1));
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