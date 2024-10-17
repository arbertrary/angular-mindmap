import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from "@angular/material/menu";
import { ClusterNode, Edge, GraphComponent, Node, NodePosition } from '@swimlane/ngx-graph';
import { Subject } from 'rxjs';

import { MindMap } from 'src';

import { MindmapService, NodeHierarchy } from '../services/mindmap.service';

/**
 * This library is archived and there have been no commits for a few years. Might cause issues in the long run
 * typings: https://github.com/ksholla20/save-svg-as-png-typings
 * https://github.com/exupero/saveSvgAsPng
 */
import * as saveAsPng from "save-svg-as-png";


/** 
 * A mind-map implementation using ngx-graph.
 * See this github repository for this mind-map as separate project: https://github.com/arbertrary/angular-mindmap
 * 
 * https://marco.dev/angular-right-click-menu
 * Line drag and drop
 * https://stackblitz.com/edit/ngx-graph-demo-23yiqf?file=src%2Fapp%2Fapp.component.html
 */
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

  zoomEnabled: boolean = true;

  center$: Subject<boolean> = new Subject();

  toggleColorPicker: boolean = false;

  isDraggingALink: boolean = false;
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

  // ngOnDestroy(): void {
  //   if (this.globalService.globalConnected) {
  //     this.gitService.addCommit(this.globalService.globalConnection.repoId, this.mindMapService.getMindMap())
  //       .subscribe(
  //         response => {
  //           console.log(response.action);
  //         });
  //   }
  // }

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
    // this.menuTopLeftPosition.x = event.screenX + 'px';
    // this.menuTopLeftPosition.y = event.screenY + 'px';

    // console.log(this.menuTopLeftPosition);
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
    this.openContextMenuAtMousePosition();
  }

  /**
   * Handle primary mouse click on a graph element. Only used for the rename label menu.
   * If the graph element is an edge or a Node/ClusterNode label open the rename Menu
   * @param event 
   * @param node 
   */
  handleLeftClick(event: any, element: Node | ClusterNode | Edge) {
    const elementUnderPointer = document.elementFromPoint(event.clientX, event.clientY);
    if ((elementUnderPointer !== null
      && (this.mindMapService.isCluster(element)
        || this.mindMapService.isNode(element)))
      || this.mindMapService.isEdge(element)) {
      event.preventDefault();

      // we record the mouse position in our object 
      this.menuTopLeftPosition.x = event.clientX + 'px';
      this.menuTopLeftPosition.y = event.clientY + 'px';
      // Give the current element to the labelMenu to handle
      this.labelMenu.menuData = { item: element };
      this.labelMenu.openMenu();

      this.openContextMenuAtMousePosition();
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
        element.data.strokeWidth = "4";

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

    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';

    this.isDraggingALink = true;
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
    if (!this.isDraggingALink) {
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
    if (this.isDraggingALink && this.draggingNode) {
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
          label: "edge"
        }
        this.labelMenu.menuData = { item: link };

        this.labelMenu.openMenu();
        this.openContextMenuAtMousePosition();

        this.mindMapService.links.push(link);
        this.mindMapService.links = [...this.mindMapService.links];
      }
    }
    this.isDraggingALink = false;
    this.draggingNode = undefined;
  }

  onNodeMouseDown() {
    this.isDraggingALink = false;
  }

  /**
   * Move a dragged node onto/into a (different) cluster
   * Check if the dragged node is over a cluster (identified by checking the HTML elements' ids)
   * Get the cluster id from the <svg:rect that is the cluster rectangle.
   * Check if the dragged node is already in a cluster. If so, remove it from there
   * 
   * Then add the node to the cluster that is under the mouse
   *
   * @param {MouseEvent} event
   * @param {Node} node
   */
  onNodeMouseUp(event: MouseEvent, node: Node): void {
    if (event.button != 0) {
      return;
    }
    if (this.isDraggingALink) {
      return;
    }


    // Get the list of HTML Elements under the mouse cursor
    const els = document.elementsFromPoint(event.clientX, event.clientY);

    // Check if there's a cluster rectangle under the cursor
    var clusterEl = els.find(el =>
      el.id.startsWith("cluster-")
    );
    var nodeEl = els.find(el =>
      el.id.startsWith("node-el-") && el.id.replace("node-el-", "") !== node.id
    );

    if (clusterEl) {
      // If there's a cluster rectangle check if the dropped node is already in a different cluster
      // If yes, remove it from there
      console.log(clusterEl.id);
      const clusterId = clusterEl.id.replace("cluster-rect-", "");
      const cluster = this.mindMapService.clusters.find(c => c.id === clusterId);

      for (let c of this.mindMapService.clusters) {
        if (c.childNodeIds?.includes(node.id) && c.id !== clusterId) {
          c.childNodeIds = c.childNodeIds.filter(cnid => cnid !== node.id);
        } else if (c.childNodeIds?.includes(node.id) && c.id === clusterId) {
          console.log("node is already in this cluster. return");
          return;
        }
      }

      // Add the dropped node to the new cluster
      cluster?.childNodeIds?.push(node.id);

      // Update the graph
      this.mindMapService.clusters = [...this.mindMapService.clusters];
      this.graphEl.update()
    } else if (nodeEl) {

      // If there's no cluster under the cursor 
      // Check if there's a node element (rect or circle) under the cursor 
      // that is NOT the dropped node
      // if yes, get the node id
      const sndNodeId = nodeEl.id.replace("node-el-", "");

      // if the dropped node was in a different cluster before, remove it from that cluster
      for (let c of this.mindMapService.clusters) {
        if (c.childNodeIds?.includes(node.id)) {
          c.childNodeIds = c.childNodeIds.filter(cnid => cnid !== node.id);
        }
      }

      // Create a new cluster from the two nodes that have been dropped onto another
      const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 3);
      var childNodes: string[] = [];
      childNodes.push(node.id);
      childNodes.push(sndNodeId);
      const newCluster: ClusterNode = {
        id: id,
        label: 'Cluster ' + id,
        childNodeIds: childNodes,
        data: {
          customColor: this.mindMapService.nodeColor
        }

      }

      // Push the new cluster and update the graph 
      this.mindMapService.clusters.push(newCluster);
      this.mindMapService.clusters = [...this.mindMapService.clusters];
      this.graphEl.update();
    } else {
      for (let c of this.mindMapService.clusters) {
        if (c.childNodeIds?.includes(node.id)) {
          c.childNodeIds = c.childNodeIds.filter(cnid => cnid !== node.id);
        }
      }
      this.mindMapService.clusters = [...this.mindMapService.clusters];
      this.graphEl.update();

    }


  }

  /**
   * Save the mind map as JSON file
   */
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
        alert("Couldn't load MindMap config")

      }
    }
    fileReader.onerror = (error) => {
      console.log(error);
    }
  }

  /**
   * Position the specific mat-menu context menu element at the previously set cursor position.
   * 
   */
  // CAUTION: Be prepared to have to fix this at some point. This does seem like a very hacky solution!
  openContextMenuAtMousePosition() {
    setTimeout(() => {
      const menuCollection = document.getElementsByClassName("cdk-overlay-connected-position-bounding-box") as HTMLCollectionOf<HTMLElement>;
      const menu: HTMLElement = menuCollection[0];
      menu.style.position = "absolute";
      menu.style.left = this.menuTopLeftPosition.x;
      menu.style.top = this.menuTopLeftPosition.y;

      // console.log(menu);

    }, 0);
  }


  getLinkStyle() {
    return {
      "fill": "var(--text-color)",
      "font-size": "inherit"
    }
  }
  styleVizStateNodeCircle(node: Node) {
    var styleString = (node.dimension!.width / 2).toString() + "px" + " " + (node.dimension!.height / 2).toString() + "px"
    const styles = { "translate": styleString }
    return styles;
  }
}



