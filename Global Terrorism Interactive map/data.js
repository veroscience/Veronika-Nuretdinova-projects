
var map_circles;
var value_colors={};
var selected_values;
var year_data;
var circle_color;
var selectedOption="attacktype1_txt";
var add_other=0;
var modal;
var isYearRange=0;
var ratio=1;
var bubble_labels;



d3.csv("http://nuretdinova.com/GTD/data/gtd_short.csv").then(function(data) {
    // Parse strings to numbers
    data.forEach(function(d) {
        d.latitude = +d.latitude;
        d.longitude = +d.longitude;
        d.nkill = +d.nkill;
        d.nwound = +d.nwound;
        d.iyear= +d.iyear;

        let decade = Math.floor(d.iyear / 10) * 10;
        d.decade = `${decade}s`;
    });        

    ////create data for the first image
    year_data=data.filter(d=> d.iyear== "1970")   

    let keys = ["attacktype1_txt", "INT_LOG", "weaptype1_txt"];

    for (let i=0; i<keys.length; i++) {
 ///create fixed colors for the values
    value_array=(data.map(d=>d[keys[i]])).filter(d=> d!="Unknown")
    let uniqueValues = Array.from(new Set(value_array))
    value_colors[keys[i]]=d3.scaleOrdinal().domain(uniqueValues).range(d3.schemeCategory10)
}
    
////create colors for year 1970 and attack types
create_circles(selectedOption)
update_circle_colors(selectedOption, year_data) 



////////////////////////////////////////////////////////////////////////////////event listener for the slider
///////slider

singleYearSlider.on('end', val => {
    console.log("slider value", val)
    d3.select('#yearDisplay').text(d3.format('.0f')(val));

    
  year_data= data.filter(d=> d.iyear== val)
 /// Add circles
 map_svg.selectAll("circle").remove()   
 create_circles(selectedOption)
update_circle_colors(selectedOption,  year_data)



///apply legend filters
filterCircles(label_clicked)
///apply legend style
legend.selectAll("text").style("font-weight", d=>label_clicked.includes(d)? "bold": "normal")
});

rangeYearSlider.on('end', val => {
    console.log("slider value", val)
    d3.select('#yearDisplay').text(d3.format('.0f')(val[0])+" - "+d3.format('.0f')(val[1]));
// Show the loading spinner
d3.select('#loadingSpinner').style('display', 'block');
    
 // Delay the circle update and hiding of the spinner
setTimeout(() => { 

  year_data= data.filter(d=> d.iyear>= val[0] &&   d.iyear<= val[1])
 /// Add circles
 map_svg.selectAll("circle").remove()   
 create_circles(selectedOption)
update_circle_colors(selectedOption,  year_data)

///apply legend filters
filterCircles(label_clicked)
///apply legend style
legend.selectAll("text").style("font-weight", d=>label_clicked.includes(d)? "bold": "normal")
// Show the loading spinner
d3.select('#loadingSpinner').style('display', 'none');}, 10);
});

////sliders switch


d3.select("#yearLabel").on("click", function() {
    isYearRange = isYearRange==0? 1:0
    
            // Show the loading spinner
            d3.select('#loadingSpinner').style('display', 'block');

    d3.select("#yearLabel").text(function(d) {if (isYearRange==1) {return "Year Range:"} else {return "Year:"}})
 
    if (isYearRange==0)
        {    d3.select("#singleYearSlider").style('display', 'block');
            d3.select("#rangeYearSlider").style('display', 'none');
            var val=singleYearSlider.value()

            // Show the loading spinner
        
            year_data= data.filter(d=> d.iyear== singleYearSlider.value())

            d3.select('#yearDisplay').text(d3.format('.0f')(val))       
        }
        else if  (isYearRange==1)
        {   d3.select("#singleYearSlider").style('display', 'none');
            d3.select("#rangeYearSlider").style('display', 'block');
            var val=rangeYearSlider.value()
            year_data= data.filter(d=> d.iyear>= val[0] &&  d.iyear<= val[1])

             d3.select('#yearDisplay').text(d3.format('.0f')(val[0])+" - "+d3.format('.0f')(val[1]));
        }
        setTimeout(() => { 

        map_svg.selectAll("circle").remove()   
        create_circles(selectedOption)
       update_circle_colors(selectedOption,  year_data)
      
       ///apply legend filters
       filterCircles(label_clicked)
       ///apply legend style
       legend.selectAll("text").style("font-weight", d=>label_clicked.includes(d)? "bold": "normal")
       // Remove the loading spinner
       // Delay the circle update and hiding of the spinner
    d3.select('#loadingSpinner').style('display', 'none');}, 10);
    

})

}).catch(function(error){
    console.log(error);
})



