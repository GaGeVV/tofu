import Message from './message'
import MessageBox from './message-box'

class Room {
    /**
     * @param {String} name 
     * @param {Number} id 
     * @param {Center} center 
     */
    constructor (name, id, center) {
        this.name = name
        this.$center = center
        this._mapMessageToMember = new Map() // 嵌套 Map
        this._members = new Map()
        this._messageBox = new MessageBox() // 用于存储发送的消息
    }

    get members () {
        return this._members
    }

    addMember (member) {
        this._members.push(member)
    }

    /**
     * 发送消息
     * @param {Member} member  发送者
     * @param {String} msg 
     * @param {String} id 接收者id
     * @param {Any} attach 
     */
    send (member, msg, id = null, ...attach) { // TODO 需要验证房间内是否有这个成员
        let message = new Message(msg, sender, attach) // 是否应该对传送的 attach 做检查，或转换成JSON ？TODO

        let mapM2M = this._mapMessageToMember
        let receivedMembers

        if (mapM2M.has(msg)) {
            let _mapM2F = mapM2M.get(msg)

            if (id) {
                _mapM2F.get(id).apply(null, msg, ...attach) // 已经绑定过上下文
                receivedMembers = [this._members.get(id)]
            } else {
                for (let fn of _mapM2F.values()) {
                    fn.apply(null, msg, ...attach) // 已经绑定过上下文
                }
                receivedMembers = _mapM2F.keys().map(id => {
                    return this._members.get(id)
                })
            }

            // 设置消息的接收者，并储存到 messageBox 中
            message.receivedMembers = receivedMembers
            this._messageBox.add(message)

            return receivedMembers
        } else {
            return '没有用户接收此消息'
        }
    }

    /**
     * 绑定映射
     * @param {Member} member
     * @param {String} msg
     * @param {Function} cb
     */
    hear (member, msg, cb) {
        let mapM2M = this._mapMessageToMember

        if (mapM2M.has(msg)) {
            mapM2M.get(msg).set(member.id, cb)
        } else {
            let map = new Map()
            map.set(member.id, cb)
            mapM2M.set(msg, map)
        }
    }
}