export default Vue.component('settingsmenu', {
	props: ['setShowSettings', 'setLoggedInSettings', 'setMenuToggle', 'isLoggedIn'],
	data: function() {
		return {
			isLocalStorage: false,
			lsName: 'appLogin',
			animateShowSettings: false,
			showSettings: false,
			hideSettingsTimer: null,
			requesting: false,
			formFields: {
				username: {
					value: '',
					showError: false
				},
				password: {
					value: '',
					showError: false
				}	
			}
		}
	},
	methods: {
		loginHandler: function(event) {
			event.preventDefault();
			var isValid = true;
			for (var e in this.formFields) {
				if (this.formFields[e].value === '') {
					this.formFields[e].showError = true;
					isValid = false;
				} else {
					this.formFields[e].showError = false;
				}
			}
			if (isValid) {
				this.loginRequest();
			}
		},
		logoutHandler: function(event) {
			event.preventDefault();
		},
		loginRequest: function() {
			var that = this;
					that.requesting = true;
			var request = new XMLHttpRequest();
					request.open('POST', '/login', true);
					request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
					
			request.onload = function() {
				if (request.status >= 200 && request.status < 400) {
					that.requesting = false;
					var data = JSON.parse(request.responseText);
					console.log(data[0]);
					console.log(data[0].success);
					if (data[0].success === 'success') {
						that.setLoggedInSettings(true);
						// Persist session in local storage
						that.persistUserSession();
						// Close settings
						that.closeHandler();
					} else {
						that.formFields.username.showError = true;
						that.formFields.password.showError = true;
					}
        } else {
        	console.log(request.responseText);
        	console.warn('vue-settingsmenu.js, login : error');
        }
			}
			request.send(JSON.stringify({
				username: that.formFields.username.value,
				password: that.formFields.password.value
			}));
		},
		persistUserSession: function() {
			
		},
		closeHandler: function() {
			this.hide();
			var that = this;
			this.hideSettingsTimer = setTimeout(function() {
				that.setShowSettings(false);
				clearTimeout(that.hideSettingsTimer);
			}, 250);
		},
		hide: function() {
			this.animateShowSettings = false;
			this.setMenuToggle(false);
		},
		localStorageCheck: function() {
			var ls = 'ls';
			try {
				window.localStorage.setItem(ls, ls);
				window.localStorage.removeItem(ls);
				return true;
			} catch(e) {
				return false;
			}
		},
		setItemInObj: function(data) {
			var val = JSON.stringify(data);
			if (ls.isLocalStorage) {
				window.localStorage.setItem(this.lsName, val);
			}
		},
		getItemFromObj: function() {
			var data;
			if (ls.isLocalStorage) {
				data = window.localStorage.getItem(this.lsName);
			}
			return JSON.parse(data);
		},
		deleteItem: function() {
			if (ls.isLocalStorage) {
				window.localStorage.removeItem(this.lsName);
			}
		}
	},
	mounted: function() {
		clearTimeout(this.hideSettingsTimer);
		this.showSettings = true;
		this.animateShowSettings = true;
		this.isLocalStorage = this.localStorageCheck();
	}
});