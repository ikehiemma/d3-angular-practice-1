import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  template: `
    <div #vizContainer id="vizContainer">
      D3 is here!
    </div>
  `
  
})
export class AppComponent implements OnInit {
  @ViewChild('vizContainer')
    private chartContainer: ElementRef;

    constructor(private http: HttpClient) { }

  ngOnInit(): void{
    this.http.get('../assets/data/cities.csv', { responseType: 'text' }).subscribe(data => {
      var objs = d3.csvParse(data);
      this.dataViz(objs);
    });
  }

  dataViz(incomingData) {
    const element = this.chartContainer.nativeElement;
    d3.select(element).selectAll("div.cities")
    .data(incomingData)
    .enter()
    .append("div") 
    .attr("class","cities") 
    .html(d => d.label);   

  }
}
