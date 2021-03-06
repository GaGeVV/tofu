<template>
    <div class="menu-item">
        <div
            class="menu-item-main"
            :class="{'menu-item-active': activeMenu === menu}"
            :style="{'padding-left': paddingLeft}"
            @click.stop="activate">
            <i class="menu-item-icon" v-if="menu.iconClass || menu.imgSrc">
                <v-icon :iconClass="menu.iconClass" :imgSrc="menu.imgSrc" :size="16"/>
            </i>
            <span class="menu-item-icon" v-else-if="menu._deep === 0"><slot></slot></span>
            <span class="menu-item-label">{{ menu.label }}</span>
            <span class="menu-item-sign"></span>
        </div>
        <menu-item
            @menuItem_activate="emitSubActivate"
            class="menu-item-child"
            v-for="menu in menu.children"
            :menu="menu"
            :activeMenu="activeMenu"
            :useRouter="useRouter"
            v-show="childrenVisibility">
        </menu-item>
    </div>
</template>

<script>
import VIcon from '../../tofu-icon'

export default {
    name:'menu-item',

    components: {
        VIcon
    },

    props:{
        useRouter: {
            default: false
        },
        menu: {
            required: true,
        },
        activeMenu: {
            required: true
        }
    },

    data () {
        return {
            childrenVisibility: false,
            visible: this.menu._visible
        }
    },

    computed: {
        paddingLeft () {
            return this.menu._deep * 32 + 24 + 'px' // TODO 有两个未知问题？
        }
    },

    methods: {
        activate () {
            if (this.menu.children) {
                this.childrenVisibility = !this.childrenVisibility;
            } else {
                // 如果使用 vue-router，则 push 路径
                // 否则就执行指定的函数
                if (this.useRouter) {
                    this.$router.push(this.menu.path)
                }
                // else {}

                // 触发事件
                this.$emit('menuItem_activate', this.menu)
            }
        },

        emitSubActivate (menu) {
            this.$emit('menuItem_activate', menu)
        },

        checkVisibility (v) {
            let parents = []
            const extractParents = (v) => {
                if (v._parent) {
                    parents.push(v._parent._id)
                    if (v._parent._parent) {
                        extractParents(v._parent)
                    }
                }
            }

            extractParents(v);

            return parents.indexOf(this.menu._id) !== -1
        }
    },

    created () {
        // 如果是父菜单，自动切换子菜单的可见性
        if (this.useRouter && this.menu.children) {
            this.$watch('activeMenu', (newV) => {
                if (newV) {
                    this.childrenVisibility = this.checkVisibility(newV)
                } else {
                    this.childrenVisibility = false
                }
            })

            // 初始化时
            if (this.activeMenu && this.checkVisibility(this.activeMenu)) {
                this.childrenVisibility = true
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.menu-item {
    box-sizing: border-box;
    width: 100%;

    position: relative;

    .menu-item-main {
        position: relative;

        box-sizing: border-box;
        width: 100%;
        height: 36px;
        padding: 0 20px;
        line-height: 36px;

        margin: 4px 0;

        color: #A3ACBA;
        font-size: 14px;
        font-weight: bold;

        cursor: pointer;

        transition: all .4s ease-in-out;

        &:hover, &.menu-item-active {
            color: #fff;
        }
        &:hover {
            background: #313D4F;

            .menu-item-sign {
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);

                width: 2px;
                height: 36px;

                opacity: 1;
                background: #20A0FF;
            }
        }
        &.menu-item-active .menu-item-icon {
            color: #1990EA;
        }

        .menu-item-label {
            padding-left: 6px;
            vertical-align: top;
        }

        .menu-item-icon {
            display: inline-block;

            box-sizing: border-box;
            width: 28px;
            height: 36px;
            line-height: 36px;

            color: #A3ACBA;
            text-align: center;
        }

        .menu-item-sign {
            position: absolute;
            left: 0;
            top: 0;

            width: 2px;
            height: 0px;

            opacity: 0;

            transition: all .4s ease-in-out;
        }
    }

    .menu-item-child .menu-item-main {
        font-family: PingFang-SC-Regular;
        font-size: 12px;
        font-weight: normal;

        background: transparent;

        &:hover, &.menu-item-active {
            color: #fff;

            background-origin: content-box;
            background-color: #313D4F;

            .menu-item-sign {
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);

                width: 2px;
                height: 36px;

                opacity: 1;
                background: #20A0FF;
            }
        }
    }
}
</style>
