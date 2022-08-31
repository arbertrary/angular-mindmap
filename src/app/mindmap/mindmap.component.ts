import { Component, OnInit, ViewChild, HostListener, AfterViewInit } from '@angular/core';

import { MindmapService, NodeHierarchy } from '../services/mindmap.service';

import { GraphComponent, NgxGraphModule, NodePosition } from '@swimlane/ngx-graph';

import { Layout, Edge, Node, ClusterNode } from '@swimlane/ngx-graph';

import { MatMenuTrigger } from "@angular/material/menu";
import { Subject } from 'rxjs';

import { MindMap } from "src";

import * as saveAsPng from "save-svg-as-png";

@Component({
  selector: 'app-mindmap',
  templateUrl: './mindmap.component.html',
  styleUrls: ['./mindmap.component.scss']
})
export class MindmapComponent implements OnInit {

  // we create an object that contains coordinates 
  menuTopLeftPosition = { x: '0', y: '0' }
  NodeHierarchy = NodeHierarchy;

  // reference to the MatMenuTrigger in the DOM 
  // Multiple MatMenuTriggers: https://stackoverflow.com/a/65703848
  @ViewChild("graphMenuTrigger", { read: MatMenuTrigger, static: true }) graphMenu!: MatMenuTrigger;
  @ViewChild("labelMenuTrigger", { read: MatMenuTrigger, static: false }) labelMenu!: MatMenuTrigger;
  @ViewChild("nodeMenuTrigger", { read: MatMenuTrigger, static: false }) nodeMenu!: MatMenuTrigger;
  @ViewChild("edgeMenuTrigger", { read: MatMenuTrigger, static: false }) edgeMenu!: MatMenuTrigger;
  @ViewChild("clusterMenuTrigger", { read: MatMenuTrigger, static: false }) clusterMenu!: MatMenuTrigger;


  @ViewChild('graph', { static: false }) graphEl!: GraphComponent;

  // links: Edge[] = links;
  // nodes: Node[] = nodes;
  // clusters: ClusterNode[] = clusters;

  // selectedNodes: Node[] = [];
  // draggingEnabled: boolean = false;
  // panningEnabled: boolean = true;
  zoomEnabled: boolean = true;

  // zoomSpeed: number = 0.1;
  // minZoomLevel: number = 0.1;
  // maxZoomLevel: number = 4.0;
  // panOnZoom: boolean = true;

  // autoZoom: boolean = false;
  // autoCenter: boolean = false;
  center$: Subject<boolean> = new Subject();

  toggleColorPicker: boolean = false;

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
  miniMapVisible: boolean = true;

  constructor(public mindMapService: MindmapService) { }

  ngOnInit(): void {
    this.mindMapService.setInterpolationType(this.mindMapService.curveType);
  }

  setOrientationType(oType: string) {
    this.mindMapService.setOrientation(oType);
    this.graphEl.update();
  }

  /** 
   * Method called when the user clicks with the right button
   * @param event MouseEvent, it contains the coordinates 
   * @param item Our data contained in the row of the table 
   */
  handleRightClick(event: MouseEvent, element: Node | Edge | ClusterNode) {
    console.log("right click");
    // preventDefault avoids to show the visualization of the right-click menu of the browser 
    event.preventDefault();

    // we record the mouse position in our object 
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';

    // this.menuTopLeftPosition.x = (event.clientX - this.graphEl.panOffsetX) / this.graphEl.zoomLevel + "px";
    // this.menuTopLeftPosition.y = (event.clientY - this.graphEl.panOffsetY) / this.graphEl.zoomLevel + "px";

    // we open the menu 
    // we pass to the menu the information about our object 
    if (this.mindMapService.isNode(element)) {
      this.nodeMenu.menuData = { node: element };
      // we open the menu 
      this.nodeMenu.openMenu();
    } else if (this.mindMapService.isEdge(element)) {
      this.edgeMenu.menuData = { edge: element };
      this.edgeMenu.openMenu();

    } else if (this.mindMapService.isCluster(element)) {
      this.clusterMenu.menuData = { cluster: element };
      this.clusterMenu.openMenu()

    }
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
    if ((elementUnderPointer !== null
      && (this.mindMapService.isCluster(element)
        || this.mindMapService.isNode(element)))
      || this.mindMapService.isEdge(element)) {

      // Give the current element to the labelMenu to handle
      this.labelMenu.menuData = { item: element };
      this.labelMenu.openMenu();
    } else if (this.mindMapService.isNode(element)) {
      // TODO: Unfortunately when dragging is enabled, dragging triggers opening the details. This is unwanted
      // this.mindMapService.openDetails(element);
      // console.log("open details");
      // TODO: open details
    } else {
      console.log("uhm");
    }
  }

