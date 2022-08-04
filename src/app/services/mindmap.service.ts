import { Injectable } from '@angular/core';
import { Layout, Edge, Node, ClusterNode } from '@swimlane/ngx-graph';
import { demoClusters, demoLinks, demoNodes } from 'src/assets/demo-mind-map';

@Injectable({
  providedIn: 'root'
})
export class MindmapService {
  links: Edge[] = demoLinks;
  nodes: Node[] = demoNodes;
  clusters: ClusterNode[] = demoClusters;

  /**
   * Nodes that have been selected using Ctrl+Left Click
   */
  selectedNodes: Node[] = [];


  nodeHeight = 100;
  nodeWidth = 100;
  nodeColor = "#D3D3D3";

  constructor() { }

  /**
   * Loads a MindMap to this service
   * @param mMap The given MindMap object
   */
  loadMindMap(mMap: MindMap) {
    if (mMap.clusters) {
      this.clusters = mMap.clusters;
    }

    this.nodes = mMap.nodes;
    this.links = mMap.links;
  }

  /**
   * Constructs a MindMap object from the nodes, links and clusters in this service
   * @returns The current mind map configuration
   */
  getMindMap(): MindMap {
    const mMap = {
      nodes: this.nodes,
      links: this.links,
      clusters: this.clusters
    }
    return mMap;
  }

  /**
   * An intermediate function calling the openDetails function of eventService
   * @param node 
   */
  openDetails(node: Node) {
    console.log("open details");
  }

  /**
   * Places a new node with a random new ID on the canvas
   */
  addNode(level?: NodeHierarchy) {
    const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 4);

    if (!level) {
      var lv = NodeHierarchy.Basic;
      var width = this.nodeWidth;
      var customColor = this.nodeColor;
    } else {
      var lv = level;
      var width = 200;
      var customColor = "#fff000";
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
        customColor: customColor
      }
    }
    this.nodes.push(node);

    this.nodes = [...this.nodes];
  }

  /**
   * Removes the given element from the graph and updates the graph
   * @param element The graph element. Either a node, edge or cluster.
   * If it's a node, remove any associated edges as well
   */
  removeElement(element: Node | Edge | ClusterNode, all?: Boolean) {
    var id = element.id;
    if (this.isNode(element) && all) {
      for (let node of this.selectedNodes) {
        var index = this.nodes.findIndex(x => x.id === node.id);
        this.nodes.splice(index, 1);
        this.links = this.links.filter(edge => !(edge.target === node.id || edge.source === node.id));
      }
      this.selectedNodes = [];
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

  /**
   * If nodes have been selected using Ctrl+left click, create a cluster from these selected nodes
   * @param cluster optional. If given, add the selected nodes to this specific cluster
   */
  createCluster(cluster?: ClusterNode) {
    if (cluster && this.selectedNodes.length > 0) {
      // TODO: Can't yet assign a node that's already in a cluster to a different cluster
      this.selectedNodes.forEach((n) => {
        cluster.childNodeIds?.push(n.id);
        n.data.stroke = "none";
        this.selectedNodes = [];
      })
      this.clusters = [...this.clusters];
    }
    else if (this.selectedNodes.length > 0) {
      const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 3);
      var childNodes: string[] = [];

      this.selectedNodes.forEach((n) => {
        childNodes.push(n.id);
        n.data.stroke = "none";
      });

      this.selectedNodes = [];

      const newCluster: ClusterNode = {
        id: id,
        label: 'Cluster ' + id,
        childNodeIds: childNodes
      }

      this.clusters.push(newCluster);
      this.clusters = [...this.clusters]
    } else {
      alert("There are no nodes selected.");
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

export type MindMap = {
  nodes: Node[];
  links: Edge[];
  clusters?: ClusterNode[]
}

/**
 * The NodeHierarchy defines the visual importance of the nodes on the canvas
 */
export enum NodeHierarchy {
  Basic = "basic", // Every node initially is a basic node
  Medium = "medium",
  High = "high"
}