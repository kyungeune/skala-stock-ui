<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import apiCall from '@/scripts/api-call'
import { notifyInfo } from '@/scripts/store-popups'
import { usePlayer } from '@/scripts/store-player'

/*
 부모(StockMain)에서 전달되는 "선택된 주식ID"
 → 주식 목록 클릭하면 자동으로 구매 입력칸에 들어가게 하는 역할
*/
const props = defineProps({
  selectedStockId: {
    type: [String, Number],
    default: '',
  },
})

/*
 사용자가 입력하는 구매/판매 대상 주식ID
 (목록 클릭 시 자동으로 채워짐)
*/
const stockId = ref('')

/*
 구매/판매할 주식 수량
*/
const stockQuantity = ref('')

/*
 플레이어 보유 금액 (읽기 전용 표시용)
*/
const playerMoney = ref('')

/*
 플레이어가 보유한 주식 목록 테이블
*/
const table = reactive({
  headers: [
    { label: '주식ID', value: 'stockId' },
    { label: '주식명', value: 'stockName' },
    { label: '주식가격', value: 'stockPrice' },
    { label: '보유수량', value: 'quantity' },
  ],
  items: [],
})

/*
 store-player에서 현재 로그인된 플레이어 정보 가져오기
*/
const player = usePlayer()

/*
 부모에서 선택된 주식ID가 바뀌면
 → 자동으로 stockId 입력칸에 반영
*/
watch(
  () => props.selectedStockId,
  (val) => {
    if (val === null || val === undefined) return
    const next = String(val).trim()
    if (!next) return
    stockId.value = next
  },
  { immediate: true }
)

/*
 플레이어 정보 조회
 - 보유금액
 - 보유 주식 목록
*/
const getPlayerInfo = async () => {
  const pid = player.playerId

  // 로그인 정보 없으면 조회 불가
  if (!pid) {
    notifyInfo('로그인 정보가 없습니다. 다시 로그인 해주세요.')
    return
  }

  // GET /api/players/{playerId}
  const data = await apiCall.get(`/api/players/${pid}`, null, null)

  if (data.result === apiCall.Response.SUCCESS) {
    const body = data.body ?? {}

    // 보유 금액 표시
    playerMoney.value = String(body.playerMoney ?? '')

    // 보유 주식 목록 표시
    table.items = body.items ?? body.stocks ?? []
  } else {
    notifyInfo(data.message || '플레이어 정보 조회 실패')
  }
}

/*
 주식 구매
*/
const buyPlayerStock = async () => {
  const payload = {
    playerId: player.playerId,
    stockId: Number(stockId.value),
    stockQuantity: Number(stockQuantity.value),
  }

  // POST /api/players/buy
  const data = await apiCall.post('/api/players/buy', null, payload)

  if (data.result === apiCall.Response.SUCCESS) {
    // 입력칸 초기화
    stockId.value = ''
    stockQuantity.value = ''

    // 플레이어 정보 다시 조회 (잔액/보유주식 갱신)
    await getPlayerInfo()
  } else {
    notifyInfo(data.message || '주식 구매 실패')
  }
}

/*
 주식 판매
*/
const sellPlayerStock = async () => {
  const payload = {
    playerId: player.playerId,
    stockId: Number(stockId.value),
    stockQuantity: Number(stockQuantity.value),
  }

  // POST /api/players/sell
  const data = await apiCall.post('/api/players/sell', null, payload)

  if (data.result === apiCall.Response.SUCCESS) {
    // 입력칸 초기화
    stockId.value = ''
    stockQuantity.value = ''

    // 플레이어 정보 다시 조회
    await getPlayerInfo()
  } else {
    notifyInfo(data.message || '주식 판매 실패')
  }
}

/*
 컴포넌트 최초 렌더링 시
 → 플레이어 정보 자동 조회
*/
onMounted(getPlayerInfo)
</script>

<template>
  <!-- 플레이어 이름 표시 -->
  <div class="row mt-2">
    <span class="fs-4">
      <i class="bi bi-person m-2"></i>{{ player.playerId }} 플레이어
    </span>
  </div>

  <!-- 플레이어 정보 새로고침 버튼 -->
  <div class="row border-bottom">
    <div class="col d-flex justify-content-end">
      <button class="btn btn-sm btn-primary m-1" @click="getPlayerInfo">
        <i class="bi bi-arrow-counterclockwise m-2"></i>갱신
      </button>
    </div>
  </div>

  <!-- 플레이어 기본 정보 -->
  <div class="row">
    <div class="col">
      <!-- 플레이어ID (읽기 전용) -->
      <InlineInput
        class="m-2"
        label="플레이어ID"
        :disabled="true"
        :modelValue="player.playerId"
      />

      <!-- 보유금액 표시 -->
      <InlineInput
        class="m-2"
        label="보유금액"
        :disabled="true"
        v-model="playerMoney"
      />
    </div>
  </div>

  <!-- 보유 주식 목록 -->
  <div class="row g-2 align-items-center m-2 mt-0">
    <div class="col-2 d-flex justify-content-end">
      <label class="col-form-label form-control-sm p-1">보유주식목록</label>
    </div>
    <div class="col">
      <ItemsTable
        :nosetting="true"
        :headers="table.headers"
        :items="table.items"
      />
    </div>
  </div>

  <!-- 주식 구매/판매 영역 -->
  <div class="row g-2 align-items-center m-2 mt-0">
    <div class="col-2 d-flex justify-content-end">
      <label class="col-form-label form-control-sm p-1">주식선택</label>
    </div>

    <!-- 구매/판매할 주식ID -->
    <div class="col">
      <InlineInput v-model="stockId" placeholder="주식ID" />
    </div>

    <!-- 수량 -->
    <div class="col">
      <InlineInput v-model="stockQuantity" placeholder="주식수량" />
    </div>

    <!-- 구매 / 판매 버튼 -->
    <div class="col d-flex justify-content-start">
      <button class="btn btn-sm btn-outline-primary m-1" @click="buyPlayerStock">
        주식 구매
      </button>

      <button class="btn btn-sm btn-outline-primary m-1" @click="sellPlayerStock">
        주식 판매
      </button>
    </div>
  </div>
</template>
