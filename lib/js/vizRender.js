function render (data,vizSetting, d3,el)
{
var elId="#myDiv"
var width = $(el).width()*.99,
    height =  $(el).height()*.99,
    padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 12;

  
var n = 200, // total number of nodes
    m = vizSetting.clusterCount; // number of distinct clusters

var color = d3.scaleSequential(d3.interpolateRainbow)
    .domain(d3.range(m));

// The largest node for each cluster.
var clusters = new Array(m);

var nodes = data.map(function(item,index) {
  var i = item.cluster,

      r = vizSetting.circleRadius//Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius
      d = {
        cluster: i,
        radius: vizSetting.circleRadius ,
        x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
        y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()

      };
      for(var k in item) d[k]=item[k];

     // console.log("x,y-" + d.x + "," + d.y)
  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
  return d;
});
  
console.log(nodes);

var force = d3.forceSimulation()
  // keep entire simulation balanced around screen center
  .force('center', d3.forceCenter(width/2, height/2))
	
	// pull toward center
  .force('attract', attract()
    .target([width/2, height/2])
    .strength(0.02))

  // cluster by section
  .force('cluster', cluster()
    .strength(0.7))

  // apply collision with padding
  .force('collide', d3.forceCollide(d => d.radius + padding)
    .strength(0))

  .on('tick', layoutTick)
	.nodes(nodes);
  
var svg = d3.select($(el).get(0)).append("svg")
    .attr("width", width)
    .attr("height", height);

var node = svg.selectAll("circle")
    .data(nodes)
  .enter().append("circle")
    .style("fill", function(d) { return color(d.cluster/10); });


    node.on("mousemove", function(d){
      div.style("left", d3.event.offsetX+"px");
      div.style("top", d3.event.offsetY+"px");
      div.style("display", "inline-block");
      var t="";
      for (var key in d) {
          if (d.hasOwnProperty(key) && d.hasOwnProperty(key+"display")) {
            t=t+key + " : " + d[key+"display"]+"<br>";
          }
        }							
      div.html(t);
    })
    .on("mouseout", function(d){
      div.style("display", "none");
    });
    
// ramp up collision strength to provide smooth transition
var transitionTime = 2000;
var t = d3.timer(function (elapsed) {
  var dt = elapsed / transitionTime;
  force.force('collide').strength(Math.pow(dt, 2) * 0.7);
  if (dt >= 1.0) t.stop();
});
  
function layoutTick(e) {
  console.log(d);
  if(!isNaN(d.x) && !isNaN(d.y)){
  node
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.radius; });
  }
}

// Move d to be adjacent to the cluster node.
// from: https://bl.ocks.org/mbostock/7881887
function cluster () {

  var nodes,
    strength = 0.1;

  function force (alpha) {

    // scale + curve alpha value
    alpha *= strength * alpha;

    nodes.forEach(function(d) {
			var cluster = clusters[d.cluster];
    	if (cluster === d) return;
      
      let x = d.x - cluster.x,
        y = d.y - cluster.y,
        l = Math.sqrt(x * x + y * y),
        r = d.radius + cluster.radius;

      if (l != r) {
        l = (l - r) / l * alpha;
        d.x -= x *= l;
        d.y -= y *= l;
        cluster.x += x;
        cluster.y += y;
      }
    });

  }

  force.initialize = function (_) {
    nodes = _;
  }

  force.strength = _ => {
    strength = _ == null ? strength : _;
    return force;
  };

  return force;

}
  
function attract (target) {

  let nodes,
    targets,
    strength = 0.1;

  function force (alpha) {
    let node, target;
    for (let i=0; i<nodes.length; i++) {
      node = nodes[i];
      target = targets[i];
      node.vx += (target[0] - node.x) * strength * alpha;
      node.vy += (target[1] - node.y) * strength * alpha;
    }
  }

  force.initialize = _ => {
    nodes = _;
    targets = new Array(nodes.length);
    for (let i=0; i<nodes.length; i++) targets[i] = target(nodes[i], i, nodes);
  };

  force.strength = _ => {
    strength = _ == null ? strength : _;
    return force;
  };

  force.target = _ => {
    if (_ == null) _ = target;
    target = (typeof _ === 'function') ? _ : () => _;
    return force;
  };

  if (!target) force.target([ 0, 0 ]);
  return force;

}


}
function renderV2(data,vizSetting, d3,el)
{


  var elId="#myDiv"
  var width = $(el).width()*.99,
      height =  $(el).height()*.99,
      padding = 1.5, // separation between same-color nodes
      clusterPadding = 2, // separation between different-color nodes
      maxRadius = 12;
        
     
  var n = 200, // total number of circles
      m = vizSetting.clusterCount; // number of distinct clusters
  
  var color = d3.scaleOrdinal(d3.schemeCategory20)
      .domain(d3.range(m));
  
  // The largest node for each cluster.
  var clusters = new Array(m);
  
  var nodes = data.map(function(item,index) {
    var i = item.cluster//Math.floor(Math.random() * m),
  
        r = vizSetting.circleRadius//Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
        d = {
          cluster: i,
          radius: vizSetting.circleRadius ,
          x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
          y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
  
        };
        for(var k in item) d[k]=item[k];
       // console.log("x,y-" + d.x + "," + d.y)
    if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
    return d;
  });
  
  var forceCollide = d3.forceCollide()
      .radius(function(d) { return d.radius + 1.5; })
      .iterations(1);
  
  var force = d3.forceSimulation()
      .nodes(nodes)
      .force("collide", forceCollide)
      .force("cluster", forceCluster)
      .force("gravity", d3.forceManyBody(30 ))
      .force("x", d3.forceX().strength(.7))
      .force("y", d3.forceY().strength(.7))
      .force("center", d3.forceCenter())
      
      .on("tick", tick);
  
  var svg = d3.select($(el).get(0)).append("svg")
      .attr("width", width)
      .attr("height", height)
    .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
  
  var circle = svg.selectAll("circle")
      .data(nodes)
    .enter().append("circle")
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d) { return color(d.cluster); })
  
      var div = d3.select($(el).get(0)).append("div").attr("class", "codewander-toolTip");
					
  circle.on("mousemove", function(d){
    div.style("left", d3.event.offsetX+"px");
    div.style("top", d3.event.offsetY+"px");
    div.style("display", "inline-block");
    var t="";
    for (var key in d) {
        if (d.hasOwnProperty(key) && d.hasOwnProperty(key+"display")) {
          t=t+key + " : " + d[key+"display"]+"<br>";
        }
      }							
    div.html(t);
  })
  .on("mouseout", function(d){
    div.style("display", "none");
  });
  
  function tick() {
    circle
        .attr("cx", function(d) { return d.x })
        .attr("cy", function(d) { return d.y });
  }
  
  function forceCluster(alpha) {
    for (var i = 0, n = nodes.length, node, cluster, k = alpha * 1; i < n; ++i) {
      node = nodes[i];
      cluster = clusters[node.cluster];
      node.vx -= (node.x - cluster.x) * k;
      node.vy -= (node.y - cluster.y) * k;
    }
  }
  


}