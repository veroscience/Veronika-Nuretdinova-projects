var options={"attack type": "attacktype1_txt", "terrorist group": "gname",  "international/local":"INT_LOG", "weapon":"weaptype1_txt", "period":"decade"};
var selectedLabel;
var label_clicked=[];
var parentWidth;
var bubbleFilterSlider;
var equalsize=0;

d3.select("#bubble_color")
    .append('select')
    .selectAll('option')
    .data(d3.keys(options))
    .enter()
    .append('option')
    .text(function (d) { return d; })
    .attr('value', function (d) { return d; })
    .attr('class', 'dropdown-content');

///add condition for dropdown
d3.select("#bubble_color").on("change", function(d) {
    selectedOption = options[d3.select("#bubble_color"+' option:checked').text()];

    ///clear legend filters
    label_clicked=[]
    map_circles.style('display', 'block');

    
////recolor the circles based on the new legend
if (show_all==false) {
    // Call filterTopBubbles after a slight delay
    setTimeout(function() {
        filterTopBubbles(Math.round(bubbleFilterSlider.value()))
    }, 150); // You might need to adjust this delay time
} else {update_circle_colors(selectedOption,  year_data) }


});


///add labels
var label_options={"Bubble Labels":"none", "attack type": "attacktype1_txt", "terrorist group": "gname",  
"international/local":"INT_LOG", "weapon":"weaptype1_txt", "# of victims": "nkill", "year":"iyear"};

d3.select("#bubble_label")
    .append('select')
    .selectAll('option')
    .data(d3.keys(label_options))
    .enter()
    .append('option')
    .text(function (d) { return d; })
    .attr('value', function (d) { return d; })
    .attr('class', 'dropdown-content');

///add condition for dropdown
d3.select("#bubble_label").on("change", function(d) {
    selectedLabel =label_options[d3.select("#bubble_label"+' option:checked').text()];

    // Reassign labels based on selected dropdown value
    bubble_labels
        .text(function(d) { 
            return d[selectedLabel]; 
        });
});


// define legend space
var legend = d3.select("#legend").append("svg")
//.style("background", "#f2e9e4") ;

function create_legend(selected_values) {
// add one dot in the legend for each category
if (add_other==1)

{selected_values.push("Other")
}

if (selectedOption == "decade")
{selected_values.sort(function(a, b) {
    return parseInt(a) - parseInt(b);
});}

legend.selectAll("mydots")
    .data(selected_values)
    .enter()
    .append("circle")
        .attr("cx", 10)
        .attr("cy", function(d,i){ return 10 + i*25}) // 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){  if (d === "Other") {
            return "whitesmoke";
        } else {
            return value_colors[selectedOption](d);
        }})
        .style('stroke', '#22223B')  // add a stroke around the circle
        .style('stroke-width', '0.5')  // set the stroke width


// add one label in the legend for each category
legend.selectAll("mylabels")
    .data(selected_values)
    .enter()
    .append("text")
        .attr("x", 25)
        .attr("y", function(d,i){ return 10 + i*25}) // 25 is the distance between dots
        .attr("dy", 3.5)
        .text(function(d){ return d})
        .style("font-size", "12px")
        .style("cursor", "hand")
        .on('click', function(d){
            var font_weight= d3.select(this).style("font-weight")=="bold"? "normal":"bold"
            d3.select(this).style("font-weight", font_weight);

            if (label_clicked.includes(d)) {
                const index = label_clicked.indexOf(d);
                if (index > -1) {
                    label_clicked.splice(index, 1);
                } 

            } else { label_clicked.push(d)};

            filterCircles(label_clicked);
        });
       // .attr("text-anchor", "left")
       // .style("alignment-baseline", "middle")

legend.attr("height", 20 + selected_values.length*25)
} ////create legend

function filterCircles(label_clicked) {
    // If the label is selected, filter the circles.
    if (label_clicked.length>0) {
        map_circles.style('display', d => label_clicked.includes(d[selectedOption]) ? 'block' : 'none');
    }
    // If the label is not selected, show all circles.
    else {
        map_circles.style('display', 'block');

        if (show_all==false) {
            // Call filterTopBubbles after a slight delay
            setTimeout(function() {
                filterTopBubbles(Math.round(bubbleFilterSlider.value()))
            }, 150); // You might need to adjust this delay time
        }
    }
}


