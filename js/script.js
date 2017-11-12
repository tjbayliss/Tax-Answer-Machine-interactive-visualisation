	/*

	Name: TR-LABS 'Tax Answer Machine'
	File name: script.js
	Developer: J BAYLISS
	From/to: JULY 2017 to JULY 2017
	Technologies: Javascript, D3 v4.0, Bootstrap

	*/
	
	
	// initial structure of tooltip
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.attr('id', 'd3-tip')
		.offset([-10, 0])
		.style("z-index" , 10000)
		.html(function(d) {
			
			// bring tool tip to front ...
			var sel = d3.select("#d3-tip");
			sel.moveToFront();
			
			return "<span style='font-size:12px; color:white'>Document Title: " + d.title + "</span>";
			
		})
	
	var filenames = [ "Q1.json" , "Q2.json" , "Q3.json" , "Q4.json" , "Q5.json" ];
	var points = [ "10", "25", "50", "100", "Maximum" , "All" ];
	var scaleType = [ "Linear", "Log" ];
	var scaleMetric = [ "scores", "ranks" ];
	var questions = [
						"how long is the statute of limitations extended for after if elect to postpone the determination whether my horse breeding farm is an activity engaged in for profit",
						"i think i only have a small chance of making a profit but think the chance is reasonable is this an activity engaged in for profit",
						"if a taxpayer is in a preparatory stage of developing an activity can the taxpayer be considered to have a profit motive or is it still a hobby",
						"can i deduct crop losses due to drought",
						"if i can only spend 2 hours a day on my tutoring activity due to a disability can it still be for profit"
					];
	
	var vis = {};
	vis.sparkLineGap = 0;
	vis.checkedButton = [];
	vis.coloursUsed = [];
	vis.dataFull = [];
	vis.dataArray = [];
	
	vis.selectedFileIndex = 0;
	vis.selectedFile = filenames[vis.selectedFileIndex];	
	
	vis.selectedPointIndex = 0;
	vis.selectedPoint = points[vis.selectedPointIndex];	
	
	vis.selectedScaleIndex = 0;
	vis.selectedScale = scaleType[vis.selectedScaleIndex];
	
	vis.selectedScaleMetricIndex = 1;
	vis.selectedMetricScale = scaleMetric[vis.selectedScaleMetricIndex];
	
	vis.filePath = "data/" + vis.selectedFile;
				
	vis.browser_width = window.innerWidth;
	vis.browser_height = window.innerHeight;
	vis.sortType = "ranks";
	vis.scoreRange = "absolute";
	vis.listWidth = "100%";
	vis.duration = 2000;
	vis.rebuildUI = true;
	vis.goldStandardHighlight = false;
	
	/* http://colorbrewer2.org/#type=diverging&scheme=RdYlGn&n=11 */
	vis.colours = {
					0:[],
					1:[],
					2:[],
					3:['#fc8d59','#ffffbf','#91cf60'],
					4:['#d7191c','#fdae61','#a6d96a','#1a9641'],
					5:['#d7191c','#fdae61','#ffffbf','#a6d96a','#1a9641'],
					6:['#d73027','#fc8d59','#fee08b','#d9ef8b','#91cf60','#1a9850'],
					7:['#d73027','#fc8d59','#fee08b','#ffffbf','#d9ef8b','#91cf60','#1a9850'],
					8:['#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850'],
					9:['#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850'],
					10:['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'],
					11:['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837']
	};
	
	
    var margin = {top: 40, bottom: 40, left: 80, right: 80};
	
	
	
	buildUI();
	loadData();
	
	
	function loadData(){
		
		vis.keyValues = [];
	
		d3.json(vis.filePath, function(error, json) {
			if (error) throw error;
			
			vis.rawdata = json;
			vis.nodes = vis.rawdata.tags;
			vis.keyValues.push("question");
			
			extractData(vis.rawdata);
		});
		
		return;
		
	}// end function loadData()

	

	function extractData(graphData){
		
		var graphCandidateData = graphData.answerCandidates;
		vis.question = graphData.question.questionText;
		vis.goldStandard = graphData.question.goldStandard;
	
		graphCandidateData.forEach(function(d,i){
			
			vis.dataFull[i] = { 
								"scores" : d.tagScores,
								"ranks" : d.tagRanks
							};
			
			vis.dataFull[i].ranks.question = d.rank;
			vis.dataFull[i].scores.question = d.score;
			
			vis.dataFull[i].ranks.id = d.id;
			vis.dataFull[i].scores.id = d.id;
			
			vis.dataFull[i].ranks.questionText = vis.question;
			vis.dataFull[i].scores.questionText = vis.question;
			
			vis.dataFull[i].ranks.title = d.source.title;
			vis.dataFull[i].scores.title = d.source.title;
					
		})// end forEach ....
		
		getCorrectData();
		makeSlopeGraph();
		
		return;
		
	}// end function extractData(){




	function getCorrectData(){
		
		vis.data = [];
		vis.scoreData = [];
		
		vis.dataFull.forEach(function(d,i){ vis.data[i] = d[vis.sortType]; })
		
		return;
		
	}// end function getCorrectData  







	function buildUI(){
		
		
		// append TAM logo to left of banner
		d3.select('#logoHolder')
			.append("img")
			.attr("src", "images/tam_logo.png")
			.attr("id", "tam_logo");
			
		
		// append logout logo to right of banner
		d3.select('#logoHolder')
			.append("img")
			.attr("src", "images/logout.png")
			.attr("id", "logout");
			
	
		d3.select("#selectionList").append("label")
			.style("position" , "absolute")
			.style("left" , "0px")
			.style("top" , "60px")
			.style("font-size" , "10px")
			.text("Display order");
			
	
		d3.select("#selectionList").append("label")
			.style("position" , "absolute")
			.style("left" , "10.5%")
			.style("top" , "60px")
			.style("font-size" , "10px")
			.text("Number of docs to display");
			
	
		d3.select("#selectionList").append("label")
			.style("position" , "absolute")
			.style("left" , "21%")
			.style("top" , "60px")
			.style("font-size" , "10px")
			.text("Axis type");
		
		
		/* construct Tax Question selection list */
		var valueArray = [];
		for ( var i=0 ; i < questions.length; i++ ) { valueArray[i] = i; }


		/* construct selection list */	
		var questionArray = d3.zip( questions , valueArray );
		vis.questionArray = questionArray;
		
		
		// Build option menu for data Groups
		var fileListing = d3.select("#selectionList")
			.append("select")
			.attr("id","fileList")
			.attr("style","width:"+vis.listWidth)
			.attr("class","chosen-select");

		fileListing.selectAll("p")
			.data(vis.questionArray)
			.enter()
			.append("option")
			.attr("value", function(d){ return d[1]}) 
			.text(function(d){ return d[0]+"?"; });	
		
		$('#fileList').chosen({width: vis.listWidth, allow_single_deselect: true, placeholder_text_single:"Select question"}).on('change',function(evt,params)
		{
		
			if(typeof params != 'undefined')
			{	
				vis.rebuildUI = true;					  
				// update selectedIndex and name variables of newly selected option on selection list
				vis.selectedFileIndex = params.selected;
				vis.selectedFile = filenames[this.options[this.selectedIndex].value];	
				
				// update filepath. Call function to update data
				vis.filePath = "data/" + vis.selectedFile;
				loadData();
				
										
			} // end if ....
			
			else {
			} // end else ....
			
		});	
		
		
		// initialise listing to specfici vavlue and update underling HTML selection list and chosen list accordingly.
		/*$('#fileList').val(vis.selectedFileIndex);*/	
		$('#fileList').val(vis.selectedFileIndex).trigger("chosen:updated");
		
		
		
		
		/* construct selection list for user to define number of top N to display */
		/* (defaults to 10; other options are 25, 50, 100, MAXIMUM or ALL */
		var valueArray = [];
		for ( var i=0 ; i < points.length; i++ ) { valueArray[i] = i; }


		/* construct selection list */	
		var pointsArray = d3.zip( points , valueArray );
		vis.pointsArray = pointsArray;
		
		
		// Build option menu for data Groups
		var pointsListing = d3.select("#selectionList")
			.append("select")
			.attr("id","pointsList")
			.attr("style","width:10%")
			.style("left","25%")
			.attr("class","chosen-select");


		pointsListing.selectAll("p")
			.data(vis.pointsArray)
			.enter()
			.append("option")
			.attr("value", function(d){ return d[1]}) 
			.text(function(d){ return d[0]; });	
		
		$('#pointsList').chosen({width:"10%", disabled:true, allow_single_deselect: true, placeholder_text_single:"Select extent"}).on('change',function(evt,params)
		{
		
			if(typeof params != 'undefined')
			{				  
				// update selectedIndex and name variables of newly selected option on selection list
				vis.selectedPointIndex = params.selected;
				vis.selectedPoint = points[vis.selectedPointIndex];
				
				if( vis.selectedPoint == "All" ) { vis.selectedPoint = 10000; }
				else if( vis.selectedPoint == "Maximum" ) { vis.selectedPoint = vis.maxValue; }
				
				//getDataLimits();
				transitionData();
										
			} // end if ....
			
			else {
			} // end else ....
			
		});	
		
		/*$('#pointsList').val(vis.selectedPointIndex);*/	
		$('#pointsList').val(vis.selectedPointIndex).trigger("chosen:updated");
		
		
		
		
		
		
		
		/* construct selection list for user to whteth scale is LOG or LINEAR */
		var valueArray = [];
		for ( var i=0 ; i < scaleType.length; i++ ) { valueArray[i] = i; }


		/* construct selection list */	
		var scaleArray = d3.zip( scaleType , valueArray );
		vis.scaleArray = scaleArray;
		
		
		// Build option menu for data Groups
		var scaleArray = d3.select("#selectionList")
			.append("select")
			.attr("id","scalesList")
			.attr("style","width:10%")
			.attr("class","chosen-select");


		scaleArray.selectAll("p")
			.data(vis.scaleArray)
			.enter()
			.append("option")
			.attr("value", function(d){ return d[1]}) 
			.text(function(d){ return d[0]; });	
		
		$('#scalesList').chosen({width:"10%", allow_single_deselect: true, placeholder_text_single:"Select scale type"}).on('change',function(evt,params)
		{
		
			if(typeof params != 'undefined')
			{				  
				// update selectedIndex and name variables of newly selected option on selection list
				vis.selectedScaleIndex = params.selected;
				vis.selectedScale = scaleType[vis.selectedScaleIndex];
				
				
				//getDataLimits();
				transitionData();
										
			} // end if ....
			
			else {
			} // end else ....
			
		});	
		
		/*$('#scalesList').val(vis.selectedScaleIndex);	*/
		$('#scalesList').val(vis.selectedScaleIndex).prop('disabled', false).trigger("chosen:updated");
		
		
		
		
		
		
		/* construct selection list for user to whteth scale is RANK or SCORES */
		var valueArray = [];
		for ( var i=0 ; i <  scaleMetric.length; i++ ) { valueArray[i] = i; }


		/* construct selection list */	
		var scaleMetricArray = d3.zip( scaleMetric , valueArray );
		vis.scaleMetricArray = scaleMetricArray;
		
		
		// Build option menu for data Groups
		var scaleMetricArray = d3.select("#selectionList")
			.append("select")
			.attr("id","scaleMetricList")
			.attr("style","width:10%")
			.attr("class","chosen-select");


		scaleMetricArray.selectAll("p")
			.data(vis.scaleMetricArray)
			.enter()
			.append("option")
			.attr("value", function(d){ return d[1]}) 
			.text(function(d){ return d[0]; });	
		
		$('#scaleMetricList').chosen({width:"10%", allow_single_deselect: true, placeholder_text_single:"Select scale metric type"}).on('change',function(evt,params)
		{
		
			if(typeof params != 'undefined')
			{				  
				// update selectedMetricIndex and name variables of newly selected option on selection list
				vis.selectedScaleMetricIndex = params.selected;
				vis.selectedMetricScale = points[vis.selectedScaleMetricIndex];
				
				//modify variable and class of button
				if ( vis.selectedScaleMetricIndex == 0 ) {
					vis.sortType = "scores";
					/*$('#scalesList').val(0);	*/
					$('#pointsList').prop('disabled', true).trigger("chosen:updated");
					$('#scalesList').val(0).prop('disabled', true).trigger("chosen:updated");
				}// end if ...
				else if ( vis.selectedScaleMetricIndex == 1 ) {
					vis.sortType = "ranks";
					$('#pointsList').prop('disabled', false).trigger("chosen:updated");
					/*$('#scalesList').val(0);	*/
					$('#scalesList').val(0).prop('disabled', false).trigger("chosen:updated");
					
				}// end else ...
				else {}
				
				// funcion call to get new data
				vis.rebuildUI = false;
				
				getCorrectData();
				//getDataLimits();
				transitionData();
										
			} // end if ....
			
			else {
			} // end else ....
			
		});	
		
	/*	$('#scaleMetricList').val(vis.selectedScaleMetricIndex);	*/
		$('#scaleMetricList').val(vis.selectedScaleMetricIndex).trigger("chosen:updated");
		
		// append checkbox 			
		d3.select("#selectionList")
			.append("input")
			.attr("type" , "checkbox")
			.attr("id" , "goldStandard")
			.attr("class" , "check")
			.attr("disabled" , true)
			.attr("onClick", "getState()")
			.style("position" , "absolute")
			.style("right" , 0 + "px")
			.style("top" , (margin.top*1.35) + "px");
		
		// append checkbox label 			
		d3.select("#selectionList")
			.append("label")
			.attr("id" , "goldStandardlabel")
			.style("position" , "absolute")
			.style("right" , 20 + "px")
			.style("top" , (margin.top*1.4) + "px")
			.text("Show 'Gold Standard' document");
			
			
		
		// append checkbox 			
		d3.select("#selectionList")
			.append("input")
			.attr("type" , "checkbox")
			.attr("id" , "modifyConceptMarkers")
			.attr("class" , "check")
			.attr("disabled" , true)
			.attr("onClick", "")
			.style("position" , "absolute")
			.style("right" , 0 + "px")
			.style("top" , (margin.top*1.75) + "px");
		
		// append checkbox label 			
		d3.select("#selectionList")
			.append("label")
			.attr("id" , "goldStandardlabel")
			.style("position" , "absolute")
			.style("right" , 20 + "px")
			.style("top" , (margin.top*1.8) + "px")
			.text("Allow modifying concept marker listing");

		return;
		
	}// end function buildUI()
	
	
	
	
	function getState(){
		
		if ( vis.goldStandardHighlight == false ) {
			document.getElementById("goldStandard").checked = true;
			vis.goldStandardHighlight = true;
			
			$(".dots").removeClass("goldStandard");
			$(".dots."+vis.goldStandard).addClass("goldStandard");
			
			$(".line").removeClass("goldStandard");
			$(".line."+vis.goldStandard).addClass("goldStandard");
	
			$(".labels.l-labels.elm").removeClass("goldStandard");
			$(".labels.l-labels.elm."+vis.goldStandard).addClass("goldStandard");
	
			$(".labels.r-labels.elm").removeClass("goldStandard");
			$(".labels.r-labels.elm."+vis.goldStandard).addClass("goldStandard");
		
		}// end if .. 
		else if ( vis.goldStandardHighlight == true ) {
			document.getElementById("goldStandard").checked = false;
			vis.goldStandardHighlight = false;
			
			$(".dots."+vis.goldStandard).removeClass("goldStandard");
			$(".line."+vis.goldStandard).removeClass("goldStandard");
			$(".labels.l-labels.elm."+vis.goldStandard).removeClass("goldStandard");
			$(".labels.r-labels.elm."+vis.goldStandard).removeClass("goldStandard");
		
		}// end else ... 
	
		return;
		
	}// end function getState()
	
	
	
	
	function getDataLimits(){
		
		var presentedData = [];
		vis.checkedButton.forEach(function(d,i){
			
			if ( d == true ){ presentedData.push(vis.data[i]); }
		})
		
		var max = d3.max(d3.entries(presentedData), function(d) {
			return d3.max(d3.entries(d.value), function(e) {
				vis.dataArray.push(e.value);
			});
		});
		
		vis.dataMax = d3.max(vis.dataArray);
		vis.dataMin = d3.min(vis.dataArray);
		
		return;
		
	}// end function getDataLimits()
	
	
	
	
	
	function transitionData(){
		
		
		// Update domain definition based on new settings selected by users
		if ( vis.sortType == "ranks" ){ vis.yDomain = [vis.selectedPoint,1]; }
		else if ( vis.sortType == "scores" ){ vis.yDomain = [0 , 1]; }
		else { }
			
		
		if ( vis.selectedScale == "Linear" ) {	
			// Update axis definitions based on new settings selected by users
			vis.yScale = d3.scale.linear().domain(vis.yDomain).range([(vis.h - margin.top - vis.sparkLineGap), (margin.bottom)]);
			vis.numticks = 10;
		}
		else if ( vis.selectedScale == "Log" ) {
			vis.yScale = d3.scale.log().domain([vis.selectedPoint, 1]).range([(vis.h - margin.top - vis.sparkLineGap), (margin.bottom)]);
			vis.numticks = 100;
		}
		else { }
		
		
		vis.yAxis = d3.svg.axis().scale(vis.yScale).orient("left").ticks(vis.numticks).tickFormat(function(d,i){ return numberWithCommas(d); });
		d3.selectAll(".y.axis").transition().duration(vis.duration).call(vis.yAxis);
		
		
		// transition all necessary content ....intermediate dots
		for(i=0; i<=vis.n; i++){
				
						
			// transition intermediate dots
			d3.selectAll(".dots.dots-" + i + ".elm")
				.data(vis.data)
				.transition()
				.ease("linear")
				/*.delay(function(d, i){ return i * 250; })*/
				.duration(vis.duration)
				.attr("cy", function(d) { return vis.yScale(d[vis.keyValues[i+1]]); });
				
						
			// transition lines
			d3.selectAll(".line.s-line-" + i + ".elm")
				.data(vis.data)
				.transition()
				.ease("linear")
			/*.delay(function(d, i){ return i * 250; })*/
				.duration(vis.duration)
				.attr("y1" , function(d) { return vis.yScale(d[vis.keyValues[i]]); } )
                .attr("y2" , function(d) { return vis.yScale(d[vis.keyValues[i+1]]); });
				
						
			// transition left labels
			d3.selectAll(".labels.l-labels")
				.data(vis.data)
				.transition()
				.ease("linear")
			/*.delay(function(d, i){ return i * 250; })*/
				.duration(vis.duration)
				.attr("y" , function(d) { return vis.yScale(d[vis.keyValues[0]]) + 4; } )
                
						
			// transition middle labels
			/* not necessry */
				
						
			// transition right labels
			d3.selectAll(".labels.r-labels")
				.data(vis.data)
				.transition()
				.ease("linear")
		/*.delay(function(d, i){ return i * 250; })*/
				.duration(vis.duration)
				.attr("y" , function(d) { return vis.yScale(d[vis.keyValues[i+1]]) + 4; } )
                
				
		}// end for ...
		
							
		// append y axis ticks definition to upper vis.focus graph
		var yticks = d3.selectAll(".y.axis.start").selectAll('.tick');					 
		yticks.append('svg:line')
			.attr( 'class' , "tick" )
			.attr( 'y0' , 0 )
			.attr( 'y1' , 0 )
			.attr( 'x1' , 0 )
			.attr( 'x2' , vis.w-200+15 );
	
	/*	var sel = d3.selectAll(".goldStandard");
		sel.moveToFront();*/
		
		
		return;
		
		
	}// end function transitionData()
	
	
	
	
	function slopeGraph(){
	
		// initial render chart
		render(vis.data, vis.keyValues);
		// add some filter options
		filterFunc();
		
		// move main graph area down to make space reserved for sparkLines
		d3.select("#slopeSVG").attr("transform" , "translate(0," + vis.sparkLineGap + ")");
		
		return;
		
	}// end function slopeGraph()
			
			
			
			

	
		function makeSlopeGraph(){
			
			'use strict';
			
			d3.select("#filter-ul").remove();
			
			// store chart
			var slopegraph;
			
			// track any user interactions
			/*var */vis.state = {
				// have an array to mutate
				keys: vis.keyValues,
				// track filtered sets
				filter: [],
				// toggle highlights
				navToggle: [],
				// track line selection
				highlight: null
			};
			
			slopeGraph();
			
		
			// just for blocks viewer size
			d3.select(self.frameElement).style('height', '800px');
			
			return;
		
		} // end function ...
	
	
	
		
		
		
	
		// filter sets via user interaction
		function filterFunc() {
			// create array values
			_.times(vis.keyValues.length, function(n) { /*vis.state.filter.push(true);*/ });
			
			if ( vis.rebuildUI == true ){
				//initialise checkbutton and colours array length .. initialise to contain blank entries.
				vis.checkedButton = [];
				vis.checkedButton.length = vis.nodes.length;
				vis.coloursUsed = [];
			}// end if ... 
			
			vis.contextMarkerWidth = ( (vis.browser_width-margin.left)/vis.nodes.length).toFixed(0);
			
			d3.select('#filter')
				.append('ul')
				.attr("id" , "filter-ul")
				.selectAll('li')
				.data(vis.nodes)
				.enter()
				.append('li')
				.style("width" , vis.contextMarkerWidth+"px")
				.attr("class" , "filter-li")
				.attr("id" , function(d,i){ return "filter-li-" + i; })
				.on("mouseover", function(d,i){
					
					return;
				})
				.on("mouseout", function(d,i){
					
					return;
				})
				.on('click', function (d, i) {
					
					// check browser.innerWidth verus width of slopegraph
					if ( ( (200 + 200 * vis.keyValues.length)) >= vis.browser_width && !vis.state.filter[i] ) {
						return;
					}
					
					if (!vis.state.filter[i]) {
						
						/* if adding a concept marker */
						vis.checkedButton[i] = true;
						vis.coloursUsed.push(vis.colours[vis.nodes.length][i]);
						
						// set toggle 
						vis.state.filter[i] = true;
						d3.select(this).style('background', vis.colours[vis.nodes.length][i]);
						// push key into array
						vis.state.keys.push(d);
						// ensure array is kept in date order
						//vis.state.keys = _.sortBy(vis.state.keys);
						// render chart with new keys
						render(vis.data, vis.state.keys);
						checkPersistence();
						
					// ensure there at least two values
					// so a slopegraph can be rendered
					} else if (vis.state.filter[i] && vis.state.keys.length >= 2) {
						
						/* if removing a concept marker */
						vis.checkedButton[i] = false;
						
						vis.state.filter[i] = false;
						d3.select(this).style('background', "#AFAFAF");
						_.pull(vis.state.keys, d);
						//vis.state.keys = _.sortBy(vis.state.keys);
						render(vis.data, vis.state.keys);
						checkPersistence();
						
					}// end else if ... 
					
					
					if (vis.checkedButton.indexOf(true) != -1 ){ document.getElementById("goldStandard").disabled = false; }
					else{ document.getElementById("goldStandard").disabled = true; }
					
				})
				.text(function (d) { return d.trunc(25,false); })
				.style("background", function(d,i){
					
					if ( vis.checkedButton[i] == true ){ return vis.colours[vis.nodes.length][i]; }
					else { return "#AFAFAF"; }
					
					return;
				});
				
				return;
				
		}// end function filterFunc()
		
		
		
		
		function checkPersistence(){
			
			if ( vis.goldStandardHighlight == true ) {
			
			$(".dots").removeClass("goldStandard");
			$(".dots."+vis.goldStandard).addClass("goldStandard");
			
			$(".line").removeClass("goldStandard");
			$(".line."+vis.goldStandard).addClass("goldStandard");
	
			$(".labels.l-labels.elm").removeClass("goldStandard");
			$(".labels.l-labels.elm."+vis.goldStandard).addClass("goldStandard");
	
			$(".labels.r-labels.elm").removeClass("goldStandard");
			$(".labels.r-labels.elm."+vis.goldStandard).addClass("goldStandard");
				
			}
			/*
			var sel = d3.selectAll(".goldStandard");
			sel.moveToFront();*/
			
			return;
							
		}// end function checkPersistence() 
		
		
	
		// navigation to highlight lines
		function navAlt(data) {
			// create array values
			_.times(data.length, function(n) {
				vis.state.navToggle.push(true);
			});
	
	
		}
	
	
		// render slopegraph chart 
		function render(data, keys) {
			
			resetSelection();
			// create chart
			slopegraph = d3.eesur.slopegraph_v2()
				.margin({top: 20, bottom: 20, left: 100, right: 100})
				.gutter(25)
				.keyName('id')
				.keyValues(keys)
				.on('_hover', function (d, i) {
					// hover to highlight line
					highlightLine(i);
					// highlight nav in relation to line
					highlightNav(i);
					// update vis.state of selected highlight line
					vis.state.highlight = i;
				});
	
			
			// apply chart
			d3.select('#slopegraph')
				.datum(data)
				.call(slopegraph);
	
			// ensure highlight is maintained on update    
			if (!_.isNull(vis.state.highlight)) {
				d3.selectAll('.elm').style('opacity', 0.05);
				d3.selectAll('.sel-' + vis.state.highlight).style('opacity', 1);
				highlightNav(vis.state.highlight);
			}
			
		}// end function render
		
		
	
		function highlightLine(i) {
			d3.selectAll('.elm').transition().style('opacity', 0.05);
			d3.selectAll('.sel-' + i).transition().style('opacity', 1);
		}
	
		function highlightNav(i) {
			d3.selectAll('.navAlt').transition().style('opacity', 0.6);
			d3.select('.li-' + i).transition().style('opacity', 1);
		}
	
		function resetSelection() {
			d3.selectAll('.elm').transition().style('opacity', 1);
			d3.selectAll('.navAlt').transition().style('opacity', 1);
		}
	
	//}());