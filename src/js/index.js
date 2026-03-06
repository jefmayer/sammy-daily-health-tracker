// TODO: Create loader
// TODO: What is the new item. Add flex-shrink: 1 and then immediately flip back to 0
// TODO: Add transition: all to new item
// TODO: Store login, name in LS
// TODO: Vertically anchor clicks in chart to scroll position in mobile
// TODO: Remove login when logged in
// TODO: Really should add-in custom date-picker
// TODO: Key for explaining the attributes that are being tracked
// TODO: Add name to users collection
// BUG: Chart hovers not updating when new record is added

// https://github.com/charliekassel/vuejs-datepicker?ref=madewithvuejs.com#demo
// https://ssense.github.io/vue-carousel/examples/
// https://ssense.github.io/vue-carousel/guide/
// https://github.com/SSENSE/vue-carousel

import Chart from './vue-chart.js';
import Record from './vue-record.js';
import SettingsMenu from './vue-settingsmenu.js';

var app = new Vue({
	el: '#app',
	components: {
  	'carousel': VueCarousel.Carousel,
    'slide': VueCarousel.Slide,
    'record': Record,
    'chart': Chart,
    'settingsmenu': SettingsMenu
  },
	data: {
		isLoggedIn: false,
		toggleMenuButton: false,
		prevCalPageCt: Number,
		requesting: false,
		carouselTransform: String,
		datapoints: [],
		dataLoaded: false,
		showSettings: false,
		focusDate: String,
		currentPage: 0,
		newRecord: {
			date: Date,
			mobility: '5',
			activity: '5',
			appetite: '5',
			pain: '5',
			stress: '5',
			notes: ''
		}
	},	
	methods: {
		getData: function() {
			var that = this;
					that.requesting = true;
			var request = new XMLHttpRequest();
					request.open('GET', '/getRecords', true);
			
			request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
					that.requesting = false;
					that.datapoints = JSON.parse(request.responseText).sort(that.sortByDate).reverse();
					// init chart
					app.$refs.progressChart.update(JSON.parse(request.responseText).sort(that.sortByDate).reverse());
					// Animate in content
					that.dataLoaded = true;
					// Update pageCt
					that.prevCalPageCt = app.$refs.carousel.currentPerPage;
        } else {
        	console.log(request.responseText);
        	console.warn('index.js, getRecords : error');
        }
			}
			request.send();
		},
		displaySettings: function() {
			if (this.showSettings) {
				var that = this;
				app.$refs.settingsmenu.hide();
				setTimeout(function() {
					that.setShowSettings(false);
				}, 250);
			} else {
				this.setMenuToggle(true);
				this.setShowSettings(true);
			}
		},
		update: function() {
			this.getData();
		},
		pause: function() {
			var carousel = app.$refs.carousel;
			// Set temp transform
			this.carouselTransform = carousel.$refs["VueCarousel-inner"].style.transform;
			carousel.$refs["VueCarousel-inner"].classList.add('u-disableAllTransforms');
			// Need to swap translateX to left
			// Lazy regex, shouldn't eval to null
			// eslint-disable-next-line no-useless-escape
			carousel.$refs["VueCarousel-inner"].style.left = /\((.*?)\,/.exec(this.carouselTransform)[1]; 
		},
		restart: function() {
			var carousel = app.$refs.carousel;
			carousel.$refs["VueCarousel-inner"].classList.remove('u-disableAllTransforms');
			// Reset to correct transform translation, and then kill transistion until next renders
			carousel.$refs["VueCarousel-inner"].style.transition = 'transform 0s ease 0s'
			carousel.$refs["VueCarousel-inner"].style.transform = this.carouselTransform;
			// Reset left
			carousel.$refs["VueCarousel-inner"].style.left = 'auto';
		},
		slideCarouselToDate: function(date) {
			for (var i = 0; i < this.datapoints.length; i++) {
				if (date === this.datapoints[i].date) {
					var page =  Math.floor(i / app.$refs.carousel.currentPerPage);
					app.$refs.carousel.goToPage(page);
				}
			}
			var delay = 0;
			if (this.currentPage !== page) {
				delay = 600;
			}
			// Set focus to calendar card
			this.setCarouselFocusDate(date, delay);
			// Update currentPage
			this.currentPage = page;
		},
		setCarouselFocusDate: function(date, delay) {
			var that = this;
			// Delay fallback
			if (!delay) {
				delay = 0;
			}
			// Set focus
			setTimeout(function() {
				that.focusDate = date;
			}, delay);
		},
		sortByDate: function(a, b) {
			if (a.date < b.date)
				return -1;
			if (a.date > b.date)
				return 1;
			return 0;
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
		},
		setShowSettings: function(val) {
			this.showSettings = val;
		},
		setLoggedInSettings: function(val) {
			this.isLoggedIn = val;
		},
		setMenuToggle: function(val) {
			this.toggleMenuButton = val;
		}
	},
	mounted: function() {
		var that = this;
		this.newRecord.date = this.getTodaysFormattedDate();
		this.getData();
		window.addEventListener('resize', function() {
			console.log(app.$refs.carousel.currentPerPage);
			if (that.prevCalPageCt === 0 && app.$refs.carousel.currentPerPage > 0) {
				app.$refs.carousel.goToPage(0)
			}
			that.prevCalPageCt = app.$refs.carousel.currentPerPage;
		});
	}
});