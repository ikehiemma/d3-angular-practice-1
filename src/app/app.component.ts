import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  template: `
    <div #vizContainer id="vizContainer">
    </div>
    <div id="vizControls">
    </div>
  `
  
})
export class AppComponent implements OnInit {
  @ViewChild('vizContainer')
    private chartContainer: ElementRef;

    constructor(private http: HttpClient) { }

  ngOnInit(): void{
    this.http.get('../assets/data/tweets.json').subscribe(data => {
      this.dataViz(data.tweets);
      
    });
    
  }

  dataViz(incomingData) {
    const element = this.chartContainer.nativeElement;

    incomingData.forEach(d => {
      d.impact = d.favorites.length + d.retweets.length;
      d.tweetTime = new Date(d.timestamp);
    });

    var maxImpact = d3.max(incomingData, d => d.impact);
    var startEnd = d3.extent(incomingData, d => d.tweetTime); 
    var timeRamp = d3.scaleTime().domain(startEnd).range([20,480]); 
    var yScale = d3.scaleLinear().domain([0,maxImpact]).range([0,460]);

    var radiusScale = d3.scaleLinear()
                    .domain([0,maxImpact]).range([1,20]);

    var colorScale = d3.scaleLinear()
                    .domain([0,maxImpact]).range(["white","#75739F"]);

    d3.select(element).append("svg")
      .attr("style","height: 480px; width: 600px;");

    var tweetG = d3.select("svg")
      .selectAll("g")
      .data(incomingData)
      .enter()
      .append("g")
      .attr("transform", d =>
      "translate(" +
        timeRamp(d.tweetTime) + "," + (480 - yScale(d.impact))
        + ")"
      );
      
    tweetG.append("circle")
      .attr("r", d => radiusScale(d.impact))
      .style("fill", d => colorScale(d.impact))
      .style("stroke", "black")
      .style("stroke-width", "1px");

    tweetG.append("text")
      .text(d => d.user + "-" + d.tweetTime.getHours());

            
  }
}
