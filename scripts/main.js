let fillColors = {};
const colorScheme = [
  '#a6cee3',
  '#1f78b4',
  '#b2df8a',
  '#33a02c',
  '#fb9a99',
  '#e31a1c',
  '#fdbf6f'
];

window.addEventListener('DOMContentLoaded', (e) => {
  const url =
    'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json';
  d3.json(url).then((response) => drawChart(response));
});

const drawChart = (movieData) => {
  const chartTitle = 'Movie Sales';
  const chartDescription = 'Top 100 Highest Grossing Movies by Genre';

  const chartDimensions = {
    width: 1200,
    height: 1200,
    padding: { top: 120, bottom: 250, right: 70, left: 70 }
  };

  const titleX = chartDimensions.width / 2;
  const titleY = 60;
  const descriptionX = chartDimensions.width / 2;
  const descriptionY = 95;

  initFillColors(movieData);
  const svg = createChartContainer(chartDimensions);
  drawTitle(svg, titleX, titleY, chartTitle);
  drawDescription(svg, descriptionX, descriptionY, chartDescription);

  drawTreeMap(svg, chartDimensions, movieData);

  drawLegend(svg);
};

const initFillColors = (data) => {
  data.children.forEach((genre, i) => {
    fillColors[genre.name] = colorScheme[i];
  });
};

const drawTreeMap = (svg, chartDimensions, data) => {
  const strokeColor = 'white';

  const width =
    chartDimensions.width -
    chartDimensions.padding.left -
    chartDimensions.padding.right;

  const height =
    chartDimensions.height -
    chartDimensions.padding.top -
    chartDimensions.padding.bottom;

  const treemapSvg = svg
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('x', chartDimensions.padding.left)
    .attr('y', chartDimensions.padding.top);

  const root = d3
    .treemap()
    .size([width, height])
    .padding(1)(
    d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value)
  );

  const leaf = treemapSvg
    .selectAll('g')
    .data(root.leaves())
    .join('g')
    .on('mousemove', (d) =>
      displayTooltip({ x: d3.event.pageX, y: d3.event.pageY }, d.data)
    )
    .on('mouseout', hideTooltip) //(d) => hideTooltip())
    .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

  leaf
    .append('rect')
    .classed('tile', true)
    .attr('data-name', (d) => d.data.name)
    .attr('data-category', (d) => d.data.category)
    .attr('data-value', (d) => d.data.value)
    .attr('fill', (d) => fillColors[d.data.category])
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0);

  leaf
    .append('text')
    .classed('tile-name', true)
    .attr('x', 5)
    .attr('y', 10)
    .text((d) => d.data.name);
};

const createChartContainer = (chartDimensions) =>
  d3
    .select('#chart-container')
    .append('svg')
    .attr('width', chartDimensions.width)
    .attr('height', chartDimensions.height)
    .attr('class', 'chart');

const displayTooltip = (mouseCoords, data) => {
  const offset = { x: 20, y: -15 };

  const tooltip = document.getElementById('tooltip');
  tooltip.style.left = `${mouseCoords.x + offset.x}px`;
  tooltip.style.top = `${mouseCoords.y + offset.y}px`;
  tooltip.style.visibility = 'visible';
  tooltip.setAttribute('data-value', data.value);

  let markup = `
  Name: ${data.name}<br>
  Genre: ${data.category}<br>
  Gross: ${d3.format('$,.0f')(data.value)}
  `;

  tooltip.innerHTML = markup;
};

const hideTooltip = () => {
  const tooltip = document.getElementById('tooltip');
  if (tooltip) tooltip.style.visibility = 'hidden';
};

const drawLegend = (svg) => {
  const legendBoxWidth = 20;
  const offset = { x: 470, y: 1000 };

  const legend = svg.append('svg').attr('id', 'legend');

  const legendScale = d3.scaleOrdinal().domain([]);
  legendScale.range(
    legendScale.domain().map((val, i) => offset.y + i * legendBoxWidth)
  );

  // console.log(fillColors);
  legend
    .selectAll('rect')
    .data(Object.keys(fillColors))
    .enter()
    .append('rect')
    .classed('legend-item', true)
    .attr('stroke', '#333')
    .attr('x', (d, i) => {
      return offset.x + Math.floor(i / 4) * 170;
    })
    .attr('y', (d, i) => {
      const y = offset.y + legendBoxWidth * (i % 4) + (i % 4) * 10;
      return y;
    })
    .attr('fill', (d) => fillColors[d])
    .attr('width', legendBoxWidth)
    .attr('height', legendBoxWidth);

  legend
    .selectAll('text')
    .data(Object.keys(fillColors))
    .enter()
    .append('text')
    .classed('legend-text', true)
    .attr('x', (d, i) => {
      return offset.x + Math.floor(i / 4) * 170 + legendBoxWidth + 10;
    })
    .attr('y', (d, i) => {
      const y =
        offset.y +
        legendBoxWidth * (i % 4) +
        (i % 4) * 10 +
        legendBoxWidth / 1.3;
      return y;
    })
    .text((d) => d);
};

const drawDescription = (svg, descriptionX, descriptionY, chartDescription) => {
  svg
    .append('text')
    .attr('id', 'description')
    .attr('x', descriptionX)
    .attr('y', descriptionY)
    .text(chartDescription);
};

const drawTitle = (svg, titleX, titleY, chartTitle) => {
  svg
    .append('text')
    .attr('id', 'title')
    .attr('x', titleX)
    .attr('y', titleY)
    .text(chartTitle);
};
