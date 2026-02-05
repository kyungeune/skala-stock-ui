import { createRouter, createWebHistory } from 'vue-router';
import StartMain from '@/pages/start/StartMain.vue'
import StockMain from '@/pages/stock/StockMain.vue'
import WrongRoutingPage from './components/WrongRoutingPage.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: '/',
            component: StartMain
        },
        {
            path: '/start',
            name: '/start',
            component: StartMain
        },
        {
            path: '/stock',
            name: '/stock',
            component: StockMain,
            children: [],
        },
        {
            path: '/wrong',
            name: '/wrong',
            component: WrongRoutingPage,
        },
        {
            path: "/:pathMatch(.*)*",
            redirect: "/wrong",
        }
    ]
})

// ✅ 전역 가드: /stock 접근 시 로그인 여부 체크
router.beforeEach((to) => {
  const isLoggedIn = !!sessionStorage.getItem('skala-stock-ui')

  if (to.path === '/stock' && !isLoggedIn) {
    return '/start'
  }
})

export default router