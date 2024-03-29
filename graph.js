// setup tree diagram dimensions
const dims = { height: 500, width: 1100 }

const svg = d3.select('.canvas')
  .append('svg')
  .attr('width', dims.width + 100)
  .attr('height', dims.height + 100)

const graph = svg.append('g') // append group to create graph group
  .attr('transform', 'translate(50,50)')

// data stratified : convert data to a hierarchy
const stratify = d3.stratify()
  .id(d => d.name)
  .parentId(d => d.parent)

const tree = d3.tree()
  .size([dims.width, dims.height])

// create ordinal scale
const color = d3.scaleOrdinal(['#f4511e', '#e91e63', '#e53935', '#9c27b0'])

const tooltip = d3.tip()
  .attr('class', 'tip card')
  .direction('se')
  .html(d => {
    let content = `<div>${d.data.department}</div>`
    return content
  })

graph.call(tooltip)

// update function
const update = (data) => {

  // remove current nodes
  graph.selectAll('.node').remove()
  graph.selectAll('.link').remove()

  // update ordinal scale domain to each department
  color.domain(data.map(item => item.department))

  // get updated root Node data
  const rootNode = stratify(data)
  
  // pass rootNode data to tree generator
  const treeData = tree(rootNode)

  // get nodes selection and join data to the nodes
  const nodes = graph.selectAll('.node')
    .data(treeData.descendants())

  // get link selection and join data
  const links = graph.selectAll('.link')
    .data(treeData.links())

  // enter new links 
  links.enter()
    .append('path')
    .attr('class', 'link')
    .attr('fill', 'none')
    .attr('stroke', '#aaa')
    .attr('stroke-width', 2)
    .attr('d', d3.linkVertical()
      .x(d => d.x)  
      .y(d => d.y)
    )



  // create enter node groups onto the page with `node` class to every elm
  const enterNodes = nodes.enter()
    .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)

  // append rects to enter nodes
  enterNodes.append('rect')
    .attr('fill', d => color(d.data.department))
    .attr('stroke', '#555')
    .attr('stroke-width', 2)
    .attr('height', 50)
    .attr('width', d => d.data.name.length * 20)
    .attr('transform', d => {
      var x = d.data.name.length * 10
      return `translate(${-x}, -30)`
    })
    
  // append name text
  enterNodes.append('text')
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .text(d => d.data.name)


  // add events
  graph.selectAll('.node')
    .on('mouseover', handleMouseOver) 
    .on('mouseout', handleMouseOut)


}

// data & firebase hook-up
var data = []

db.collection('employees').onSnapshot(res => {

  res.docChanges().forEach(change => {

    const doc = {...change.doc.data(), id: change.doc.id}

    switch (change.type) {
      case 'added':
        data.push(doc)
        break

      case 'modified':
        const index = data.findIndex(item => item.id == doc.id)
        data[index] = doc
        break

      case 'removed':
        data = data.filter(item => item.id !== doc.id)
        break

      default:
        break
    }
  })

  update(data)

})


// event handler functions
const handleMouseOver = (d, idx, n) => {
  tooltip.show(d, n[idx])
  d3.select( n[idx] )
    .transition('changeSliceFill').duration(300)
      .style('cursor', 'pointer')
}

const handleMouseOut = (d, idx, n) => {
  tooltip.hide(d, n[idx])
  d3.select( n[idx] )
    .transition('changeSliceFill').duration(300)
      .attr('fill', color(d.data.name)) // update color back to its original color by data's name
      .style('cursor', 'default')
}
