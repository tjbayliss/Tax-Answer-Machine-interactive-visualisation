	/*

	Name: TR-LABS 'Tax Answer Machine'
	File name: d3_code_slopegraph_v2.js
	Developer: J BAYLISS
	From/to: JULY 2017 to JULY 2017
	Technologies: Javascript, D3 v4.0, Bootstrap

	*/
		
	// *****************************************
	//  reusable multiple slopegraph chart
	// *****************************************
	
/*	
	var linkLine = d3.svg.line()
		.x1(function(){
			if (vis.n === 0){ return margin.left-15; }
			else { return ((w/sets)*vis.n); }
		})
		.x2(function(){
			if (vis.n === sets-1) { return w-margin.right; }
			else { return ((w/sets)*(vis.n+1)); }
		})
		.y1(function(d) { return vis.yScale(d[keyValues[vis.n]]); })
		.y2(function(d) { return vis.yScale(d[keyValues[vis.n+1]]); })
		.interpolate("basis");
	*/
	
	
	(function() {
		'use strict';
	
		d3.eesur.slopegraph_v2 = function module() {
	
			// input vars for getter setters
			var w = 200, // width of the set
				h = 575,/* margin = {top: 40, bottom: 40, left: 80, right: 80}, */
				gutter = 50,
				strokeColour = '#FF8000', /* CSS colour for linking lines */
				// key data values (in order)
				keyValues = [],
				// key value (used for ref/titles)
				keyName = '', 
				format = d3.format(''),
				sets/*,
				sparkLineGap = 100*/;
				
			vis.h = h;
			vis.w = w;
	
			var dispatch = d3.dispatch('_hover');
	
			var svg, yScale;
	
			function exports(_selection) {
				_selection.each(function(data) {
	
					var allValues = [];
					var minValue = Infinity;
					var maxValue = -Infinity;
					
					// format/clean data
					data.forEach(function(d) {
						_.times(keyValues.length, function (n) {
							d[keyValues[n]] = +d[keyValues[n]];
							allValues.push(d[keyValues[n]]);
						});
					}); 
					
						
					// create max value so scale is consistent
					maxValue = _.max(allValues);
					minValue = _.min(allValues);
					
					vis.maxValue = maxValue;
					vis.minValue = minValue;
							
					if ( vis.sortType == "ranks" ){ vis.yDomain = [/*10*/vis.selectedPoint,1]; }
					else if ( vis.sortType == "scores" ){ vis.yDomain = [0, 1]; }
					else { }
					
					
					// adapt the size against number of sets
					w = w * keyValues.length;
					vis.w = w;
					// have reference for number of sets
					sets = keyValues.length -1;
					// use same scale for both sides
					vis.yScale = d3.scale.linear()
						.domain(vis.yDomain)
						.range([(h - margin.top - vis.sparkLineGap), (margin.bottom) ]);
						
					// use same scale for both sides
					vis.sparkLine_yScale = d3.scale.linear()
						.domain(vis.yDomain)
						.range([(-10), (-vis.sparkLineGap+10 ) ]);
					
					// clean start  
					d3.select(this).select('svg').remove();
	
					svg = d3.select(this).append('svg')
						.attr({
							id:"slopeSVG",
							width: w,
							height: h 
						});
								
								
					vis.i = 0;
					render(data, 0);
					getSparkLineData(data, 0);
					
				});
			}
			
			
			
	
			// recursive function to apply each set
			// then the start and end labels (as only needed once)
			function render (data, n) {
				
				// translate slopegrah content to give sapce for sparklines .. 
				d3.select("#slopeSVG").attr("transform" , "translate(0," + vis.sparkLineGap + ")");
				
				
								
				vis.i++;
				
				
					
				if ( n < keyValues.length-1 ) {
					
					lines(data, n);
					middleLabels(data, n);
					dots(data, n);
					
					vis.n = n; /* added by JB */
					
					if ( n != keyValues.length-2 ){
						axis(data, n , "middle");	/* added by JB */
						//getSparkLineData(data, n, "middle")
					}
					return render(data, n+1);
				} else {
					
					startLabels(data);
					axis(data, n , "start");	/* added by JB */
					//getSparkLineData(data, n, "start")
					//dots(data, n);
					
					if ( vis.keyValues.length != 1 ){
						endLabels(data);
						axis(data, n , "end");/*	added by JB  */
						//getSparkLineData(data, n, "end")
					}
					return n;
				}
			}
			
			
			
			
	
			// render connecting lines
			function dots(data, n) {
	
				if (n !== sets-1) {
					
					var dots = svg.selectAll('.dots-' + n)
						.data(data);
						
					dots.enter().append('circle')
						.attr({
							class: function (d, i) { return 'dots dots-' + n + ' elm ' + 'sel-' + i + " " + d.id; },
							id: function (d,i) { return "dot-"+ i; },
							cx: ((w / sets) * (n+1)),
							cy: function(d) { return vis.yScale(d[keyValues[n+1]]); },
							r:5
						})
						.on('mouseover', function(d,i){
							
							var content = d;
							
							// show tooltip
							//svg.select("#"+this.id).call(tip);
							//tip.show(content);
							showHide('mouseover' , content);
							
							return;
						})
						.on('mouseout', function(){
							
							//var content = d;
							
							// hide tool tip
							tip.hide();
							showHide('mouseout' , '');
							
							return;
						});
				}
				
				var sel = d3.selectAll(".dots");
				sel.moveToFront();
				
				return;
				
			}// end function dots
			
			
			
			
			
			function showHide(clause, d){
				
				if( clause == 'mouseover' ){
					
					// make all lines, labels and dots transparent
					d3.selectAll(".elm.line").style("opacity" , 0.2);
					d3.selectAll(".labels").style("opacity" , 0.2);
					d3.selectAll(".dots").style("opacity" , 0.2);
					
					// make only lines, labels and dots relevant to user selection opaque
					d3.selectAll(".labels." + d.id).style("opacity" , 1.0);
					d3.selectAll(".line." + d.id).style("opacity" , 1.0);
					d3.selectAll(".dots." + d.id).style("opacity" , 1.0);
										d3.select("#selectedDoc").text(d.title);
					d3.select("#selectedDoc").style("visibility" , "visible");
				}
				else if( clause == 'mouseout' ){
					
					d3.selectAll(".elm.line").style("opacity" , 1.0);
					d3.selectAll(".labels").style("opacity" , 1.0);
					d3.selectAll(".dots").style("opacity" , 1.0);
					
					//d3.select("#selectedDoc").text("Selected document: ");
					d3.select("#selectedDoc").style("visibility" , "hidden");
					
				}
				
				return;
				
			}// end function showHide()
			
			
			
			function getSparkLineData(data, n) {
				
				var fullSparkLineData = [];
				
				vis.keyValues.forEach(function(d,i){
					
					var conceptmarker = SpaceToHyphen(d);
					var scoreData = [];
					var scoreObjectData = {};
					scoreObjectData.attribute = [];
	
					vis.dataFull.forEach(function(d,i){
								
						var obj = d.scores;
						
						for (var property in obj) {
							if (obj.hasOwnProperty(property)){
								if ( isNaN(obj[property]) == false && SpaceToHyphen(conceptmarker) == SpaceToHyphen(property) ){
									scoreData.push(obj[property]);
								}
							}
						}// end for ... 
						
						
					})// end forEach ...
				
					fullSparkLineData.push(scoreData);						
					d3.selectAll(".slopeSVGThumbnails").remove();
				
				})// end outer forEach ... 
	
				buildSparkLine(fullSparkLineData);
				return;
				
			}// end function getSparkLineData()
			
			
			
			
			
			
			
			function buildSparkLine(fullSparkLineData){
				
				var position = '';
				
				vis.keyValues.forEach(function(d,i){
					
					var marker = d;
					
					if( i == 0 ){ position = "start"; }
					else if( i == vis.keyValues.length-1 ){ position = "end"; }
					else { position = "middle"; }
								
					// construct thumbail sparkLine 
					var color = "steelblue";
					
					// store extracted data locally within function
					//var values = scoreData;
					var values = fullSparkLineData[i];
					
					// A formatter for counts.
					var formatCount = d3.format(",.0f");
					
					var sparkLine_margin = {top:10, right: 50, bottom: 10, left: 50},
						width = 150 - sparkLine_margin.left - sparkLine_margin.right,
						height = 150 - sparkLine_margin.top - sparkLine_margin.bottom;
					
					var max = d3.max(values);
					var min = d3.min(values);
					var y = d3.scale.linear().domain([0,1]).range([height,0]);
					
					// Generate a histogram using twenty uniformly-spaced bins.
					var data = d3.layout.histogram().bins(y.ticks(10))(values);
					
					// define minimum and maximum values of data
					var xMax = d3.max(data, function(d){return d.length});
					var xMin = d3.min(data, function(d){return d.length});
					
					var x = d3.scale.linear().domain([0, xMax]).range([width, 0]);
					var yAxis = d3.svg.axis().scale(y).orient("left");
					
					var svg = d3.select("#slopeSVG").append("svg")
						.attr("class", "slopeSVGThumbnails")
						.attr("id", "#slopeSVGThumb-"+i)
						.attr("width", width + sparkLine_margin.left + sparkLine_margin.right)
						.attr("height", height + sparkLine_margin.top + sparkLine_margin.bottom)
						.attr("transform", function(){
							if ( position == "start" ) { return "translate(" + (margin.left-15 -25) + ",-150)"; }
							else if ( position == "middle" ) { return "translate(" + ( ((w/sets)*(/*n*/i/*+1*/)) -25 ) + ",-150)"; }
							else if ( position == "end" ) { return "translate(" + (w - sparkLine_margin.left - sparkLine_margin.right -25 ) + ",-150)"; }
							else { return; }
							
							return;
						})
						.append("g")
							.attr("transform", "translate(" + (25) + "," + sparkLine_margin.top + ")");
						
					var bar = svg.selectAll(".bar")
						.data(data)
					  	.enter()
						.append("g")
						.attr("class", "bar")
						.attr("transform", function(d) { return "translate(" + (0) + "," + y(d.x) + ")"; });
					
					bar.append("rect")
						.attr("width", function(d) { return width-x(d.y); })
						.attr("height", function(d) { return y(0)-(y(data[0].dx))-1; })
						.attr("y", -13)
						.attr("fill", function(d) { return "#005DA2"; });
					
					bar.append("text")
						.attr("dy", ".75em")
						.attr("y", -10)
						.attr("x", (x(data[0].dx) - x(0)) / 2 + 5)
						.attr("text-anchor", "start")
						.style("font-size", "8px")
						.style("font-weight", "normal")
						.style("fill", "#FFFFFF")
						.text(function(d) { return formatCount(d.y); });
					
					svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + 0 + ")")
						.call(yAxis);
					
				})// end forEach
				
				return;
				
			}// end function buildSparkLine()
			
			
			
	
			// render connecting lines
			function axis(data, n , position) {
					
				/* main axis */
				vis.yAxis = d3.svg.axis().scale(vis.yScale).orient("left").ticks(10).tickFormat(function(d) { return d; });
				svg.append("g")
					.attr("class", "y axis " + position + " n" + n )
					.attr("id", function(){ return "yAxis-" + n; })
					.attr("transform", function(){
						if ( position == "start" ) { return "translate(" + (margin.left-15) + ",0)"; }
						else if ( position == "middle" ) { return "translate(" + ( ((w/sets)*(n+1))+15-15 ) + ",0)"; }
						else if ( position == "end" ) { return "translate(" + (w - margin.right+15-15 ) + ",0)"; }
						else{ }
						
						return;
					})
					.call(vis.yAxis);
					
					if ( vis.sortType == "rank" ){
						d3.selectAll(".y.axis.middle").selectAll(".tick").selectAll("text").style("display" , "none");
						d3.selectAll(".y.axis.end").selectAll(".tick").selectAll("text").style("display" , "none");
					}
					else {
						d3.selectAll(".y.axis.start").selectAll(".tick").selectAll("text").style("display" , "inline").text(function(d,i){ return numberWithCommas(d); });
						d3.selectAll(".y.axis.middle").selectAll(".tick").selectAll("text").style("display" , "inline").text(function(d,i){ return numberWithCommas(d); });
						d3.selectAll(".y.axis.end").selectAll(".tick").selectAll("text").style("display" , "inline").text(function(d,i){ return numberWithCommas(d); });
					}
					
							
				// append y axis ticks definition to upper vis.focus graph
				var yticks = d3.selectAll(".y.axis.start").selectAll('.tick');					 
				yticks.append('svg:line')
					.attr( 'class' , "tick" )
					.attr( 'y0' , 0 )
					.attr( 'y1' , 0 )
					.attr( 'x1' , 0 )
					.attr( 'x2' , w-200+15 );
					
					
				var sel = d3.selectAll(".y.axis");
				sel.moveToBack();
					
				return;
				
			}// end function axis()
			
			
			
			
	
			// render connecting lines
			function lines(data, n) {
				
				vis.n = n;
	
				var lines = svg.selectAll('.s-line-' + n).data(data);
						
				lines.enter().append('line');
	//
//				lines.attr({
//					x1: function () {
//						if (n === 0) { return margin.left - 15; }
//						else { return ((w / sets) * n); }
//					},x2: function () {
//						if (n === sets-1) {  return w - margin.right; }
//						else { return ((w / sets) * (n+1)); }
//					},  
//					y1: function(d) { return vis.yScale(d[keyValues[n]]); }, 
//					y2: function(d) { return vis.yScale(d[keyValues[n+1]]); },
//					stroke: strokeColour,
//					'stroke-width': 2,
//					id: function (d,i) { return "line-"+ i; },
//					class: function (d, i) { return 'elm line s-line-' + n + ' sel-' + i + " " + d.id; }
//				})

				lines.attr('x1', function(){
						if (n === 0){ return margin.left-15; }
						else { return ((w/sets)*n); }
					})
					.attr('x2', function(){
						if (n === sets-1) { return w-margin.right; }
						else { return ((w/sets)*(n+1)); }
					})
					.attr('y1', function(d) { return vis.yScale(d[keyValues[n]]); })
					.attr('y2', function(d) { return vis.yScale(d[keyValues[n+1]]); })
					.attr('stroke', strokeColour)
					.attr('stroke-width', 2)
					.attr('id', function (d,i) { return "line-"+ i; })
					.attr('class' , function (d, i) { return 'elm line s-line-' + n + ' sel-' + i + " " + d.id; })
					/*.attr('d' , linkLine)*/
					.on('mouseover', function(d,i){
						
						var content = d;
						
						// show tooltip
						//svg.select("#"+this.id).call(tip);
						//tip.show(content);
						showHide('mouseover' , content);
						
						return;
					})
					.on('mouseout', function(){
						
						//var content = d;
						
						// hide tool tip
						//tip.hide();
						showHide('mouseout' , '');
						
						return;
					});
				
	
				// lines.exit().remove();
			}
	
			// middle labels in-between sets
			function middleLabels(data, n) {
	
				if (n !== sets-1) {
					var middleLabels = svg.selectAll('.m-labels-' + n)
						.data(data);
	
					middleLabels.enter().append('text')
						.attr({
							class: function (d, i) { return 'labels m-labels-' + n + ' elm ' + 'sel-' + i; },
							x: ((w / sets) * (n+1)) + 15,
							y: function(d) { return vis.yScale(d[keyValues[n+1]]) + 4; },
						})
						.text(function (d) { return; })
						.style('text-anchor','end')
						.on('mouseover', dispatch._hover)
						.on('mouseout', function(){
							d3.selectAll(".elm.line").style("opacity" , 1.0);
							d3.selectAll(".labels").style("opacity" , 1.0);
							d3.selectAll(".dots").style("opacity" , 1.0);
							return;
						});
	
					// title
					svg.append('text')
						.attr({
							class: 's-title middle title-'+ n,
							x: ((w / sets) * (n+1)),
							y: margin.top/2
						})
						.text(function(){ return keyValues[n+1].trunc(20,true) + ' ↓'; })
						.style("fill", function(d,i){ return vis.coloursUsed[n]; })
						.style('text-anchor','end');
				}
				
			}// end function middleLabels(data, n)
			
			
			
	
			// start labels applied left of chart sets
			function startLabels(data) {
	
				var startLabels = svg.selectAll('.l-labels').data(data);
	
				startLabels.enter().append('text')
					.attr({
						class: function (d,i) { return 'labels l-labels elm ' + 'sel-' + i + " " + d.id; },
						id: function (d,i) { return "l-label-"+ + i; },
						x: margin.left - 3 - 45,
						y: function(d) { return vis.yScale(d[keyValues[0]]) + 4; }
					})
					.text(function (d) { return d[keyName]; })
					.style('text-anchor','end')
					.on('mouseover', function(d,i){
						
						var content = d;
						
						// show tooltip
						//svg.select("#"+this.id).call(tip);
						//tip.show(content);
						showHide('mouseover' , content);
						
						return;
					})
					.on('mouseout', function(){
						
						//var content = d;
						// hide tool tip
						//tip.hide();
						showHide('mouseout' , '');
						
						return;
					});
	
				// title
				svg.append('text')
					.attr({
						class: 's-title start',
						x: margin.left - 3,
						y: margin.top/2
					})
					.text(keyValues[0].trunc(20,true) + "-only" + ' ↓')
					.style('text-anchor','end');
			}
	
			// end labels applied right of chart sets
			function endLabels(data) {
	
				var i = keyValues.length-1;
	
				var endLabels = svg.selectAll('r.labels')
						.data(data);
	
				endLabels.enter().append('text')
					.attr({
						class: function (d, i) { return 'labels r-labels elm ' + 'sel-' + i + " " + d.id; },
						id: function (d,i) { return "r-label-"+ + i; },
						x: w - margin.right + 15,
						y: function(d) { return vis.yScale(d[keyValues[i]]) + 4; },
					})
					.text(function (d) { return d[keyName]; })
					.style('text-anchor','start')
					.on('mouseover', function(d,i){
						
						var content = d;
						
						// show tooltip
					//	svg.select("#"+this.id).call(tip);
					//	tip.show(content);
						showHide('mouseover' , content);
						
						return;
					})
					.on('mouseout', function(){
						
						//var content = d;
						
						// hide tool tip
///	tip.hide();
						showHide('mouseout' , '');
						
						return;
					});
	
	
				// title
				svg.append('text')
					.attr({
						class: 's-title end title-'+ i,
						x: w - margin.right + 3,
						y: margin.top/2
					})
					.text(keyValues[i].trunc(20,true) + '↓ ')
					.style("fill", function(d,i){ return vis.coloursUsed[vis.coloursUsed.length-1]; })
					.style('text-anchor','end');
					
					
				
			}
	
			// getter/setters for overrides 
			exports.w = function(value) {
				if (!arguments.length) return w;
				w = value;
				return this;
			};
			exports.h = function(value) {
				if (!arguments.length) return h;
				h = value;
				return this;
			};
			exports.margin = function(value) {
				if (!arguments.length) return margin;
				margin = value;
				return this;
			};
			exports.gutter = function(value) {
				if (!arguments.length) return gutter;
				gutter = value;
				return this;
			};
			exports.format = function(value) {
				if (!arguments.length) return format;
				format = value;
				return this;
			};
			exports.strokeColour = function(value) {
				if (!arguments.length) return strokeColour;
				strokeColour = value;
				return this;
			};
			exports.keyValues = function(value) {
				if (!arguments.length) return keyValues;
				keyValues = value;
				return this;
			};
			exports.keyName = function(value) {
				if (!arguments.length) return keyName;
				keyName = value;
				return this;
			};
			
			d3.rebind(exports, dispatch, 'on');
			return exports;
	
		};
	
	}());