/// Define the bubble size slider

// define bubble slider width
function setBubbleSlider() {
    d3.select("#bubbleSizeSlider").selectAll("*").remove();
    parentWidth = document.getElementById('bubbleSizeSlider').parentNode.parentNode.offsetWidth;
    console.log("parentWidth", parentWidth)

var bubbleSizeSlider = d3.sliderHorizontal()
.min(0.2)
.max(5)
.step(0.1)
.height(40)
.width(parentWidth*0.8)
.tickValues([0,1,5])
.tickFormat(d3.format('.0f'))
.default(1)
.on("end" ,  vratio => { 
    map_svg.selectAll("circle").attr("r", function(d) {
       // Obtain the current radius of the circle
       let currentRadius = d3.select(this).attr('r');
       // Update the radius using the vratio
       return currentRadius * vratio;}) ; 
        ratio=vratio}); 

// Append it to your page
var g_slider2 = d3.select('#bubbleSizeSlider').append('svg')
.append('g').attr("id", "bubbleSizeSlider")
.attr('transform', 'translate(10,30)');

g_slider2.call(bubbleSizeSlider);
///set initial width

}

setBubbleSlider();

///mnake bubbles same size

d3.select("#equalsize").on("click", function(d) {
    equalsize=equalsize==0? 1:0
    // Reassign labels based on selected dropdown value
    map_circles.attr("r", function(d) { if(equalsize==0) {return Math.sqrt(d.nkill)*2*ratio} else {return 2*ratio} ; })
});
////Define the filter slider


// Define the bubble filter slider

function setFilterSlider() {

d3.select("#bubbleFilterSlider").selectAll("*").remove();

bubbleFilterSlider = d3.sliderHorizontal()
.min(100) // Minimum value
.max(1) // Maximum value - placeholder, will update dynamically
.tickValues([1,25,50,75,100])
.step(1) // Step size
.height(40)
.width(parentWidth*0.8)
.tickFormat(d3.format('.0f')) // Formatting of ticks
.default(100) // Default value - placeholder, will update dynamically
.on('end', val => { 
    // When the slider is released, filter the bubbles.
    filterTopBubbles(val);
});

// Append it to your page
var g_filter_slider = d3.select('#bubbleFilterSlider').append('svg')
.append('g')
.attr('transform', 'translate(10,30)');

g_filter_slider.call(bubbleFilterSlider);
}

setFilterSlider();

///resize the slider upon window resize
window.addEventListener("resize", function () {setBubbleSlider(); setFilterSlider()});

document.getElementById('showAll').addEventListener('click', function() {
    // Display all circles
    map_svg.selectAll("circle").style("display", null);
    show_all=true;
});

// Define the slider
var singleYearSlider = d3.sliderHorizontal()
  .min(1970)
  .max(2021)
  .step(1)
 .width(700)
 .height(40)
  .tickFormat(d3.format('.0f'))
  .tickValues([1970, 1980, 1990, 2000, 2010, 2020])
  .default(1970)

// Append it to your page
var g_slider = d3.select('#yearSlider').append('svg')
  .append('g').attr("id", "singleYearSlider")
  .attr('transform', 'translate(20,30)');


  g_slider.call(singleYearSlider);

    

var rangeYearSlider = d3.sliderHorizontal()
.min(1970)
.max(2021)
  .step(1)
 .width(700)
 .height(40)
  .tickFormat(d3.format('.0f'))
  .tickValues([1970, 1980, 1990, 2000, 2010, 2020])
  .default([1970,2021])
  .fill('#4A4E69')
  
  var g_slider_range =d3.select('#yearSlider').select('svg').append('g').attr("id", "rangeYearSlider").attr('transform', 'translate(20,30)').call(rangeYearSlider).style('display', 'none');


  ////////////
  
  // Apply styles to the ticks
  d3.selectAll('.tick text')
  .style('fill', "#22223B").style('font-size', '14px');

  // Apply styles to the handle text
d3.select('.parameter-value text')
.style('fill', '#22223B').style('font-size', '14px')
.style('font-weight', 'bold');


