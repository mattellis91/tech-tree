import { Component } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-tech-tree';
  hierarchy: any;
  treeLayout: any;
  svg:any;
  featureTree: any;
  api:any = {};
  nodesDataMap:any = {};
  depths:any = {};
  linksData:any = [];
  nodesByName:any = {};
  linksBySource:any = {};

  data = [
    {
      depth: 0,
      name: "r",
      label: "r",
      parents: [],
    },
    {
      depth: 1,
      name: "r-1",
      label: "r-1",
      parents: ["r"],
    },
    {
      depth: 2,
      name: "r-1-1",
      label: "r-1-1",
      parents: ["r-1"],
    },
    {
      depth: 3,
      name: "r-1-1-1",
      label: "r-1-1-1",
      parents: ["r-1-1"],
    },
    {
      depth: 4,
      name: "r-1-1-1-1",
      label: "r-1-1-1-1",
      parents: ["r-1-1-1"],
    },
    {
      depth: 1,
      name: "r-2",
      label: "r-2",
      parents: ["r"],
    },
    {
      depth: 2,
      name: "r-2-1",
      label: "r-2-1",
      parents: ["r-2"],
    },
    {
      depth: 3,
      name: "r-2-1-1",
      label: "r-2-1-1",
      parents: ["r-2-1"],
    },
    {
      depth: 4,
      name: "r-2-1-1-1",
      label: "r-2-1-1-1",
      parents: ["r-2-1-1"],
    },
    {
      depth: 4,
      name: "r-2-1-1-2",
      label: "r-2-1-1-2",
      parents: ["r-2-1-1"],
    },
    {
      depth: 5,
      name: "r-2-1-1-2-1",
      label: "r-2-1-1-2-1",
      parents: ["r-2-1-1-2"],
    },
    {
      depth: 2,
      name: "r-2-2",
      label: "r-2-2",
      parents: ["r-2"],
    },
    {
      depth: 3,
      name: "r-2-2-1",
      label: "r-2-2-1",
      parents: ["r-2-2"],
    },
  ]

  ngOnInit() {

    this.api.settings = {
      wrapper: "#feature-tree",
      downloadWrapper: "#save",
      nodeOrientation: "horizontal",
      //linkOrientation: "",
      imageRendering: "pixelated",
      imageDownloadFileName: "taco.png",
      useSpriteSheet: false,
      spriteSheetFileName: "spritesheet.png",
      imageFolderName: "images/high_res",
      useShadows: true,
      initialLinkColor: "none"
    };
  
    this.api.dimensions = {
      svgInitialWidth: window.innerWidth,
      svgInitialHeight: window.innerHeight,
      nodeOuterWidth: 120,
      nodeOuterHeight: 120,
      nodeInnerBorder: 2,
      nodeInnerWidth: 64,
      nodeInnerHeight: 64,
      spriteSheetWidth: 512,
      spriteSheetHeight: 512,
      margin: { top: 20, right: 0, bottom: 20, left: 0 }
    };
    this.api.durations = {
      activateLink: 750,
      activateNode: 250
    };
  }

  ngAfterViewInit() {
    //this.createTree();
    this.test();
  }

  appendSVG() {
    const top = this.api.dimensions.margin.top;
    const left = this.api.dimensions.margin.left;
    this.api.dimensions.svgWidth = this.api.dimensions.svgInitialWidth - left - this.api.dimensions.margin.right;
    this.api.dimensions.svgHeight = this.api.dimensions.svgInitialHeight - top - this.api.dimensions.margin.bottom;
    this.svg = d3
      .select(this.api.settings.wrapper)
      .append("svg")
      .attr("width", this.api.dimensions.svgWidth)
      .attr("height", this.api.dimensions.svgHeight)
      .append("g")
      .attr("transform", `translate(${left},${top})`); 
  }

  parseNodes() { 
    const data = this.data;
    for(const node of data) {
      this.nodesDataMap[node.name] = node;
    }
    for(const node of data) {
      this.depths[node.depth] = this.depths[node.depth] + 1 || 1;
      node.parents = node.parents || [];
      for(const parent of node.parents) {
        this.linksData.push({
          source: this.nodesDataMap[parent],
          target: node
        });
      }
      (node as any)._depthElementCount = this.depths[node.depth];
    }
    for(const node of data) {
      this.orientNodes(node);
    }
  }

  orientNodes(node:any) {
    node.x = node.depth * this.api.dimensions.nodeOuterWidth;
    node.y = (node._depthElementCount * this.api.dimensions.nodeOuterHeight) / (this.depths[node.depth] + 1) - this.api.dimensions.nodeOuterHeight / 2;
  }

  clear() {
    this.linksData = [];
    this.depths = {};
    this.nodesDataMap = {};
    this.nodesByName = {};
  }

  createTree() {
    this.clear();
    this.appendSVG();
    this.parseNodes();
    const w = this.api.dimensions.nodeInnerWidth + 2 * this.api.dimensions.nodeInnerBorder;
    const h = this.api.dimensions.nodeInnerHeight + 2 * this.api.dimensions.nodeInnerBorder;
    const sim = d3.forceSimulation(this.data as any)
      .force("link", d3.forceLink(this.linksData))
    this.init();
    for(const node of this.data) {
      if(!node.parents.length) {
        this.nodesByName[node.name]
          .select("rect")
          .style("fill", "#ffcf70")
          .style("stroke", "#FFBB33")
      }
    }
    console.log(this.nodesByName);
  }
  

  init() {
    const nodes = this.svg.selectAll("g.node").data(this.data);
    console.log(nodes);
    this.initNodes(nodes, this.nodesByName);
    const links = this.svg.selectAll("path.link").data(this.linksData, function(d:any) {
      return d.source.name + "-" + d.target.name;
    });
    this.initLinks(links);
  }

  initNodes(nodes:any, nodesByName:any) {
    nodes
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("id", function(d:any) {
        nodesByName[d.name] = d3.select(d.name);
        return d.name;
      })
      .attr("transform", function(d:any) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .append("circle")
      .attr("cx", this.api.dimensions.nodeInnerWidth + 2 * this.api.dimensions.nodeInnerBorder)
      .attr("cy", this.api.dimensions.nodeInnerHeight + 2 * this.api.dimensions.nodeInnerBorder)
      .attr("r", 20)
      .style("filter", "")
      .style("fill", "#0ff")
      .style("stroke", "#000")
  }

  initLinks(links:any) {
    const lbs = this.linksBySource;
    links
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr("d", 
        d3.linkHorizontal()
          .x(function(d:any) {return d.x;})
          .y(function(d:any) {return d.y;})
      )
      .attr("id", function(pLink:any) {
        lbs[pLink.source.name] = lbs[pLink.source.name] || [];
        lbs[pLink.source.name].push(d3.select(pLink));
        return pLink.source.name + "-" + pLink.target.name;
      })
  }

  test() {
  }

}
