import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { ClusterNode, Edge, Node } from '@swimlane/ngx-graph';
import * as shape from 'd3-shape';


import { MindMap, MindMapNote } from 'src';

/**
 * The accompanying service to the mindmap component. Handles all the functionality and settings of the generated ngx-graph
 */
@Injectable({
  providedIn: 'root'
})
export class MindmapService {
  links: Edge[] = [];
  nodes: Node[] = [];
  clusters: ClusterNode[] = [];
  mindMapNotes: MindMapNote[] = [];
  /**
   * Nodes that have been selected using Ctrl+Left Click
   */
  selectedNodes: Node[] = [];


  nodeHeight = 100;
  nodeWidth = 100;
  nodeColor = "#D3D3D3";
  highlightColor = "#FF00FF";

  orientationType: string = "TB";
  curveType: string = "Bundle";

  // line interpolation
  curve: any = shape.curveLinear;
  interpolationTypes = [
    'Bundle',
    'Cardinal',
    'Catmull Rom',
    'Linear',
    'Monotone X',
    'Monotone Y',
    'Natural',
    'Step',
    'Step After',
    'Step Before'
  ];

  orientationTypes = [
    ["TB", "Top to Bottom"],
    ["LR", "Left to right"],
    ["BT", "Bottom to top"],
    ["RL", "Right to left"]
  ]

  public layoutSettings = {
    // TB = Top-bottom
    // LR = Left-right
    orientation: this.orientationType
    // ranker: 'network-simplex',
    // rankPadding: 300,
  };
  /**
   * The MindMapService constructor. CUrrently sets the dimensions of all nodes to the hardcoded width and height
   * @param vizStatesService 
   */
  constructor(private router: Router) { }

  /**
   * Loads a MindMap to this service
   * @param mMap The given MindMap object
   */
  loadMindMap(mMap: MindMap) {
    if (mMap.clusters) {
      this.clusters = mMap.clusters;
    }
    if (mMap.notes) {
      this.mindMapNotes = mMap.notes;
    }
    if (mMap.curve) {
      this.setInterpolationType(mMap.curve);
    }
    if (mMap.orientation) {
      this.setOrientation(mMap.orientation);
    }
    this.nodes = mMap.nodes;
    this.links = mMap.links;

  }

  setOrientation(oType: string) {
    this.orientationType = oType;
    this.layoutSettings.orientation = oType;
  }


  setInterpolationType(curveType: string) {
    this.curveType = curveType;
    if (curveType === 'Bundle') {
      this.curve = shape.curveBundle.beta(1);
    }
    if (curveType === 'Cardinal') {
      this.curve = shape.curveCardinal;
    }
    if (curveType === 'Catmull Rom') {
      this.curve = shape.curveCatmullRom;
    }
    if (curveType === 'Linear') {
      this.curve = shape.curveLinear;
    }
    if (curveType === 'Monotone X') {
      this.curve = shape.curveMonotoneX;
    }
    if (curveType === 'Monotone Y') {
      this.curve = shape.curveMonotoneY;
    }
    if (curveType === 'Natural') {
      this.curve = shape.curveNatural;
    }
    if (curveType === 'Step') {
      this.curve = shape.curveStep;
    }
    if (curveType === 'Step After') {
      this.curve = shape.curveStepAfter;
    }
    if (curveType === 'Step Before') {
      this.curve = shape.curveStepBefore;
    }
  }

  /**
   * Constructs a MindMap object from the nodes, links and clusters in this service
   * @returns The current mind map configuration
   */
  getMindMap(): MindMap {
    const mMap = {
      nodes: this.nodes,
      links: this.links,
      clusters: this.clusters,
      notes: this.mindMapNotes,
      curve: this.curveType,
      orientation: this.orientationType
    }
    return mMap;
  }

  /**
   * Delete the current Mind Map contents and start new
   */
  clearMindMap() {
    this.nodes = [];
    this.links = [];
    this.clusters = [];
  }

