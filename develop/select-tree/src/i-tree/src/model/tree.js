import Node from './node'

export default (function () {
    let instance

    return function () {
        if (!instance) {
            instance = new Tree()
        }
        return instance
    }
})()

class Tree {
    constructor () {
        this._cache = {}
        this._checkedCache = {}
    }

    /**
     * 分类型分级缓存节点
     * @param {String} type
     * @param {Node} node
     */
    _cacheNode (type, node) {
        switch (type) {
            case 'tree':
                (this._cache[node.level + '']
                || (this._cache[node.level + ''] = [])).push(node)
                node._cacheIds['tree'] =
                    `${node.level}_${this._cache[node.level + ''].length - 1}`
                break
            case 'checked':
                !this._checkedCache[node.level + ''] && (this._checkedCache[node.level + ''] = new Set())
                let set = this._checkedCache[node.level + '']
                if (set.has(node)) {
                    return false
                } else {
                    set.add(node)
                }
                break
            default:
                break
        }
    }

    _deleteNodeCache (type, node) {
        switch (type) {
            case 'checked':
                let deleteResult = this._checkedCache[node.level + ''].delete(node)
                // console.log('删除结果', deleteResult, this._checkedCache)
                break
            default:
                break
        }
    }

    _getNodeFromCache (type, id) {

    }

    clearTree () {
        // this._cache['1'].forEach(node => {
        //     this.uncheckNode(node)
        // })

        let checkedNodes = []

        for (let key in this._checkedCache) {
            checkedNodes = checkedNodes.concat(Array.from(this._checkedCache[key]))
        }

        checkedNodes.forEach(node => {
            this.uncheckNode(node)
            this._deleteNodeCache('checked', node)
        })
    }

    /**
     * 勾选父节点底下所有的子节点
     * @param {Node} parentNode
     */
    checkNode (parentNode, newV = true) {
        parentNode._checked = newV
        parentNode._hasChildChecked = newV
        this._cacheNode('checked', parentNode)

        let childNodes = parentNode.childNodes

        childNodes.length
        && traverseBreadth.call(this, childNodes, (node, nextArr) => {
            let hasChecked = node._checked

            node._checked = newV
            node._hasChildChecked = newV
            this._cacheNode('checked', node)

            if (node['childNodes'] && (newV && !hasChecked)) {
                // 如果节点已经展开，则优先遍历
                if (node._expanded) {
                    nextArr.unshift(...node['childNodes'])
                } else {
                    nextArr.push(...node['childNodes'])
                }
            }
        })

        parentNode.parentNode
        && checkParentNodes.call(this, parentNode)

        function traverseBreadth (arr, fn) {
            let nextArr = []

            for (let i = 0; i < arr.length; i++) {
                fn && fn.call(null, arr[i], nextArr)
            }

            nextArr.length && traverseBreadth.call(this, nextArr, fn)
        }


        /**
         * 检查并更改父级节点状态
         * @param {Node} node 父级节点
         */
        function checkParentNodes (node) {
            let parentNode = node.parentNode

            parentNode._hasChildChecked = true
            if (node._checked) {
                parentNode._checked = parentNode.childNodes.every(childNode => {
                    return childNode._checked
                })
            }

            if (parentNode._checked) {
                this._cacheNode('checked', parentNode)
            }

            if (parentNode.parentNode) {
                checkParentNodes.call(this, parentNode)
            }
        }
    }

    /**
     * 取消选中的算法
     * 从当前节点向上遍历
     * 若节点为勾选状态，则取消勾选
     * 若未勾选则停止遍历
     * 若为勾选状态，则遍历节点的子节点，
     * 将其他勾选的节点缓存
     */
    uncheckNode (node) {
        if (node._checked === true) {
            node._checked = false
            this._deleteNodeCache('checked', node)
        }

        let hasChildChecked = false
        let allChildChecked = true
        node.childNodes.length && node.childNodes.forEach(node => {
            if (node._checked === false) {
                allChildChecked = false
            } else if (node._checked === true) {
                hasChildChecked = true
            }
        })

        if (allChildChecked) {
            node._hasChildChecked = false
            uncheckChildNodes.call(this, node)
        } else {
            node._hasChildChecked = hasChildChecked
        }

        if (node.parentNode
            && (node.parentNode._checked || node.parentNode._hasChildChecked)) {
            this.uncheckNode(node.parentNode)
        }

        function traverseBreadth (arr, fn) {
            let nextArr = []

            for (let i = 0; i < arr.length; i++) {
                fn && fn.call(null, arr[i], nextArr)
            }

            nextArr.length && traverseBreadth.call(this, nextArr, fn)
        }

        function uncheckChildNodes (node) {
            node._hasChildChecked = false

            node.childNodes.length
            && traverseBreadth.call(this, node.childNodes, (node, nextArr) => {
                node._checked = false
                node._hasChildChecked = false
                this._deleteNodeCache('checked', node)

                if (node['childNodes']) {
                    // 如果节点已经展开，则优先遍历
                    if (node._expanded) {
                        nextArr.unshift(...node['childNodes'])
                    } else {
                        nextArr.push(...node['childNodes'])
                    }
                }
            })
        }
    }

    createNode (data, parentNode, dict) {
        const node = new Node(data, parentNode, dict)
        if (data[dict['childNodes']]) {
            node.childNodes = this.createNodes(data[dict['childNodes']], node, dict)
        }

        // 创建节点的同时缓存
        this._cacheNode('tree', node)
        return node
    }

    createNodes (data, parentNode, dict) {
        // 处理字典项
        dict = dict || {}
        !dict['childNodes'] && (dict['childNodes'] = 'childNodes')
        !dict['id'] && (dict['id'] = 'id')
        !dict['label'] && (dict['label'] = 'label')

        return data.map(v => {
            return this.createNode(v, parentNode, dict)
        })
    }
}
