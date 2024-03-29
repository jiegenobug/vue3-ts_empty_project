import axios from 'axios'
import { GetTimeStamp } from './auth'
import router from '@/router/index'
import { storeToRefs } from 'pinia'
import { useUserStore } from "@/stores/user";

const tokenTimeOut: number = Number(import.meta.env.VITE_TOKEN_TIMEOUT)
// 创建一个axios的实例
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: Number(import.meta.env.VITE_APP_TIMEOUT)
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore();
    const user = storeToRefs(userStore); // 响应式

    if (location.pathname === '/login') { // 1.如果是登录页，免校验token
      console.log('登录页免检tk');
      config.headers['token'] = `${user.token}`

    } else if (user.token.value) { // 2.如果有token,检测token是否过期
      if (IsCheckTimeOut()) {
        userStore.logout();
        router.push('/login')
        return Promise.reject(new Error('有tk,但tk过期了'))
      }
      config.headers['token'] = `${user.token}`
    } else { // 3.如果没有token
      userStore.logout();
      router.push('/login')
      return Promise.reject(new Error('没有tk,未登录'))
    }
    return config
  }, error => {
    console.log(error);
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(response => {
  return response.data
}, error => {
  if (error && error.response && error.response.status === 401) { // 当等于401时候，表示后端告诉我们token超时了
    const userStore = useUserStore();
    userStore.logout(); // 调用退出登录，删除token
    router.push('/login')
  }
  return Promise.reject(error) // 返回执行错误 让当前的执行链跳出成功 直接进入catch
})

function IsCheckTimeOut() {
  const currentTimeStamp = Date.now();
  return (currentTimeStamp - Number(GetTimeStamp())) / 1000 > tokenTimeOut
}
export default request // 导出axios实例
