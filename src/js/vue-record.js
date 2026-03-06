export default Vue.component('record', {
	props: ['item', 'update', 'pause', 'restart', 'addNew', 'index', 'isLoggedIn'],
	data: function() {
		return {
			canEdit: false,
			requesting: false,
			defaults: {
				date: Date,
				mobility: '5',
				activity: '5',
				appetite: '5',
				pain: '5',
				stress: '5',
				notes: ''
			}
		}
	},
	methods: {
		onInputInteractStart: function() {
			this.pause();
		},
		onInputInteractEnd: function() {
			this.restart();
		},
    editHandler: function(event) {
	    event.preventDefault();
	    this.canEdit = !this.canEdit;
	    if (this.canEdit && this.addNew) {
		    this.reset();
	    }
    },
    updateHandler: function(event) {
			event.preventDefault();
			var that = this;
					that.requesting = true;
			var request = new XMLHttpRequest();
					request.open('POST', '/addRecord', true);
					request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
			
			request.onload = function() {
				if (request.status >= 200 && request.status < 400) {
					that.requesting = false;
					// console.log(JSON.parse(request.responseText));
					that.canEdit = !that.canEdit;
					if (that.addNew) {
						that.reset();
					}
					setTimeout(function() {
						that.update();
					}, 250);
        } else {
        	console.log(request.responseText);
        	console.warn('vue-record.js, addRecord : error');
        }
			}
			request.send(JSON.stringify({
				date: this.item.date,
				mobility: this.item.mobility,
				activity: this.item.activity,
				appetite: this.item.appetite,
				pain: this.item.pain,
				stress: this.item.stress,
				notes: this.item.notes
			}));
		},
    getDisplayMonth: function(date) {
			var a = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
			return a[parseInt(date.split('-')[1]) - 1];
		},
		getDisplayDate: function(date) {
			return parseInt(date.split('-')[2]);
		},
		getDisplayYear: function(date) {
			return date.split('-')[0];
		},
		reset: function() {
			this.item.date = this.defaults.date;
			this.item.mobility = this.defaults.mobility;
			this.item.activity = this.defaults.activity;
			this.item.appetite = this.defaults.appetite;
			this.item.pain = this.defaults.pain;
			this.item.stress = this.defaults.stress;
			this.item.notes = this.defaults.notes;
		},
		addLeadingZero: function(n) {
			if (n.toString().length === 1) {
				return '0' + n.toString();
			}
			return n;
		},
		getTodaysFormattedDate: function() {
			var d = new Date();
			return d.getUTCFullYear() + '-' +
			this.addLeadingZero(d.getMonth() + 1) + '-' +
			this.addLeadingZero(d.getDate())
		}
	},
	mounted: function() {
		this.defaults.date = this.getTodaysFormattedDate();
	}
});