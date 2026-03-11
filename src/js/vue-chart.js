export default Vue.component('chart', {
	props: ['dataLoaded', 'slideCarouselToDate'],
	data: function() {
		return {
			chartData: [],
			chartAdded: false
		}
	},
	methods: {
		update: function(data) {
			this.chartData = [];
			this.formatChartData(data);
			
			var that = this;
			var margin = {
				top: 20,
				right: 25,
				bottom: 0,
				left: 25
			};
			var parseTime = d3.time.format('%b-%d-%Y');
			
			var getWidth = function() {
				var inset = margin.left + margin.right;
				var minScrWid = 1024 - inset;
				width = parseInt(d3.select('#progressChart').style('width'));
				return Math.max(width - inset, minScrWid);
			};
						
			var width = getWidth();
			var height = parseInt(d3.select('#progressChart').style('height')) - 50;
									
			// Define scales
			var xScale = d3.time.scale()
				.range([0, width])
				.domain(d3.extent(this.chartData[0].datapoints, function(d) { return d.date; }));
			var yScale = d3.scale.linear()
				.range([height, 0])
				.domain([0, 10]);
			// Define axes
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient('bottom')
				.innerTickSize(-height - margin.top)
				.outerTickSize(0)
				.tickPadding(10)
				.tickFormat(d3.time.format('%b %d'));
			var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient('left');
			// Define line properties
			var line = d3.svg.line()
				.interpolate('cardinal')
				.x(function(d) { return xScale(d['date']); })
				.y(function(d) { return yScale(d['attribute']); });		
			
			var svg = d3.select('#progressChart')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height)
				.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
			
			var updateXAxis = function() {
				var width = getWidth();									
				// Update the range of the scale with new width/height
				xScale.range([0, width]);
				// Update the axis and text with the new scale
				svg.select('.o-axis--x')
					.attr('transform', 'translate(0,' + height + ')')
					.call(xAxis);
				// Force D3 to recalculate and update the line
				svg.selectAll('.o-line')
					.attr('d', function(d) { return line(d.datapoints); });
				// Update the tick marks
				xAxis.ticks(that.getDatesAtInterval);
			};

			// If chart has already been added then we only want to update x-axis?
			if (this.chartAdded) {
				updateXAxis();
			} else {
				// Add x-axis
				svg.append('g')
					.attr('class', 'o-axis--x')
					.attr('transform', 'translate(0,' + height  + ')')
					.call(xAxis);
				// Add y-axis
				svg.append('g')
          .attr('class', 'o-axis--y')
          .call(yAxis);
				// Remove first tick from y-axis
				svg.selectAll('.tick')
					.each(function(d) {
						if ( d === 0 ) {
							this.remove();
						}
					});
				// Add line attributes
				svg.selectAll('.o-line')
					.data(this.chartData)
					.enter()
					.append('path')
					.attr('class', function(d) { return 'o-line o-line--' + d.attribute; })
					.attr('d', function(d) { return line(d.datapoints); });
					
				// Add events
				var focus = svg.append('g')
					.attr('class', 'o-focusGroup')
					.style('display', 'none');
				
				for (var i = 0; i < this.chartData.length; i++) {
					focus.append('g')
						.attr('class', 'o-focus o-focus--' + this.chartData[i].attribute)
						.append('circle')
						.attr('r', 7);
					svg.select('.o-focus--' + this.chartData[i].attribute)
						.append('text')
						.attr('width', 14)
						.attr('dy', '.35em');
				}
				
				svg.append('rect')
					.attr('class', 'o-overlay')
					.attr('width', '100%')
					.attr('height', height + margin.top)
					.attr('transform', 'translate(0,' + -margin.top  + ')')
					.on('mouseover', function() { focus.style('display', 'block'); })
					.on('mouseout', function() { focus.style('display', 'none'); })
					.on('mousemove',  function() {
						var arr = that.chartData[0].datapoints,
								pos = 0,
								attributeList = [],
								date = parseTime(xScale.invert(d3.mouse(this)[0]));
						// Match date up with position of dataset
						for (var i = 0; i < arr.length; i++) {
							if (parseTime(arr[i].date) === date) {
								pos = i;
							}
						}
						// Pull dataset for each attribute out of chartData and assign to transform, focus
						var item, itemX, itemY;
						for (i = 0; i < that.chartData.length; i++) {
							item = that.chartData[i].datapoints[pos];
							itemX = xScale(item.date);
							itemY = yScale(item.attribute);
							var selectedFocus = svg.selectAll('.o-focus--' + that.chartData[i].attribute);
							// Check to see if circle will overlap and offset if so
							for (var j = 0; j < attributeList.length; j++) {
								if (item.attribute === attributeList[j]) {
									itemX = itemX + 14;
								}
							}
							selectedFocus.attr('transform', 'translate(' + itemX + ',' + itemY + ')');
							selectedFocus.select('text').text(item.attribute);
							// Add y-position to positions array
							attributeList.push(item.attribute);
						}
					})
					.on('click', function() {
						var formatDate = d3.time.format('%Y-%m-%d')
						that.slideCarouselToDate(formatDate(xScale.invert(d3.mouse(this)[0])));
					});
				d3.select(window).on('resize', updateXAxis);
				updateXAxis();
				// Why is this timeout here...
				setTimeout(function() {
					updateXAxis();
				}, 100);
				// Set chart added flag
				this.chartAdded = true;
			}
		},
		getDatesAtInterval: function(start, end, maxDates = 20) {
			const dates = [];
			const startTime = new Date(start).getTime();
			const endTime = new Date(end).getTime();
			const diffTime = endTime - startTime;
			const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

			if (totalDays <= maxDates) {
				for (let i = 0; i <= totalDays; i++) {
					let d = new Date(startTime);
					d.setDate(d.getDate() + i);
					dates.push(d);
				}
				return dates;
			}

			const step = totalDays / (maxDates - 1);
			for (let i = 0; i < maxDates; i++) {
				let d = new Date(startTime);
				d.setDate(d.getDate() + Math.round(i * step));
				dates.push(d);
			}
			return dates;
		},
		formatChartData: function(data) {
			var i, e;
			for (i = 0; i < data.length; i++) {
				// Need to add 1 to date to get correct date from db record
				data[i].date = new Date(data[i].date);
				data[i].date = new Date(data[i].date.setDate(data[i].date.getDate() + 1));
				// Set up object
				if (i === 0) {
					for (e in data[i]) {
						if (e !== 'date' && e !== 'notes' && e !== '_id') {
							this.chartData.push({
								attribute: e,
								datapoints: []
							});	
						}	
					}
				}
				for (e in data[i]) {
					if (e !== 'date' && e !== 'notes' && e !== '_id') {
						this.getAttributeArrByName(e).push({date: data[i].date, attribute: data[i][e]});
					}
				}
			}
		},
		getAttributeData: function(attribute, data) {
			var arr = [];
			for (var i = 0; i < data.length; i++) {
				arr.push({date: data[i].date, value: parseInt(data[i][attribute])});
			}
			return arr;
		},
		getAttributeArrByName: function(name) {
			for (var i = 0; i < this.chartData.length; i++) {
				if (this.chartData[i].attribute === name) {
					return this.chartData[i].datapoints;
				}
			}
			return null;
		}
	},
	mounted: function() {}
});