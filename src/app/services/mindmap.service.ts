import { Injectable } from '@angular/core';
import { Layout, Edge, Node, ClusterNode } from '@swimlane/ngx-graph';


@Injectable({
  providedIn: 'root'
})
export class MindmapService {

  constructor() { }

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
