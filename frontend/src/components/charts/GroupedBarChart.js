'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CHART_COLORS } from '@/lib/constants';

export default function GroupedBarChart({ data, title = 'Perbandingan Si, Ri, Qi', height = 380 }) {
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

    const subgroups = ['si', 'ri', 'qi'];
    const colors = { si: '#6366f1', ri: '#ec4899', qi: '#10b981' };
    const labels = { si: 'Si', ri: 'Ri', qi: 'Qi' };

    const x0 = d3.scaleBand()
      .domain(data.map(d => d.kode))
      .range([0, innerW])
      .padding(0.25);

    const x1 = d3.scaleBand()
      .domain(subgroups)
      .range([0, x0.bandwidth()])
      .padding(0.06);

    const maxVal = d3.max(data, d => Math.max(d.si, d.ri, d.qi));
    const y = d3.scaleLinear()
      .domain([0, maxVal * 1.15])
      .range([innerH, 0]);

    // Grid
    g.append('g')
      .call(d3.axisLeft(y).tickSize(-innerW).tickFormat(''))
      .selectAll('line')
      .attr('stroke', '#e8ecf3')
      .attr('stroke-dasharray', '3,3');
    g.selectAll('.domain').remove();

    // Bars
    data.forEach((d, i) => {
      subgroups.forEach((key) => {
        g.append('rect')
          .attr('x', x0(d.kode) + x1(key))
          .attr('width', x1.bandwidth())
          .attr('y', innerH)
          .attr('height', 0)
          .attr('rx', 3)
          .attr('fill', colors[key])
          .style('cursor', 'pointer')
          .on('mouseenter', (event) => {
            const rect = container.getBoundingClientRect();
            setTooltip({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top - 10,
              content: `${d.kode} — ${labels[key]}: ${d[key].toFixed(4)}`,
            });
          })
          .on('mouseleave', () => setTooltip(null))
          .transition()
          .duration(700)
          .delay(i * 60)
          .ease(d3.easeCubicOut)
          .attr('y', y(d[key]))
          .attr('height', innerH - y(d[key]));
      });
    });

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2f')))
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '11px');

    svg.selectAll('.domain').attr('stroke', '#d0d7e3');
    svg.selectAll('.tick line').attr('stroke', '#d0d7e3');

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${innerW - 120}, -10)`);

    subgroups.forEach((key, i) => {
      const row = legend.append('g').attr('transform', `translate(${i * 50}, 0)`);
      row.append('rect')
        .attr('width', 12).attr('height', 12)
        .attr('rx', 2)
        .attr('fill', colors[key]);
      row.append('text')
        .attr('x', 16).attr('y', 10)
        .attr('fill', '#6b7280')
        .attr('font-size', '11px')
        .text(labels[key]);
    });

  }, [data, height]);

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
