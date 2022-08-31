import { Edge, Node, ClusterNode } from '@swimlane/ngx-graph';

export type MindMap = {
    nodes: Node[];
    links: Edge[];
    clusters?: ClusterNode[];
    notes?: MindMapNote[];
    orientation?: string;
    curve?: string;
}

export type MindMapNote = {
    date: string;
    note: string
}

/**
 * The NodeHierarchy defines the visual importance of the nodes on the canvas
 */
export enum NodeHierarchy {
    Basic = "basic", // Every node initially is a basic node
    Medium = "medium",
    High = "high"
}