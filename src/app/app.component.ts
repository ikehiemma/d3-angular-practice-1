import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation
} from '@angular/core';
import * as d3 from 'd3';
import * as colorbrewer from 'colorbrewer';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.css'],
  template: `
    <div #vizContainer id="vizContainer"></div>
  `
})
export class AppComponent implements OnInit {
  @ViewChild('vizContainer')
  private chartContainer: ElementRef;

  scatterData = [
    { friends: 5, salary: 22000 },
    { friends: 3, salary: 18000 },
    { friends: 10, salary: 88000 },
    { friends: 0, salary: 180000 },
    { friends: 27, salary: 56000 },
    { friends: 8, salary: 74000 }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    d3.csv('../assets/data/boxplot.csv').then(data => this.dataViz(data));

    //this.dataViz(this.scatterData);
  }

  dataViz(data) {
    const element = this.chartContainer.nativeElement;

    d3.select(element)
      .append('svg')
      .attr(
        'style',
        'height: 1000px; width: 1000px; border:1px lightgray solid;'
      );

    //defining scales
    const tickSize = 470;
    const xScale = d3
      .scaleLinear()
      .domain([1, 8])
      .range([20, tickSize]);
    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([tickSize + 10, 20]);

    //adding axis
    const yAxis = d3
      .axisRight()
      .scale(yScale)
      .ticks(8)
      .tickSize(tickSize);
    d3.select('svg')
      .append('g')
      //.attr('transform', `translate(${tickSize},0)`)
      .attr('id', 'yAxisG')
      .call(yAxis);

    const xAxis = d3
      .axisBottom()
      .scale(xScale)
      .tickSize(-tickSize)
      .tickValues([1, 2, 3, 4, 5, 6, 7]);
    d3.select('svg')
      .append('g')
      .attr('transform', `translate(0,${tickSize + 10})`)
      .attr('id', 'xAxisG')
      .call(xAxis);

    d3.select('#xAxisG > path.domain').style('display', 'none');

    //d3.selectAll('#xAxisG').attr('transform', 'translate(0,500)');

    //scatter plot
    d3.select('svg')
      .selectAll('circle.median')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'tweets')
      .attr('r', 5)
      .attr('cx', d => xScale(d.day))
      .attr('cy', d => yScale(d.median))
      .style('fill', 'darkgray');

    d3.select('svg')
      .selectAll('g.box')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'box')
      .attr(
        'transform',
        d => 'translate(' + xScale(d.day) + ',' + yScale(d.median) + ')'
      )
      .each(function(d, i) {
        d3.select(this)
          .append('line')
          .attr('class', 'range')
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', yScale(d.max) - yScale(d.median))
          .attr('y2', yScale(d.min) - yScale(d.median))
          .style('stroke', 'black')
          .style('stroke-width', '4px');
        d3.select(this)
          .append('line')
          .attr('class', 'max')
          .attr('x1', -10)
          .attr('x2', 10)
          .attr('y1', yScale(d.max) - yScale(d.median))
          .attr('y2', yScale(d.max) - yScale(d.median))
          .style('stroke', 'black')
          .style('stroke-width', '4px');
        d3.select(this)
          .append('line')
          .attr('class', 'min')
          .attr('x1', -10)
          .attr('x2', 10)
          .attr('y1', yScale(d.min) - yScale(d.median))
          .attr('y2', yScale(d.min) - yScale(d.median))
          .style('stroke', 'black')
          .style('stroke-width', '4px');
        d3.select(this)
          .append('rect')
          .attr('class', 'range')
          .attr('width', 20)
          .attr('x', -10)
          .attr('y', yScale(d.q3) - yScale(d.median))
          .attr('height', yScale(d.q1) - yScale(d.q3))
          .style('fill', 'white')
          .style('stroke', 'black')
          .style('stroke-width', '2px');
        d3.select(this)
          .append('line')
          .attr('x1', -10)
          .attr('x2', 10)
          .attr('y1', 0)
          .attr('y2', 0)
          .style('stroke', 'darkgray')
          .style('stroke-width', '4px');
      });
  }
}
