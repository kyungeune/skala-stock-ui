<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import apiCall from '@/scripts/api-call'
import { notifyInfo } from '@/scripts/store-popups'

/*
 주식 추가 입력값
*/
const stockName = ref('')
const stockPrice = ref('')

/*
 주식 목록 테이블 상태
 - headers : 컬럼 정의
 - items   : 실제 주식 데이터
*/
const table = reactive({
  headers: [
    { label: '주식ID', value: 'id' },
    { label: '주식명', value: 'stockName' },
    { label: '주식가격', value: 'stockPrice' },
  ],
  items: [],
})

/*
 페이지네이션 상태
 total   : 전체 데이터 개수
 current : 현재 페이지 (UI 기준 1부터)
 count   : 페이지당 표시 개수
*/
const page = reactive({
  total: 0,
  current: 1,
  count: 10,
})

/*
 부모(StockMain)에게 "선택된 주식ID" 전달하기 위한 emit
 → PlayerStocks에서 자동으로 구매 입력칸 채우는 데 사용
*/
const emit = defineEmits(['selectStock'])

/*
 테이블 행 클릭 시 실행
 → 선택된 주식ID를 부모로 전달
*/
const onRowSelected = (item) => {
  emit('selectStock', item.id)
}

/*
 (현재 템플릿에서는 사용 안함 - 위 함수와 동일)
*/
const selectStock = (row) => {
  emit('selectStock', row.id)
}

/*
 주식 목록 조회
*/
const getStockList = async () => {
  /*
   서버가 offset 방식 페이지라서
   UI 페이지(1,2,3...) → 서버(0,1,2...)로 변환
  */
  const queryParams = {
    count: page.count,
    offset: page.current - 1,
  }

  // GET /api/stocks/list
  const data = await apiCall.get('/api/stocks/list', null, queryParams)

  if (data.result === apiCall.Response.SUCCESS) {
    const body = data.body ?? {}

    /*
     서버 응답 구조가 list 또는 items일 수 있으므로 방어 처리
    */
    const list = body.list ?? body.items ?? []
    table.items = Array.isArray(list) ? list : []

    /*
     전체 개수 설정 (페이지 버튼 계산용)
    */
    if (typeof body.total === 'number') {
      page.total = body.total
    } else if (typeof body.totalCount === 'number') {
      page.total = body.totalCount
    }

    /*
     서버 offset 값을 current로 덮어쓰면 watch 무한루프 가능 → 일부러 사용 안함
    */
    // if (typeof body.offset === 'number') page.current = body.offset + 1
  } else {
    notifyInfo(data.message || '주식 목록 조회 실패')
  }
}

/*
 주식 추가
*/
const addStock = async () => {
  const payload = {
    stockName: stockName.value,
    stockPrice: Number(stockPrice.value), // 숫자로 변환
  }

  // POST /api/stocks
  const data = await apiCall.post('/api/stocks', null, payload)

  if (data.result === apiCall.Response.SUCCESS) {
    // 입력값 초기화
    stockName.value = ''
    stockPrice.value = ''

    // 1페이지로 이동 후 목록 새로고침
    page.current = 1
    await getStockList()
  } else {
    notifyInfo(data.message || '주식 추가 실패')
  }
}

/*
 페이지 번호 변경 시 자동 조회
*/
watch(() => page.current, () => {
  getStockList()
})

/*
 페이지당 개수 변경 시
 → 1페이지로 이동 후 조회
*/
watch(() => page.count, async (val) => {
  // 잘못된 값 방지
  if (!val || val < 1) {
    page.count = 10
    return
  }

  page.current = 1
  await getStockList()
})

/*
 컴포넌트 최초 렌더링 시 주식 목록 자동 조회
*/
onMounted(getStockList)
</script>


<template>
  <!-- 제목 -->
  <div class="row mt-2">
    <span class="fs-4">
      <i class="bi bi-graph-up m-2"></i>주식목록
    </span>
  </div>

  <!-- 목록 새로고침 버튼 -->
  <div class="row border-bottom">
    <div class="col d-flex justify-content-end">
      <button class="btn btn-sm btn-primary m-1" @click="getStockList">
        <i class="bi bi-arrow-counterclockwise m-2"></i>갱신
      </button>
    </div>
  </div>

  <!-- 주식 테이블 + 페이지네이터 -->
  <div class="row g-2 align-items-center m-2 mt-0">
    <div class="col">
      <!-- 행 클릭 시 onRowSelected → emit(selectStock, id) -->
      <ItemsTable
        :nosetting="true"
        :headers="table.headers"
        :items="table.items"
        @rowSelected="onRowSelected"
      />

      <!-- 페이지네이션 -->
      <PageNavigator
        v-model:current="page.current"
        v-model:count="page.count"
        :totalCount="page.total"
      />
    </div>
  </div>

  <!-- 주식 추가 영역 -->
  <div class="row g-2 m-2 border-top">
    <div class="col-2 d-flex justify-content-end">
      <label class="col-form-label form-control-sm p-1">주식정보</label>
    </div>

    <!-- 주식명 입력 -->
    <div class="col">
      <InlineInput v-model="stockName" placeholder="주식명" />
    </div>

    <!-- 주식가격 입력 -->
    <div class="col">
      <InlineInput v-model="stockPrice" placeholder="주식가격" />
    </div>

    <!-- 주식 추가 버튼 -->
    <div class="col d-flex justify-content-start">
      <button class="btn btn-sm btn-outline-primary me-2" @click="addStock">
        주식 추가
      </button>
    </div>
  </div>
</template>
