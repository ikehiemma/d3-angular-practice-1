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
    <div id="vizBody">
      <div id="infobox">
        <table>
          <tr>
            <th>Statistics</th>
          </tr>
          <tr>
            <td>Team Name</td>
            <td class="data"></td>
          </tr>
          <tr>
            <td>Region</td>
            <td class="data"></td>
          </tr>
          <tr>
            <td>Wins</td>
            <td class="data"></td>
          </tr>
          <tr>
            <td>Losses</td>
            <td class="data"></td>
          </tr>
          <tr>
            <td>Draws</td>
            <td class="data"></td>
          </tr>
          <tr>
            <td>Points</td>
            <td class="data"></td>
          </tr>
          <tr>
            <td>Goals For</td>
            <td class="data"></td>
          </tr>
          <tr>
            <td>Goals Against</td>
            <td class="data"></td>
          </tr>
          <tr>
            <td>Clean Sheets</td>
            <td class="data"></td>
          </tr>
          <tr>
            <td>Yellow Cards</td>
            <td class="data"></td>
          </tr>
          <tr>
            <td>Red Cards</td>
            <td class="data"></td>
          </tr>
        </table>
      </div>
      <div #vizContainer id="vizContainer"></div>
      <div id="vizControls"></div>
    </div>
  `
})
export class AppComponent implements OnInit {
  @ViewChild('vizContainer')
  private chartContainer: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    d3.csv('../assets/data/worldcup.csv').then(data => this.dataViz(data));
    /* this.http
      .get('../assets/data/worldcup.csv', { responseType: 'text' })
      .subscribe(data => {
        var parsedData = d3.csvParse(data);
        this.dataViz(parsedData);
      }); */
  }

  dataViz(incomingData) {
    const element = this.chartContainer.nativeElement;

    d3.select(element)
      .append('svg')
      .attr(
        'style',
        'height: 500px; width: 500px; border:1px lightgray solid;'
      );

    d3.select('svg')
      .append('g')
      .attr('id', 'teamsG')
      .attr('transform', 'translate(50,300)')
      .selectAll('g')
      .data(incomingData)
      .enter()
      .append('g')
      .attr('class', 'overallG')
      .attr('transform', (d, i) => 'translate(' + i * 50 + ', 0)');

    var teamG = d3.selectAll('g.overallG');

    teamG
      .append('circle')
      .attr('r', 0)
      .transition()
      .delay((d, i) => i * 100)
      .duration(500)
      .attr('r', 40)
      .transition()
      .duration(500)
      .attr('r', 20);

    teamG
      .append('text')
      .attr('y', 30)
      .text(d => d.team);

    const dataKeys = Object.keys(incomingData[0]).filter(
      d => d !== 'team' && d !== 'region'
    );

    d3.select('#vizControls')
      .selectAll('button.teams')
      .data(dataKeys)
      .enter()
      .append('button')
      .on('click', buttonClick)
      .html(d => d);

    function buttonClick(datapoint) {
      var maxValue = d3.max(incomingData, d => parseFloat(d[datapoint]));

      var colorQuantize = d3
        .scaleQuantize()
        .domain([0, maxValue])
        .range(colorbrewer.Reds[3]);

      var tenColorScale = d3
        .scaleOrdinal()
        .domain(['UEFA', 'CONMEBOL', 'CAF', 'AFC'])
        .range(d3.schemeCategory10);

      var ybRamp = d3
        .scaleLinear()
        .interpolate(d3.interpolateLab)
        .domain([0, maxValue])
        .range(['blue', 'yellow']);

      var radiusScale = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range([2, 20]);

      d3.selectAll('g.overallG')
        .select('circle')
        .transition()
        .duration(1000)
        .attr('r', d => radiusScale(d[datapoint]))
        .style('fill', d => colorQuantize(d[datapoint]));
    }

    teamG.on('mouseover', highlightRegion);

    function highlightRegion(d) {
      var teamColor = d3.rgb('#75739F');
      d3.select(this)
        .select('text')
        .classed('active', true)
        .attr('y', 10);
      d3.selectAll('g.overallG')
        .select('circle')
        .style('fill', p =>
          p.region === d.region
            ? teamColor.darker(0.75)
            : teamColor.brighter(0.5)
        );
      this.parentElement.appendChild(this);
    }

    teamG.on('mouseout', unHighlight);
    function unHighlight() {
      d3.selectAll('g.overallG')
        .select('circle')
        .attr('class', '');
      d3.selectAll('g.overallG')
        .select('text')
        .classed('active', false)
        .attr('y', 30);
    }

    teamG.select('text').style('pointer-events', 'none');
/* 
    d3.selectAll('g.overallG')
      .insert('image', 'text')
      .attr('xlink:href', d => `../assets/images/${d.team}.png`)
      .attr('width', '45px')
      .attr('height', '20px')
      .attr('x', -22)
      .attr('y', -10); */

    teamG.on('click', teamClick);
    function teamClick(d) {
      d3.selectAll('td.data')
        .data(d3.values(d))
        .html(p => p);
    }

    //d3.html("../assets/svg/noun_Football_1907.svg", data => {console.log(data)});
    /* d3.xml('../assets/svg/noun_Football_1907.svg').then(data => {
      loadSVG(data);
      function loadSVG(svgData) {
        d3.selectAll('g').each(function() {
          var gParent = this;
          d3.select(svgData)
            .selectAll('path')
            .each(function() {
              gParent.appendChild(this.cloneNode(true));
            });
        });
      }
    });

    d3.selectAll('g.overallG').each(function(d) {
      d3.select(this)
        .selectAll('path')
        .datum(d);
    });
    var fourColorScale = d3
      .scaleOrdinal()
      .domain(['UEFA', 'CONMEBOL', 'CAF', 'AFC'])
      .range(['#5eafc6', '#FE9922', '#93C464', '#fcbc34']);
    d3.selectAll('path')
      .style('fill', p => fourColorScale(p.region))
      .style('stroke', 'black')
      .style('stroke-width', '2px'); */
  }
}
