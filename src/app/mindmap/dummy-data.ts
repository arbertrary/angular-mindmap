import { Edge, Node, ClusterNode, NodePosition } from '@swimlane/ngx-graph';

export const links: Edge[] = [
    {
        id: 'a',
        source: 'first',
        target: 'second',
        label: 'is parent of'
    }, {
        id: 'b',
        source: 'first',
        target: 'c1',
        label: 'custom label'
    }, {
        id: 'd',
        source: 'first',
        target: 'c2',
        label: 'custom label'
    }, {
        id: 'e',
        source: 'c1',
        target: 'd',
        label: 'first link'
    }, {
        id: 'f',
        source: 'c1',
        target: 'd',
        label: 'second link'
    }
]
export const nodes: Node[] = [
    {
        id: 'first',
        label: 'A',
        // TODO: For some reason the nodes get wider when graph is updated
        // Try this here just for testing
        dimension: {
            width: 100,
            height: 100
        }
    }, {
        id: 'second',
        label: 'B'
    }, {
        id: 'c1',
        label: 'C1'
    }, {
        id: 'c2',
        label: 'C2'
    }, {
        id: 'd',
        label: 'D'
    }
]
export const clusters: ClusterNode[] = [
    {
        id: 'third',
        label: 'Cluster node',
        childNodeIds: ['d', 'second']
    }
]