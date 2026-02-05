<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import apiCall from '@/scripts/api-call'
import { notifyInfo } from '@/scripts/store-popups'

const stockName = ref('')
const stockPrice = ref('')

const table = reactive({
  headers: [
    { label: '주식ID', value: 'id' },
    { label: '주식명', value: 'stockName' },
    { label: '주식가격', value: 'stockPrice' },
  ],
  items: [],
})

const page = reactive({
  total: 0,
  current: 1, // 1부터 시작(UI)
  count: 10,
})

const emit = defineEmits(['selectStock'])

const onRowSelected = (item) => {
  // 주식 클릭 → 부모(StockMain)로 주식ID 올리기
  emit('selectStock', item.id)
}

const selectStock = (row) => {
  // row.id가 주식ID라고 가정
  emit('selectStock', row.id)
}


const getStockList = async () => {
  const queryParams = {
    count: page.count,          // ✅ 사용자가 고른 페이지당 개수
    offset: page.current - 1,   // ✅ (현재 서버는 페이지 인덱스 방식)
  }

  const data = await apiCall.get('/api/stocks/list', null, queryParams)

  if (data.result === apiCall.Response.SUCCESS) {
    const body = data.body ?? {}

    // ✅ 이번 페이지 데이터(마지막이면 2~3개만 내려오면 그대로 2~3개만 보임)
    const list = body.list ?? body.items ?? []
    table.items = Array.isArray(list) ? list : []

    // ✅ 전체 개수(페이지 버튼 계산용). total이 -1 / 0 같은 케이스도 대비
    if (typeof body.total === 'number') {
      page.total = body.total
    } else if (typeof body.totalCount === 'number') {
      page.total = body.totalCount
    }

    // ✅ current는 서버 응답으로 덮어쓰지 말고(루프 방지), 사용자가 누른 값 유지
    // if (typeof body.offset === 'number') page.current = body.offset + 1

    // ✅ 마지막 페이지에서 내려온 "실제 개수"는 참고만(절대 page.count에 덮어쓰지 않음)
    // const receivedCount = typeof body.count === 'number' ? body.count : table.items.length
  } else {
    notifyInfo(data.message || '주식 목록 조회 실패')
  }
}


const addStock = async () => {
  const payload = {
    stockName: stockName.value,
    stockPrice: Number(stockPrice.value),
  }

  const data = await apiCall.post('/api/stocks', null, payload)

  if (data.result === apiCall.Response.SUCCESS) {
    stockName.value = ''
    stockPrice.value = ''

    // ✅ 추가 후에는 1페이지로 보내고 목록 새로고침(선택)
    page.current = 1
    await getStockList()
  } else {
    notifyInfo(data.message || '주식 추가 실패')
  }
}

// ✅ 페이지 번호 누르면 current 변경 → 서버에 다시 조회
watch(() => page.current, () => {
  getStockList()
})

// ✅ 페이지당 개수 변경 시 1페이지로 이동 후 다시 조회
watch(() => page.count, async (val) => {
  // ✅ 최소 1개 이상 강제 (0/null/NaN 방지)
  if (!val || val < 1) {
    page.count = 10   // 기본값으로 복구
    return
  }

  page.current = 1
  await getStockList()
})

onMounted(getStockList)
</script>



<template>
  <div class="row mt-2">
    <span class="fs-4"><i class="bi bi-graph-up m-2"></i>주식목록</span>
  </div>

  <div class="row border-bottom">
    <div class="col d-flex justify-content-end">
      <button class="btn btn-sm btn-primary m-1" @click="getStockList">
        <i class="bi bi-arrow-counterclockwise m-2"></i>갱신
      </button>
    </div>
  </div>

  <div class="row g-2 align-items-center m-2 mt-0">
    <div class="col">
      <ItemsTable :nosetting="true" :headers="table.headers" :items="table.items" @rowSelected="onRowSelected" />
      <PageNavigator v-model:current="page.current" v-model:count="page.count" :totalCount="page.total" />
    </div>
  </div>

  <div class="row g-2 m-2 border-top">
    <div class="col-2 d-flex justify-content-end">
      <label class="col-form-label form-control-sm p-1">주식정보</label>
    </div>
    <div class="col">
      <InlineInput v-model="stockName" placeholder="주식명" />
    </div>
    <div class="col">
      <InlineInput v-model="stockPrice" placeholder="주식가격" />
    </div>
    <div class="col d-flex justify-content-start">
      <button class="btn btn-sm btn-outline-primary me-2" @click="addStock">주식 추가</button>
    </div>
  </div>
</template>
