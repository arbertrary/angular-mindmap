import { Edge, Node, ClusterNode, NodePosition } from '@swimlane/ngx-graph';

export const demoNodes: Node[] = [
    {
        id: "jwdh",
        label: "Demo main node",
        dimension: {
            width: 200,
            height: 100
        },
        data: {
            level: "medium",
            customColor: "#fff000",
            color: "#a8385d"
        },
    },
    {
        id: "nzit",
        label: "demo linked node",
        dimension: {
            width: 100,
            height: 100
        },
        data: {
            level: "basic",
            customColor: "#D3D3D3",
            color: "#a27ea8",
            stroke: "none"
        },
    },
    {
        id: "eifm",
        label: "demo basic node",
        dimension: {
            width: 100,
            height: 100
        },
        data: {
            level: "basic",
            customColor: "#D3D3D3",
            color: "#7aa3e5",
            stroke: "none"
        },
    }
]
export const demoLinks: Edge[] = [
    {
        id: "jwdh969881",
        source: "jwdh",
        target: "nzit",
        label: "demo link"
    }
]

export const demoClusters: ClusterNode[] = [
    {
        id: "tni",
        label: "Demo Cluster",
        childNodeIds: [
            "nzit",
            "eifm"
        ],

        data: {
            color: " #aae3f5"
        },
    }
]