  /**
   * Download the mind map svg as png
   */
  getMindMapAsPng() {
    var mySVG = document.getElementsByClassName('ngx-charts')[0]
    saveAsPng.saveSvgAsPng(mySVG, "mind-map.png");
  }

  /**
   * Selecting and De-selecting nodes using Ctrl+click
   * @param event 
   * @param element 
   */
  handleCtrlClick(event: any, element: Node) {
    if (event.ctrlKey && this.mindMapService.isNode(element)) {
      // If node is in selectedNodes already when ctrl-clicking remove it from there
      if (element.data.stroke === "black") {
        var index = this.mindMapService.selectedNodes.findIndex(x => x.id === element.id);
        this.mindMapService.selectedNodes.splice(index, 1);

        element.data.stroke = "none";

        this.mindMapService.links.map(edge => {
          if (edge.source === element.id) {
            edge.data ? edge.data.class = "" : edge.data = { class: "" };
          }
        }
        );

      } else {
        this.mindMapService.selectedNodes.push(element);
        element.data.stroke = "black";

        this.mindMapService.links.map(edge => {
          if (edge.source === element.id) {
            edge.data ? edge.data.class = "highlighted" : edge.data = { class: "highlighted" };
          }
        }
        );
      }
    }
    this.graphEl.update();
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
      var index = this.mindMapService.nodes.findIndex(x => x.id === element.id);
      this.mindMapService.nodes[index].label = newLabel;
    }
    else if (this.mindMapService.isCluster(element)) {
      var index = this.mindMapService.clusters.findIndex(x => x.id === element.id);
      this.mindMapService.clusters[index].label = newLabel;
    }
    else if (this.mindMapService.isEdge(element)) {
      var index = this.mindMapService.links.findIndex(x => x.id === element.id);
      this.mindMapService.links[index].label = newLabel;
    }
    this.labelMenu.closeMenu();
    this.graphEl.update();
  }

  /**
  * Start the dragging when clicking on a circle
  *
  */
  onNodeCircleMouseDown(event: MouseEvent, node: Node): void {
    if (event.button != 0) {
      return;
    }
    this.isDragging = true;
    this.draggingNode = node;
    this.draggingEnabled = false;

    this.startingDragPosition = {
      x: (event.offsetX - this.graphEl.panOffsetX) / this.graphEl.zoomLevel,
      y: (event.offsetY - this.graphEl.panOffsetY) / this.graphEl.zoomLevel
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
   * // TODO: If the current graph component being dragged is a Node (instead of a circle):
   *  do something
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
        this.mindMapService.links.push(link);
        this.mindMapService.links = [...this.mindMapService.links];
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

  downloadMindMap() {
    var mindMap = JSON.stringify(this.mindMapService.getMindMap(), null, 2);
    var element = document.createElement('a');
    element.setAttribute('href', "data:text/json;charset=UTF-8," + encodeURIComponent(mindMap));
    element.setAttribute('download', "mind_map.json");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click(); // simulate click
    document.body.removeChild(element);
  }

  uploadMindMap(event: any) {
    var selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(selectedFile, "UTF-8");
    fileReader.onload = () => {
      try {
        var mMap: MindMap = JSON.parse(fileReader.result as string);
        console.log(mMap);
        this.mindMapService.loadMindMap(mMap);
      } catch (SyntaxError) {
        alert("Couldn't load MindMap config");
      }
    }
    fileReader.onerror = (error) => {
      console.log(error);
    }
  }

  getLinkStyle() {
    return {
      "fill": "var(--text-color)",
      "font-size": "inherit"
    }
  }
}