//// function create_circles()
function create_circles()
    {
       map_circles=map_svg.append("g").attr("id", "circles").selectAll('circle')
    .data(year_data)
    .enter()
    .append('circle')
    .attr('cx', function(d) { return projection([d.longitude, d.latitude])[0]; })
    .attr('cy', function(d) { return projection([d.longitude, d.latitude])[1]; })
    .attr('r', function(d) { return Math.sqrt(d.nkill)*2*ratio ; })  // adjust the multiplier as needed
    .style('fill', 'red')  // color the circle
    .style('fill-opacity', 0.7)
    .style('stroke', '#22223B')  // add a stroke around the circle
    .style('stroke-width', '0.5')  // set the stroke width    
    .on('click', function(d) {
        
        // Get the modal
        modal = document.getElementById("myModal");
        var rect=document.getElementById('map_id').getBoundingClientRect()
        var popup_rect=document.getElementById('myModal').getBoundingClientRect()

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // Populate modal with data
        document.getElementById("modal-info").innerHTML =
            'Date: ' + d.iyear + '/' + d.imonth + '/' + d.iday +
            '<br>Location: ' + d.city + ', ' + d.country_txt +
            '<br>Attack type: ' + d.attacktype1_txt +
            '<br># of killed: ' + d.nkill +
            (d.nwound !== "" ? '<br># of wounded: ' + d.nwound : '') +
            (d.gname !== "Unknown" ? '<br>Terrorist group: ' + d.gname : '') +
            (d.summary !== "" ? '<br>Summary: ' + d.summary : '');

        // Open the modal
        modal.style.display = "block";
        modal.style.overflowY = "auto";  // add this line for scrollbar
        modal.style.maxHeight = (rect.height * 0.6) + "px"; 

        modal.style.left = d3.event.clientX+5+"px";

       

        // calculate the bottom of mapid, assume it starts at 'rect.top' and has height 'rect.height'
        let intendedTopPosition = d3.event.clientY-5;
        intendedTopPosition = intendedTopPosition > rect.top + rect.height * 0.6? rect.top + rect.height * 0.6 : intendedTopPosition
       
        modal.style.top = intendedTopPosition + "px";

        // stop the propagation of the click event
    d3.event.stopPropagation();


        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        }
        
    });

   
     // When the user clicks anywhere outside of the modal, close it
     window.onclick = function(event) {
        if (!modal.contains(event.target)) {
            modal.style.display = "none";
        }
    }
    // re-apply the current zoom state
    map_svg.selectAll('path')
    .attr('transform', transform);
    map_circles.attr("transform", transform);

    
if (show_all==false) {
    // Call filterTopBubbles after a slight delay
    setTimeout(function() {
        filterTopBubbles(Math.round(bubbleFilterSlider.value()))
    }, 150); // You might need to adjust this delay time
}

/////////create bubble labels

bubble_labels=map_svg.append("g").attr("id", "labels").selectAll('.bubble_label')
.data(year_data)
.enter()
.append('text')
.attr('x', function(d) { return projection([d.longitude, d.latitude])[0]; })
.attr('y', function(d) { return projection([d.longitude, d.latitude])[1]; })
.text("")  // display the 'nkill' value as the label
.attr('font-family', 'Arial')
.attr('font-size', '12px')
.attr('fill', 'black')
.attr('text-anchor', 'middle')  // center the text on the 'x' coordinate
.attr('dominant-baseline', 'middle');  // center the text on the 'y' coordinate

}



////function update_circle_colors

function update_circle_colors(selectedOption, year_data)
{ 
      ///add "Other" to legend
    var year_data_value=year_data.map(d=>d[selectedOption])
    if (["Unknown", "Other"].some(val =>year_data_value.includes(val))) {add_other=1; console.log("add_other=1")}

    var grouped_data_value = Array.from(
        year_data.reduce((acc, d) => {
          return acc.set(d[selectedOption], (acc.get(d[selectedOption]) || 0) + d.nkill);
        }, new Map())
      );

      grouped_data_value.sort(function(a, b) {
        return b[1] - a[1];
    });

    
    if(grouped_data_value.length>10)
    {  
         var topTenCounts=grouped_data_value.filter(d=>!["Unknown", "Other"].includes(d[0])).slice(0,10)
        restTotalCount=d3.sum(grouped_data_value, d => d[1])-d3.sum(topTenCounts, d => d[1])
     //   topTenCounts.push(["Other", restTotalCount]);
        selected_values=topTenCounts.map(d=>d[0])
        add_other=1
    } 
    else
    {selected_values=grouped_data_value.filter(d=>!["Unknown", "Other"].includes(d[0])).map(d=>d[0])}

    ///add value_colors['gname']
    if(!["attacktype1_txt", "INT_LOG", "weaptype1_txt"].includes(selectedOption))
    {value_colors[selectedOption]=d3.scaleOrdinal().domain(selected_values).range(d3.schemeCategory10)}
    
    // Define your circle's color
circle_color = (d) => {
    // If the category is in the top ten, use its color, otherwise use "Other"
    return selected_values.includes(d[selectedOption]) ? value_colors[selectedOption](d[selectedOption]) : "whitesmoke";
};
    // Update legend

    legend.selectAll("*").remove();
    create_legend(selected_values)

    ///update circles color
    map_svg.selectAll("circle").style('fill', d=> circle_color(d))  // color the circle
    ;}


///////
var show_all=true;

function filterTopBubbles(val) {
    console.log("filtering", val)
    // Assuming 'circles' is your d3 selection of all the circles
    // Sort circles by radius in descending order
    var sorted_data = [...year_data]; // This creates a new copy of year_data
    sorted_data.sort(function(a, b) {
        return b.nkill - a.nkill;
    });

    // Select top N circles
    var circle_limit = sorted_data.map(d=>d.nkill).slice(val-1,val);    

    map_svg.selectAll("circle").style('display', function(d) {if(d.nkill>circle_limit[0]) {return "block"} else {return "none"}});

    ///update legend
    console.log("circle_limit", circle_limit[0])
    show_all=false;
    
    add_other=0;

    update_circle_colors(selectedOption,  sorted_data.slice(0, val))

}
