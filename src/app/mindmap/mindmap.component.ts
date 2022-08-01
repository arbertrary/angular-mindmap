import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import * as shape from 'd3-shape';

import { GraphComponent, NgxGraphModule, NodePosition } from '@swimlane/ngx-graph';
import { Layout, Edge, Node, ClusterNode } from '@swimlane/ngx-graph';

import { MatMenuTrigger } from "@angular/material/menu";
import { Subject } from 'rxjs';

import { MindmapService } from '../services/mindmap.service';
import { nodes, clusters, links } from './dummy-data';

@Component({
  selector: 'app-mindmap',
  templateUrl: './mindmap.component.html',
  styleUrls: ['./mindmap.component.scss']
})
export class MindmapComponent implements OnInit {

  // we create an object that contains coordinates 
  menuTopLeftPosition = { x: '0', y: '0' }

  // reference to the MatMenuTrigger in the DOM 
  // Multiple MatMenuTriggers: https://stackoverflow.com/a/65703848
  @ViewChild("rightMenuTrigger", { read: MatMenuTrigger, static: true }) matMenuTrigger!: MatMenuTrigger;
  @ViewChild("labelMenuTrigger", { read: MatMenuTrigger, static: false }) labelMenu!: MatMenuTrigger;
  @ViewChild('graph', { static: false }) graphEl!: GraphComponent;

  links: Edge[] = links;
  nodes: Node[] = nodes;
  clusters: ClusterNode[] = clusters;

  selectedNodes: Node[] = [];

  panningEnabled: boolean = true;
  zoomEnabled: boolean = true;

  // zoomSpeed: number = 0.1;
  // minZoomLevel: number = 0.1;
  // maxZoomLevel: number = 4.0;
  // panOnZoom: boolean = true;

  autoZoom: boolean = false;
  autoCenter: boolean = false;

  // update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();
  // zoomToFit$: Subject<boolean> = new Subject();


  public layoutSettings = {
    // TB = Top-bottom
    // LR = Left-right
    orientation: 'LR'
  };

  // https://marco.dev/angular-right-click-menu
  // Maybe use ngx-graph and create custom node and link functionality, custom context menu etc
  // https://material.angular.io/components/menu/overview
  // Line drag and drop
  // https://stackblitz.com/edit/ngx-graph-demo-23yiqf?file=src%2Fapp%2Fapp.component.html

  isDragging: boolean = false;
  draggingNode: Node | undefined;
  currentDragPosition!: NodePosition;
  startingDragPosition!: NodePosition;
  mouseOverNode: Node | undefined;

  // Enable dragging of nodes
  draggingEnabled: boolean = true;

  constructor(private mindMapService: MindmapService) { }

