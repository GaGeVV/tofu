<template>
    <div class="tofu-tree">
        <node
            v-for="(node, index) in nodes"
            :key="`${node.id}-${node.level}-${index}`"
            :node="node"
            :TreeModel="TreeModel"
            :showCounter="showCounter"
            :watch="watch"
            @check="emitCheck"
            @expandOrCollapse="$emit('expandOrCollapse')"
        ></node>
    </div>
</template>

<script>
    import getTreeInstance from './model/tree'
    import Node from './node'
    import Bus from './Bus'

    export default {
        name: 'tofu-tree',

        components: {
            Node
        },

        props: {
            value: Array,
            data: Array,
            dict: Object,
            showCounter: {
                type: Boolean,
                default: false
            },
            checkChildren: {
                type: Boolean,
                default: true
            },
            singleton: {
                type: Boolean,
                default: false
            },
            checkedNodes: Array,
            multiple: {
                type: Boolean,
                default: true
            },
            inDropdown: Boolean,
            watch: Array
        },

        data () {
            return {
                TreeModel: {},
                nodes: []
            }
        },

        watch: {
            data(newData) {
                if (newData) this.createTree()
            }
        },

        methods: {
            emitCheck (onInit = false) {
                this.$emit('change', this.getAllCheckedNodes(), onInit)
            },

            getAllCheckedNodes() {
                let checkedNodes = []
                for (let key of Object.keys(this.TreeModel._checkedCache)) {
                    this.TreeModel._checkedCache[key].forEach(node => {
                        checkedNodes.push(node)
                    })
                }
                return checkedNodes;
            },

            clean() {
                this.clear()
            },

            clear () {
                this.TreeModel.clearTree()
            },

            selectAll() {
                this.checkAll()
            },

            checkAll () {
                return this.TreeModel.checkAll()
            },

            checkNodeByID(id) {
                this.TreeModel.checkNodeByID(id)
            },
            uncheckNodeByID(id) {
                this.TreeModel.uncheckNodeByID(id)
            },

            createTree() {
                this.TreeModel = getTreeInstance(this.singleton, {
                    checkChildren: this.checkChildren,
                    checkedNodes: this.checkedNodes,
                    multiple: this.multiple
                })

                if (this.data) {
                    this.nodes = this.TreeModel.createNodes(this.data, null, this.dict)
                }
                if (this.inDropdown) {
                    this.emitCheck(true);
                }
            }
        },

        created () {
            // 获取新的树
            this.createTree()
        },

        mounted() {
            Bus.$on('update', (id, newV) => {
                this.$emit('update', id, newV)
            })
        }
    }
</script>