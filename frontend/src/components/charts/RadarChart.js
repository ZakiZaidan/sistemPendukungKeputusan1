'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function RadarChart({ data, title = 'Radar Chart — Si vs Ri', height = 400 }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const margin = 60;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const categories = data.map(d => d.kode);
    const n = categories.length;
    const angleSlice = (2 * Math.PI) / n;

    // Scales
    const maxVal = Math.max(
      d3.max(data, d => d.si),
      d3.max(data, d => d.ri)
    ) * 1.2;
    const rScale = d3.scaleLinear().domain([0, maxVal]).range([0, radius]);

    // Grid circles
    const levels = 5;
    for (let i = 1; i <= levels; i++) {
      const r = (radius / levels) * i;
      g.append('circle')
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#e8ecf3')
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.8);

      g.append('text')
        .attr('x', 4)
        .attr('y', -r - 2)
        .attr('fill', '#9ca3af')
        .attr('font-size', '9px')
        .text((maxVal / levels * i).toFixed(2));
    }

    // Axis lines
    categories.forEach((cat, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      g.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', x).attr('y2', y)
        .attr('stroke', '#e8ecf3')
        .attr('stroke-width', 1);

      const labelDist = radius + 22;
      g.append('text')
        .attr('x', labelDist * Math.cos(angle))
        .attr('y', labelDist * Math.sin(angle))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', '#6b7280')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .text(cat);
    });

    // Draw areas
    const radarLine = d3.lineRadial()
      .radius(d => rScale(d.value))
      .angle((d, i) => angleSlice * i)
      .curve(d3.curveLinearClosed);

    const series = [
      { key: 'si', label: 'Si (Utility)', color: '#6366f1', fillColor: 'rgba(99, 102, 241, 0.1)' },
      { key: 'ri', label: 'Ri (Regret)', color: '#ec4899', fillColor: 'rgba(236, 72, 153, 0.1)' },
    ];

    series.forEach((s) => {
      const points = data.map(d => ({ value: d[s.key] }));

      g.append('path')
        .datum(points)
        .attr('d', radarLine)
        .attr('fill', s.fillColor)
        .attr('stroke', s.color)
        .attr('stroke-width', 2)
        .attr('opacity', 0)
        .transition()
        .duration(800)
        .attr('opacity', 1);

      // Dots
      data.forEach((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        g.append('circle')
          .attr('cx', rScale(d[s.key]) * Math.cos(angle))
          .attr('cy', rScale(d[s.key]) * Math.sin(angle))
          .attr('r', 3.5)
          .attr('fill', s.color)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1.5);
      });
    });

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 140}, 16)`);

    series.forEach((s, i) => {
      const row = legend.append('g').attr('transform', `translate(0, ${i * 22})`);
      row.append('rect')
        .attr('width', 14).attr('height', 14)
        .attr('rx', 3)
        .attr('fill', s.color)
        .attr('opacity', 0.8);
      row.append('text')
        .attr('x', 20).attr('y', 11)
        .attr('fill', '#6b7280')
        .attr('font-size', '11px')
        .text(s.label);
    });

  }, [data, height]);

  return (
    <div className="chart-container" ref={containerRef}>
      <div className="chart-title">{title}</div>
      <svg ref={svgRef}></svg>
    </div>
  );
}
