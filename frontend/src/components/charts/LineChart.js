'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CHART_COLORS } from '@/lib/constants';

export default function LineChart({
  data,
  xValues,
  xLabel = 'Parameter v',
  yLabel = 'Ranking',
  title = 'Grafik',
  height = 420,
  invertY = false,
  yFormat = null,
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0 || !xValues || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const margin = { top: 20, right: 30, bottom: 80, left: 55 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Flatten all values
    let allValues = [];
    data.forEach(series => {
      allValues = allValues.concat(series.values);
    });

    const x = d3.scaleLinear()
      .domain([d3.min(xValues), d3.max(xValues)])
      .range([0, innerW]);

    const yDomain = [d3.min(allValues) * 0.9, d3.max(allValues) * 1.1];
    if (invertY) yDomain.reverse();

    const y = d3.scaleLinear()
      .domain(yDomain)
      .range([innerH, 0]);

    // Grid
    g.append('g')
      .call(d3.axisLeft(y).tickSize(-innerW).tickFormat(''))
      .selectAll('line')
      .attr('stroke', '#e8ecf3')
      .attr('stroke-dasharray', '3,3');
    g.selectAll('.domain').remove();

    // Lines
    const line = d3.line()
      .x((d, i) => x(xValues[i]))
      .y(d => y(d))
      .curve(d3.curveMonotoneX);

    data.forEach((series, si) => {
      const color = CHART_COLORS[si % CHART_COLORS.length];

      // Line path with animation
      const path = g.append('path')
        .datum(series.values)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2.5)
        .attr('d', line);

      const totalLength = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1000)
        .delay(si * 150)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);

      // Dots
      series.values.forEach((val, i) => {
        g.append('circle')
          .attr('cx', x(xValues[i]))
          .attr('cy', y(val))
          .attr('r', 4)
          .attr('fill', color)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .attr('opacity', 0)
          .on('mouseenter', (event) => {
            const rect = container.getBoundingClientRect();
            const formatted = yFormat ? yFormat(val) : val;
            setTooltip({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top - 10,
              content: `${series.label} (v=${xValues[i]}): ${formatted}`,
            });
          })
          .on('mouseleave', () => setTooltip(null))
          .transition()
          .delay(1000 + si * 150)
          .duration(200)
          .attr('opacity', 1);
      });
    });

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickValues(xValues).tickFormat(d3.format('.1f')))
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '11px');

    // Y axis
    const yAxis = yFormat
      ? d3.axisLeft(y).ticks(5).tickFormat(d => yFormat(d))
      : d3.axisLeft(y).ticks(5);
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '11px');

    svg.selectAll('.domain').attr('stroke', '#d0d7e3');
    svg.selectAll('.tick line').attr('stroke', '#d0d7e3');

    // Axis labels
    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px')
      .text(xLabel);

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -42)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px')
      .text(yLabel);

    // Legend at bottom
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${height - 20})`);

    const itemWidth = Math.min(150, innerW / data.length);
    data.forEach((series, i) => {
      const col = CHART_COLORS[i % CHART_COLORS.length];
      const xPos = i * itemWidth;
      const row = legend.append('g').attr('transform', `translate(${xPos}, 0)`);
      row.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', col);
      row.append('text')
        .attr('x', 14).attr('y', 9)
        .attr('fill', '#6b7280')
        .attr('font-size', '10px')
        .text(series.label);
    });

  }, [data, xValues, xLabel, yLabel, height, invertY, yFormat]);

  return (
    <div className="chart-container" ref={containerRef} style={{ position: 'relative' }}>
      <div className="chart-title">{title}</div>
      <svg ref={svgRef}></svg>
      {tooltip && (
        <div className="d3-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
