'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CHART_COLORS } from '@/lib/constants';

export default function BarChart({ data, xKey = 'kode', yKey = 'qi', title = 'Indeks Qi', height = 380 }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const margin = { top: 20, right: 30, bottom: 50, left: 55 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d[xKey]))
      .range([0, innerW])
      .padding(0.35);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[yKey]) * 1.15])
      .range([innerH, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).tickSize(-innerW).tickFormat(''))
      .selectAll('line')
      .attr('stroke', '#e8ecf3')
      .attr('stroke-dasharray', '3,3');
    g.selectAll('.grid .domain').remove();

    // Bars with animation
    g.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d[xKey]))
      .attr('width', x.bandwidth())
      .attr('y', innerH)
      .attr('height', 0)
      .attr('rx', 6)
      .attr('fill', (d, i) => CHART_COLORS[i % CHART_COLORS.length])
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        const rect = container.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          content: `${d[xKey]}: ${d[yKey].toFixed(4)}`,
        });
        d3.select(event.currentTarget).attr('opacity', 0.8);
      })
      .on('mouseleave', (event) => {
        setTooltip(null);
        d3.select(event.currentTarget).attr('opacity', 1);
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 80)
      .ease(d3.easeCubicOut)
      .attr('y', d => y(d[yKey]))
      .attr('height', d => innerH - y(d[yKey]));

    // Value labels
    g.selectAll('.label')
      .data(data)
      .join('text')
      .attr('x', d => x(d[xKey]) + x.bandwidth() / 2)
      .attr('y', d => y(d[yKey]) - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#374151')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('opacity', 0)
      .text(d => d[yKey].toFixed(4))
      .transition()
      .delay(800)
      .duration(300)
      .attr('opacity', 1);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2f')))
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '11px');

    // Style axes
    svg.selectAll('.domain').attr('stroke', '#d0d7e3');
    svg.selectAll('.tick line').attr('stroke', '#d0d7e3');

    // Y label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -42)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px')
      .text('Nilai Qi');

  }, [data, xKey, yKey, height]);

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
