import axios from 'axios'
// import qs from 'qs'
// import router from '@/router'
// import errorcode from '@/common/error_code'
import { Message } from 'element-ui'

function getCookie(cname) {
  var name = cname + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim()
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length)
  }
  return ''
}

// axios.defaults.baseURL = process.env.VUE_APP_BASE_URL // 配置axios请求的地址

// axios全局请求拦截
axios.interceptors.request.use(
  config => {
    // 每次发送请求之前判断vuex中是否存在token
    // 如果存在，则统一在http请求的header都加上token，这样后台根据token判断你的登录情况
    // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
    const csrf = getCookie('csrfToken')
    csrf && (config.headers['x-csrf-token'] = csrf)
    const token = window.localStorage.getItem(process.env.VUE_APP_TOKEN)
    token && (config.headers.Authorization = token)
    return config
  },
  error => {
    return Promise.error(error)
  }
)

axios.interceptors.response.use(
  response => {
    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
    // 否则的话抛出错误
    if (response.status === 200) {
      return Promise.resolve(response.data)
    } else {
      return Promise.reject(response)
    }
  },
  // 服务器状态码不是2开头的的情况
  // 这里可以跟你们的后台开发人员协商好统一的错误状态码
  // 然后根据返回的状态码进行一些操作，例如登录过期提示，错误提示等等
  // 下面列举几个常见的操作，其他需求可自行扩展
  error => {
    if (error.response && error.response.status) {
      switch (error.response.status) {
        // 401: 未登录
        // 未登录则跳转登录页面，并携带当前页面的路径
        // 在登录成功后返回当前页面，这一步需要在登录页操作。
        case 401:
          Message({
            showClose: true,
            message: error.message,
            type: 'error',
          })
          break

        // 403 token过期
        // 登录过期对用户进行提示
        // 清除本地token和清空vuex中token对象
        // 跳转登录页面
        case 403:
          Message({
            showClose: true,
            message: error.message,
            type: 'error',
          })
          break

        // 404请求不存在
        case 404:
          Message({
            showClose: true,
            message: error.message,
            type: 'error',
          })
          break

        // 其他错误，直接抛出错误提示
        default:
          Message({
            showClose: true,
            message: error.message,
            type: 'error',
          })
      }
      return Promise.reject(error.response)
    } else {
      Message({
        showClose: true,
        message: error.message,
        type: 'error',
      })
      return Promise.reject(error)
    }
  }
)

export default axios
