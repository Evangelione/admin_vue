<template>
  <el-cascader
    :options="options"
    :show-all-levels="showAllLevels"
    :props="props"
    :value="value"
    @change="handleChange"
  ></el-cascader>
</template>

<script>
import common from '@/api/common'

export default {
  name: 'DistrictPicker',

  mixins: [],

  components: {},

  props: {
    level: {
      type: Number,
      default: 2,
    },
    showAllLevels: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      options: [],
      value: [],
      props: {
        label: 'name',
        value: 'id',
        lazy: true,
        lazyLoad: (node, resolve) => {
          const { level, value } = node
          if (!this.options.length) {
            resolve()
            return
          }
          common.getDistrictList(value).then(res => {
            if (level === this.level) {
              resolve(
                res.data.map(item => {
                  item.leaf = true
                  return item
                })
              )
              return
            }
            resolve(res.data)
          })
        },
      },
    }
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {
    const { id } = this.$route.params
    !id &&
      common.getDistrictList().then(res => {
        this.options = res.data
      })
  },

  destroyed() {},

  methods: {
    handleChange(value) {
      this.$emit('change', value)
    },
    getDefault(arr) {
      this.value = arr
      common.getDistrictList().then(province => {
        const p = province.data
        if (arr[0]) {
          const pIndex = p.findIndex(item => item.id === arr[0])
          common.getDistrictList(arr[0]).then(city => {
            const c = city.data
            p[pIndex].children = c
            if (arr[1]) {
              const cIndex = c.findIndex(item => item.id === arr[1])
              common.getDistrictList(arr[1]).then(area => {
                c[cIndex].children = area.data.map(item => {
                  item.leaf = true
                  return item
                })
                this.options = p
              })
            }
          })
        } else {
          this.options = p
        }
      })
    },
  },
}
</script>

<style lang="less" scoped></style>