  /**
   * Check if given node is in any cluster currently
   * @param node 
   */
  isInCluster(node: Node): boolean {
    for (let c of this.clusters) {
      // console.log(c.childNodeIds);
      if (c.childNodeIds?.includes(node.id)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Places a new node with a random new ID on the canvas
   */
  addNode(level?: NodeHierarchy) {
    const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 4);

    if (!level) {
      var lv = NodeHierarchy.Basic;
      var width = this.nodeWidth;
    } else {
      var lv = level;
      var width = 200;
    }

    const node = {
      id: id,
      label: id,
      dimension: {
        width: width,
        height: this.nodeHeight
      },
      data: {
        level: lv,
        isEventNode: false,
        customColor: this.highlightColor
      }
    }
    this.nodes.push(node);

    this.nodes = [...this.nodes];

    setTimeout(() => {
      this.nodes.map(n => {
        if (n.id == node.id) {
          n.data.customColor = this.nodeColor;
        }
      })
      console.log("color normally")
    }, 4000);
  }

  addMindMapNote(note: string) {
    const date = new Date()
    const dateString = date.toLocaleDateString() + " " + date.toLocaleTimeString();
    var newNote: MindMapNote = {
      note: note,
      date: dateString

    }
    this.mindMapNotes.push(newNote);
  }
  /**
   * Removes the given element from the graph and updates the graph
   * @param element The graph element. Either a node, edge or cluster.
   * If it's a node, remove any associated edges as well
   */
  removeElement(element: Node | Edge | ClusterNode, all?: Boolean) {
    var id = element.id;
    if (this.isNode(element) && all) {
      if (this.selectedNodes.length === 0) {
        alert("There are no nodes selected")
        // Swal.fire({
        //   icon: "error",
        //   title: "Error",
        //   text: "There are no nodes selected."
        // })

      }
      for (let node of this.selectedNodes) {
        var index = this.nodes.findIndex(x => x.id === node.id);
        this.nodes.splice(index, 1);
        this.links = this.links.filter(edge => !(edge.target === node.id || edge.source === node.id));
      }
      // Clear selected nodes and un-highlight all links
      this.selectedNodes = [];
      this.links.map(edge => {
        edge.data ? edge.data.class = "" : edge.data = { class: "" };
      });

    }
    else if (this.isNode(element)) {
      var index = this.nodes.findIndex(x => x.id === id);
      this.nodes.splice(index, 1);
      this.links = this.links.filter(edge => !(edge.target === id || edge.source === id));
    } else if (this.isEdge(element)) {
      var index = this.links.findIndex(x => x.id === id);
      this.links.splice(index, 1);
      this.links = [...this.links];
    } else if (this.isCluster(element)) {
      var index = this.clusters.findIndex(x => x.id === id);
      this.clusters.splice(index, 1);
      this.clusters = [...this.clusters];
    }
  }

  deleteMindMapNote(n: MindMapNote) {
    var index = this.mindMapNotes.findIndex(x => x.date === n.date);
    this.mindMapNotes.splice(index, 1);
  }
  /**
   * 
   * @param node 
   */
  removeFromCluster(node: Node) {
    for (let c of this.clusters) {
      if (c.childNodeIds) {
        c.childNodeIds = c.childNodeIds.filter(n => (n !== node.id));
      }
    }
    this.clusters = [...this.clusters];
  }

  /**
   * If nodes have been selected using Ctrl+left click, create a cluster from these selected nodes
   * @param cluster optional. If given, add the selected nodes to this specific cluster
   */
  createCluster(cluster?: ClusterNode) {
    if (cluster && this.selectedNodes.length > 0) {

      this.selectedNodes.forEach((n) => {
        // If node is already in a cluster remove it from there
        for (let c of this.clusters) {
          if (c.childNodeIds?.includes(n.id)) {
            c.childNodeIds = c.childNodeIds.filter(cnid => cnid !== n.id);
          }
        }

        cluster.childNodeIds?.push(n.id);
        n.data.stroke = "none";
      });

      // Clear selected nodes and un-highlight all links
      this.selectedNodes = [];
      this.links.map(edge => {
        edge.data ? edge.data.class = "" : edge.data = { class: "" };
      });

      this.clusters = [...this.clusters];
    }
    else if (this.selectedNodes.length > 0) {
      const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 3);
      var childNodes: string[] = [];

      this.selectedNodes.forEach((n) => {
        // If node is already in a cluster remove it from there
        for (let c of this.clusters) {
          if (c.childNodeIds?.includes(n.id)) {
            c.childNodeIds = c.childNodeIds.filter(cnid => cnid !== n.id);
          }
        }

        childNodes.push(n.id);
        n.data.stroke = "none";
      });

      // Clear selected nodes and un-highlight all links
      this.selectedNodes = [];
      this.links.map(edge => {
        edge.data ? edge.data.class = "" : edge.data = { class: "" };
      });

      const newCluster: ClusterNode = {
        id: id,
        label: 'Cluster ' + id,
        childNodeIds: childNodes,
        data: {
          customColor: this.nodeColor
        }
      }
      this.clusters.push(newCluster);
      this.clusters = [...this.clusters];
    } else {
      alert("There are no nodes selected");
      // Swal.fire({
      //   icon: "error",
      //   title: "Error",
      //   text: "There are no nodes selected."
      // })

    }
  }

  isNode(n: any): n is Node {
    if (!n.childNodeIds && !n.source) {
      return true;
    }
    else {
      return false;
    }
  };

  isEdge(e: any): e is Edge {
    if (e.source) {
      return true;
    } else {
      return false;
    }
  };

  isCluster(c: any): c is ClusterNode {
    if (c.childNodeIds) {
      return true;
    } else {
      return false;
    }
  }
}
/**
 * The NodeHierarchy defines the visual importance of the nodes on the canvas
 */
export enum NodeHierarchy {
  Basic = "basic", // Every node initially is a basic node
  Medium = "medium",
  High = "high"
}