  ngOnInit(): void {
    const chart = document.getElementsByClassName("ngx-charts")[0];
    chart.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      console.log("right clicked on canvas");
      this.matMenuTrigger.openMenu();
    });
    console.log(chart);
    const panningRect = document.getElementsByClassName("panning-rect")[0];
    console.log(panningRect);

  }


  /** 
   * Method called when the user clicks with the right button
   * @param event MouseEvent, it contains the coordinates 
   * @param item Our data contained in the row of the table 
   */
  handleRightClick(event: MouseEvent, item: any) {
    console.log("right click");
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault();

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';

    // we open the menu 
    // we pass to the menu the information about our object 
    this.matMenuTrigger.menuData = { item: item }

    // we open the menu 
    this.matMenuTrigger.openMenu();

  }

  /**
   * Add a node that is not related to an event with a custom hierarchy/importance 
   * @param h 
   */
  createCustomNode(h: NodeHierarchy) {

  }

  /**
   * Places a node on the canvas
   */
  placeNode() {
    const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 3);

    const node = {
      id: id,
      label: id
    }
    this.nodes.push(node);

    this.nodes = [...this.nodes];
  }

  /**
   * Link two given nodes
   * TODO: currently links two random nodes
   * @param a 
   * @param b 
   * @returns 
   */
  // linkNodes(a: Node, b: Node): Edge {
  linkNodes() {
    var nodeA = this.nodes[Math.floor(Math.random() * this.nodes.length)];
    var nodeB = this.nodes[Math.floor(Math.random() * this.nodes.length)];
    const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 3);

    const e: Edge = {
      id: id,
      source: nodeA.id,
      target: nodeB.id,
      label: 'placeholder'
    }

    this.links.push(e);
    this.links = [...this.links];

    // return e

  }

  /**
   * If nodes have been selected using Ctrl+click, create a cluster from these selected nodes
   * create a random new cluster containing up to 4 nodes
   * // TODO: move to mindmap service
   */
  createCluster() {
    const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 3);
    var childNodes = [];

    if (this.selectedNodes.length > 0) {
      this.selectedNodes.forEach((n) => {
        childNodes.push(n.id);
        n.data.stroke = "none";
      })

      this.selectedNodes = [];

    } else {
      // Randomly create cluster
      // CAUTION: Remove. Just for demo
      var howMany = Math.floor(Math.random() * (4 - 2) + 2);

      for (let i = 0; i <= howMany; i++) {
        var node = this.nodes[Math.floor(Math.random() * this.nodes.length)];
        childNodes.push(node.id);

      }
    }
    const cluster: ClusterNode = {
      id: id,
      label: 'Cluster ' + id,
      childNodeIds: childNodes
    }

    this.clusters.push(cluster);
    this.clusters = [...this.clusters]
  }


  /**
   * Send MindMap to backend (commit)
   */
  saveMindMap() {
    const mindMap = {
      "mindMap":
      {
        nodes: this.nodes,
        links: this.links,
        clusters: this.clusters

      }
    }

    const data = JSON.stringify(mindMap);
    console.log(data);
  }

  /**
   * Handle primary mouse click on a graph element.
   * If Ctrl is pressed, select this node and add it to the selectedNodes list
   * If the graph element is an edge or a Node/ClusterNode label open the rename Menu
   * If Ctrl is not pressed and target is a Node, open the details of that node (if it's a event/commit node)
   * @param event 
   * @param node 
   */
  handleLeftClick(event: any, element: Node | ClusterNode | Edge) {
    const elementUnderPointer = document.elementFromPoint(event.clientX, event.clientY);

    if (event.ctrlKey && this.mindMapService.isNode(element)) {
      // If node is in selectedNodes already when ctrl-clicking remove it from there
      if (element.data.stroke === "black") {
        var index = this.nodes.findIndex(x => x.id === element.id);
        console.log(index);
        this.selectedNodes.splice(index, 1);
        element.data.stroke = "none";
        console.log(this.selectedNodes);
      } else {
        this.selectedNodes.push(element);
        console.log(this.selectedNodes);
        element.data.stroke = "black";
      }
    } else if ((elementUnderPointer !== null
      && (elementUnderPointer.classList.contains("nodeName")
        || elementUnderPointer.classList.contains("clusterName")))
      || this.mindMapService.isEdge(element)) {

      // Give the current element to the labelMenu to handle
      this.labelMenu.menuData = { item: element };
      this.labelMenu.openMenu();

    } else if (this.mindMapService.isNode(element)) {
      console.log("open details");
      // TODO: open details
    } else {
      console.log("uhm");
    }
  }

  /**
   * Assign a new labelname to the given graph element
   * update the graph to reload it with the new label
   * @param newLabel 
   * @param element 
   */
  renameLabel(newLabel: string, element: Node | Edge | ClusterNode) {
    console.log(JSON.stringify(newLabel));
    if (this.mindMapService.isNode(element)) {
      var index = this.nodes.findIndex(x => x.id === element.id);
      this.nodes[index].label = newLabel;
    } else if (this.mindMapService.isCluster(element)) {
      var index = this.clusters.findIndex(x => x.id === element.id);
      this.clusters[index].label = newLabel;

    } else if (this.mindMapService.isEdge(element)) {
      var index = this.links.findIndex(x => x.id === element.id);
      this.links[index].label = newLabel;
    }

    this.graphEl.update();
  }

  /**
  * Start the dragging when clicking on a circle
  *
  */
  onNodeCircleMouseDown(event: any, node: Node): void {
    this.isDragging = true;
    this.draggingNode = node;
    this.draggingEnabled = false;

    this.startingDragPosition = {
      x: (event.layerX - this.graphEl.panOffsetX) / this.graphEl.zoomLevel,
      y: (event.layerY - this.graphEl.panOffsetY) / this.graphEl.zoomLevel
    };

    if (node.position && node.dimension) {
      this.currentDragPosition = {
        x: node.position.x + node.dimension.width / 2,
        y: node.position.y
      };
    }
    else {
      console.log("undefined")
    }

    setTimeout(() => {
      this.mouseOverNode = undefined;
    });
  }

  /**
   * Makes it so the arrow follows the mouse when dragging
   *
   */
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) {
      return;
    }
    this.currentDragPosition.x += event.movementX / this.graphEl.zoomLevel;
    this.currentDragPosition.y += event.movementY / this.graphEl.zoomLevel;
  }

  /**
   * After dragging the arrow (started in onNodeCircleMouseDown)
   * If the target is another circle create a link
   * between the first circle's node and the second.
   * If the current graph component being dragged is a Node (instead of a circle):
   * // TODO: do something
   *
   */
  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (this.isDragging && this.draggingNode) {
      this.draggingEnabled = true;

      // logic if mouse is released over another node
      console.log("drop section");

      // elementFromPoint is MVP. gets the Element under the mouse cursor
      const circle = document.elementFromPoint(event.clientX, event.clientY);

      // TODO: The Edge creation mustn't happen before a link name is given in the input
      if (circle && circle.classList.contains("drag-circle")) {

        const targetId = circle.id.replace("circ-", "");

        const link: Edge = {
          id: this.draggingNode.id + Math.random().toString().substring(2, 8),
          source: this.draggingNode.id,
          target: targetId,
          label: ""
        }
        this.labelMenu.menuData = { item: link };

        this.labelMenu.openMenu();
        this.links.push(link);
        this.links = [...this.links];
      }
    }
    this.isDragging = false;
    this.draggingNode = undefined;
  }

  /**
   * // TODO: currently not used
   * Problem: The dragged node is sometimes on top of the other one and then elementFromPoint returns the same element that has been dragged
   * @param event 
   */
  onNodeMouseUp(event: MouseEvent, node: Node): void {
    console.log("Dropped node");
    console.log(JSON.stringify(node));

    const el = document.elementFromPoint(event.clientX, event.clientY);
    console.log(el);
  }
}



/**
 * The NodeHierarchy defines the visual importance of the nodes on the canvas
 */
enum NodeHierarchy {
  Basic = 0, // Every node initially is a basic node
  Medium,
  High
}


type MindmapNode = {
  hierarchy: NodeHierarchy
}

