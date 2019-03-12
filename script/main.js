"use strict"
var user_speed = "slow",
    jsonData,
    colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D', '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC', '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399', '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933', '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'],
    width = 780,
    height = 800,
    padding = 1,
    maxRadius = 3,
    sched_objs = [],
    curr_minute = 0,
    speeds = {
        "slow": 1000,
        "medium": 200,
        "fast": 50
    };

var regionData = [];

//time notes that are used at certain timestamps
var notes_index = 0;

//activity to be used in the centre of the circle
var center_act = "World",
    center_pt = {
        "x": 380,
        "y": 365
    };

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

//unique array function
const uniqueArray = (element) => element.filter((el, index) => index == $.inArray(el, element)).sort();

var nodes = [],
    foci = {},
    allcountry = [],
    allpestle = [],
    alltopic = [],
    allsector = [],
    activities = [],
    groupedData = [],
    allRegions = [];

var indexRegion = {};
//time difference between published and added time
const timeDifference = (ft, st, format) => Math.floor(moment.duration(moment(ft,format).diff(moment(st,format))).asMinutes());

$(document).ready(() => {
    d3.json("data/jsondata.json", function (error, data) {
        jsonData = data;

        //all country data
        jsonData.forEach(el => {
            if (el["country"])
                allcountry.push(el["country"])
        });
        //only unique country
        allcountry = uniqueArray(allcountry);

        //all region data 
        jsonData.forEach(el => {
            if (el["region"])
                allRegions.push(el["region"]);
        });

        //only unique regions
        allRegions = uniqueArray(allRegions);
        // allRegions.push(i++)
        //all pestle data
        jsonData.forEach(el => {
            if (el["pestle"])
                allpestle.push(el["pestle"])
        });
        //only unique pestle
        allpestle = uniqueArray(allpestle);

        //all sector data
        jsonData.forEach(el => {
            if (el["sector"])
                allsector.push(el["sector"])
        });
        //only unique sector
        allsector = uniqueArray(allsector);


        // kasdfh asdhfad fjsadf jdasf
        // fkaskjfahsd fsdajf jsd
        // asdhfasdjfkjsdaf
        //all topic data
        jsonData.forEach(el => {
            if (el["topic"])
                alltopic.push(el["topic"])
        });
        //only unique topic
        alltopic = uniqueArray(alltopic);

        allRegions.forEach((el, index) => indexRegion[el] = index)

        //grouping data on the basis of pestle and pushing data to regionData

        allpestle.forEach((pestle, i) => {
            regionData[pestle] = [];
            jsonData.forEach((el) => {
                if (el["pestle"].toLowerCase() == pestle.toLowerCase() && el["region"]) {
                    if (el["added"] && el["published"]) {
                        var duration = timeDifference(el["added"], el["published"], "MMMM, DD YYYY hh:mm:ss");
                        regionData[pestle].push({
                            act: el["region"],
                            duration: duration,
                            count: 0,
                            color: colorArray[i],
                            regionIndex: indexRegion[el["region"]]
                        });
                    }
                }
            })
        });




        // giving regions index,color,count(for calculation)

        console.log(regionData);
        //to show the middle value on the chart and all around in circle in it
        allRegions.forEach((code, i) => {
            if (code == center_act) {
                foci[code] = center_pt;
            } else {
                var theta = 2 * Math.PI / (code.length - 1);
                foci[code] = {
                    x: 250 * Math.cos(i * theta) + 380,
                    y: 250 * Math.sin(i * theta) + 365
                };
            }
        });

        //value indication and node creation
        /* allpestle.forEach(pestle => {
            regionData[pestle].forEach((e) => {
                var act;
                console.log("times");
                for (var prop in indexRegion) {
                    if (e["act"] == prop) {
                        act = indexRegion[prop];
                        console.log(act);
                        e["count"] += 1;
                        var int_x = foci[act].x + Math.random();
                        var int_y = foci[act].y + Math.random();
                        nodes.push({
                            act: act,
                            radius: 5,
                            x: int_x,
                            y: int_y,
                            color: e["color"],
                            moves: 0,
                            next_move_time: e["duration"],
                            sched: regionData[pestle]
                        });
                    }
                }
            });
        }); */
        //d3 layout 
        var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            // .links([])
            .gravity(0)
            .charge(0)
            .friction(.8)
            .on("tick", tick)
            .start();

        //type of fig on the chart
        var circle = svg.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", function (d) {
                return d[radius];
            })
            .style("fill", function (d) {
                return d[color];
            });

        //labels position for data in a circle
        var label = svg.selectAll("text")
            .data(allRegions)
            .enter()
            .append("text")
            .attr("class", "actlabel")
            .attr("x", function (d, i) {
                if (d == center_act) {
                    return center_pt.x;
                } else {
                    var theta = 2 * Math.PI / (allRegions.length - 1);
                    return 340 * Math.cos(i * theta) + 380;
                }
            })
            .attr("y", function (d, i) {
                if (d == center_act) {
                    return center_pt.y;
                } else {
                    var theta = 2 * Math.PI / (allRegions.length - 1);
                    return 340 * Math.sin(i * theta) + 365;
                }
            });

        //label name
        label.append("tspan")
            .attr("x", function () {
                return d3.select(this.parentNode).attr("x");
            })
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d[region];
            });

        label.append("tspan")
            .attr("dy", "1.3em")
            .attr("x", function () {
                return d3.select(this.parentNode).attr("x");
            })
            .attr("text-anchor", "middle")
            .attr("class", "actpct")
            .text(function (d) {
                return regionData[d][count] + "%";
            });

        //update time ....
        function timer() {
            d3.range(nodes.length).forEach(i => {
                var curr_node = nodes[i],
                    curr_moves = curr_node[moves];

                //time to go to next activity
                if (curr_node.next_move_time == curr_minute) {
                    if (curr_node.moves == curr_node.sched.length - 1) {
                        curr_moves = 0;
                    } else {
                        curr_moves += 1;
                    }
                    // Subtract from current activity count
                    regionData[curr_node.act] -= 1;

                    // Move on to next activity
                    // console.log("curr_node: ",curr_node);
                    curr_node.act = curr_node.act;

                    // Add to new activity count
                    regionData[curr_node.act] += 1;

                    curr_node.moves = curr_moves;
                    curr_node.cx = foci[curr_node.act].x;
                    curr_node.cy = foci[curr_node.act].y;

                    nodes[i].next_move_time += nodes[i].duration;
                }
            });

            force.resume();
            curr_minute += 1;

            //update percentage
            label.selectAll("tspan.actpct")
                .text(function (d) {
                    return readablePercent(regionData[d][count]);
                });

            // Update time
            var true_minute = curr_minute % 1440;
            d3.select("#current_time").text(minutesToTime(true_minute));

            //update notes
            if (true_minute == time_notes[notes_index].start_minute) {
                d3.select("#note")
                    .style("top", "0px")
                    .transition()
                    .duration(600)
                    .style("top", "20px")
                    .style("color", "#000000")
                    .text(time_notes[notes_index].note);
            }

            // Make note disappear at the end.
            else if (true_minute == time_notes[notes_index].stop_minute) {

                d3.select("#note").transition()
                    .duration(1000)
                    .style("top", "300px")
                    .style("color", "#ffffff");

                notes_index += 1;
                if (notes_index == time_notes.length) {
                    notes_index = 0;
                }
            }
            setTimeout(timer, speeds[user_speed]);
        }
        setTimeout(timer, speeds[user_speed]);

        function tick(e) {
            var k = 0.04 * e.alpha;
            //push nodes towardss thier designated status
            nodes.forEach(function (o, i) {
                var curr_act = o[act];
                //making sleep a bit sluggish
                if (curr_act == "0") {
                    var damper = 0.6;
                } else {
                    var damper = 1;
                }
                o.color = color(curr_act);
                o.y += (foci[curr_act].y - o.y) * k * damper;
                o.x += (foci[curr_act].x - o.x) * k * damper;
            });
            circle
                .each(collide(.5))
                .style("fill", function (d) {
                    return d.color;
                })
                .attr("cx", function (d) {
                    return d.x
                })
                .attr("cy", function (d) {
                    return d.y
                });
        }

        //resolve collision between nodes

        function collide(alpha) {
            var quadtree = d3.geom.quadtree(nodes);
            return function (d) {
                var r = d.radius + maxRadius + padding;
                nx1 = d.x - r;
                nx2 = d.x + r;
                ny1 = d.y - r;
                ny2 = d.y + r;

                quadtree.visit(function (quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                        var x = d.x - quad.point.x,
                            y = d.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = d.radius + quad.points.radius + (d[act] !== quad.point[act]) * padding;
                        if (l < r) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 < ny2 || y2 < ny1;
                });
            };
        }

        //speed toggle

        d3.selectAll(".togglebutton")
            .on("click", function () {
                if (d3.select(this).attr("data-val") == "slow") {
                    d3.select(".slow").classed("current", true);
                    d3.select(".medium").classed("current", false);
                    d3.select(".fast").classed("current", false);
                } else if (d3.select(this).attr("data-val") == "medium") {
                    d3.select(".slow").classed("current", false);
                    d3.select(".medium").classed("current", true);
                    d3.select(".fast").classed("current", false);
                } else {
                    d3.select(".slow").classed("current", false);
                    d3.select(".medium").classed("current", false);
                    d3.select(".fast").classed("current", true);
                }
                USER_SPEED = d3.select(this).attr("data-val");
            });

    }); // data end
})

//finding the percent
function readablePercent(n) {

    var pct = 100 * n / 1000;
    if (pct < 1 && pct > 0) {
        pct = "<1%";
    } else {
        pct = Math.round(pct) + "%";
    }

    return pct;
}

//time conversion for the duration to iterate over it.
function minutesToTime(m) {
    var minutes = (m + 5 * 60) % 1440;
    var hh = Math.floor(minutes / 60);
    var ampm;
    if (hh > 12) {
        hh = hh - 12;
        ampm = "pm";
    } else if (hh == 12) {
        ampm = "pm";
    } else if (hh == 0) {
        hh = 12;
        ampm = "am";
    } else {
        ampm = "am";
    }
    var mm = minutes % 60;
    if (mm < 10) {
        mm = "0" + mm;
    }

    return hh + ":" + mm + ampm
}