define( ["qlik", "text!./template.html","css!./css/codewander-style.css","./lib/js/dataConvert","./lib/js/vizRender","./lib/js/d3.v4.min","./lib/js/clusterfck"],
	function ( qlik, template,codewanderstyle,dataConvert,vizRender,d3 ) {

		return {
			template: template,
			initialProperties: {
				qHyperCubeDef: {
					qMode:"S",
					qDimensions: [],
					qMeasures: [],
					qInitialDataFetch: [{
						qWidth: 6	,
						qHeight: 1000
					}]
				}
			},
			definition: {
				type: "items",
				component: "accordion",
				items: {
					dimensions: {
						uses: "dimensions",
						min: 1,
						max: 1
					},
					measures: {
						uses: "measures",
						min: 2,
						max: 5
					},
					settings:{
						uses: "settings",
						items:{
						/*Scroll:{
						type: "boolean",
						component: "switch",
						label: "Enable Scroll",
						ref: "enableScroll",
						options: [{
							value: true,
							label: "Yes"
						}, {
							value: false,
							label: "No"
						}],
						defaultValue: false					
						},*/
						circleRadius:{
						ref:"circleRadius",
						label: "Circle Radius",
						type: "string",
						defaultValue:"2"						
						},
						clusterCount:{
						ref:"clusterCount",
						label: "Cluster Count",
						type: "string",
						defaultValue:"4"						
						}
						}
					
					},
					sorting: {
						uses: "sorting"
					}
				}
			},
			
			support: {
				snapshot: true,
				export: true,
				exportData: false
			},
			paint: function (layout) {
			
				var self =this;
				var qElemNumber=[];
				var dataMatrix=[];
				var cols=[];
				var sel_arr=[];
				
				var dimensions_count= this.$scope.layout.qHyperCube.qDimensionInfo.length;
				var measures_count=this.$scope.layout.qHyperCube.qMeasureInfo.length;
				$($(self.$element[0]).find('#myDiv')[0]).empty();
				$.each(this.$scope.layout.qHyperCube.qDimensionInfo,function(index,item){
				 	cols.push((item.title !=null && item.title!="")?item.title : item.qFallbackTitle);					
				});
				$.each(this.$scope.layout.qHyperCube.qMeasureInfo,function(index,item){
				 	cols.push((item.title !=null && item.title!="")?item.title : item.qFallbackTitle);					
				});				 
				//loop through the rows we have and render
				 this.backendApi.eachDataRow( function ( rownum, row ) {
							self.$scope.lastrow = rownum;
							dataMatrix.push(row);
				 });
				
				this.$scope.selections = [];				
				 if(this.backendApi.getRowCount() > self.$scope.lastrow +1  ){
						  var requestPage = [{
								qTop: self.$scope.lastrow + 1,
								qLeft: 0,
								qWidth: 10, //should be # of columns
								qHeight: Math.min( 1000, this.backendApi.getRowCount() - self.$scope.lastrow )
							}];

						   this.backendApi.getData( requestPage ).then( function ( dataPages ) {
									//when we get the result trigger paint again
									self.paint(layout );
						   } );
				 }
				 else{


					self.$scope.clusterCount=isNaN(self.$scope.layout.clusterCount)? 4: Number(self.$scope.layout.clusterCount)
					self.$scope.circleRadius=isNaN(self.$scope.layout.circleRadius)? 2: Number(self.$scope.layout.circleRadius)
				
					var data=convertforProcessing(dataMatrix,cols,dimensions_count);
					var clusters = clusterfck.kmeans(data.clusterInput, self.$scope.clusterCount);
					var renderData= convertforVisuals(clusters.assignments,data.data)  	
					var vizSetting={};
					vizSetting.clusterCount= Number(self.$scope.clusterCount);
					vizSetting.circleRadius = Number(self.$scope.circleRadius)
					if (self.$scope.layout.enableScroll){
						$($(self.$element[0]).find('#myDiv')[0]).addClass("codewander-enableScroll");
						$($(self.$element[0]).find('#myDiv')[0]).removeClass("codewander-disableScroll");
						
					}
					else
					{
						$($(self.$element[0]).find('#myDiv')[0]).addClass("codewander-disableScroll");	
						$($(self.$element[0]).find('#myDiv')[0]).removeClass("codewander-enableScroll");	
						
					}
					renderV2(renderData,vizSetting,d3,$($(self.$element[0]).find('#myDiv')[0]));
					var csv="data:text/csv;charset=utf-8,";
					for (var cols in renderData[0]){
						csv=csv+ '"' + cols + '"' + ","
					}
					csv=csv+"\n";
					for (var i=0;i<renderData.length;i++)
					{	
						for (var k in renderData[i])
						{
							csv=csv+ '"' + renderData[i][k] + '"' + ","
						}
						csv=csv+ "\n";
					}
					self.$scope.downloadData= {"nodeCount":renderData.length, "nodeData": csv,"clusterData": clusters.centroids} ;
					
				
				 }
				return qlik.Promise.resolve();

			},
			controller: ['$scope', function ( $scope ) {
				//add your rendering code here
				$scope.html = "Hello World";
				$scope.downloadNodeData= function(){
					var encodedUri = encodeURI($scope.downloadData.nodeData);
					//window.open(encodedUri);
					var link = document.createElement("a");
					link.setAttribute("href", encodedUri);
					link.setAttribute("download", "KMeans-Cluster.csv");
					document.body.appendChild(link); // Required for FF
					link.click();
					document.body.removeChild(link);

				}
			}]
		};

	} );

