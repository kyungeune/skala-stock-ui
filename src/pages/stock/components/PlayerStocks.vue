<script setup>
import { ref, reactive, onMounted } from 'vue'
import apiCall from '@/scripts/api-call'
import { notifyInfo } from '@/scripts/store-popups'
import { usePlayer } from '@/scripts/store-player'

const stockId = ref('')
const stockQuantity = ref('')
const playerMoney = ref('')

const table = reactive({
  headers: [
    { label: '주식ID', value: 'stockId' },
    { label: '주식명', value: 'stockName' },
    { label: '주식가격', value: 'stockPrice' },
    { label: '보유수량', value: 'quantity' },
  ],
  items: [],
})

const player = usePlayer()

const getPlayerInfo = async () => {
  const pid = player.playerId
  if (!pid) {
    notifyInfo('로그인 정보가 없습니다. 다시 로그인 해주세요.')
    return
  }

  const data = await apiCall.get(`/api/players/${pid}`, null, null)

  if (data.result === apiCall.Response.SUCCESS) {
    const body = data.body ?? {}
    playerMoney.value = String(body.playerMoney ?? body.playerMoney ?? '')
    table.items = body.items ?? body.stocks ?? []
  } else {
    notifyInfo(data.message || '플레이어 정보 조회 실패')
  }
}

const buyPlayerStock = async () => {
  const payload = {
    playerId: player.playerId,
    stockId: Number(stockId.value),
    stockQuantity: Number(stockQuantity.value),
  }

  const data = await apiCall.post('/api/players/buy', null, payload)

  if (data.result === apiCall.Response.SUCCESS) {
    stockId.value = ''
    stockQuantity.value = ''
    await getPlayerInfo()
  } else {
    notifyInfo(data.message || '주식 구매 실패')
  }
}

const sellPlayerStock = async () => {
  const payload = {
    playerId: player.playerId,
    stockId: Number(stockId.value),
    stockQuantity: Number(stockQuantity.value),
  }

  const data = await apiCall.post('/api/players/sell', null, payload)

  if (data.result === apiCall.Response.SUCCESS) {
    stockId.value = ''
    stockQuantity.value = ''
    await getPlayerInfo()
  } else {
    notifyInfo(data.message || '주식 판매 실패')
  }
}

onMounted(getPlayerInfo)
</script>

<template>
  <div class="row mt-2">
    <span class="fs-4"><i class="bi bi-person m-2"></i>{{ player.playerId }} 플레이어</span>
  </div>

  <div class="row border-bottom">
    <div class="col d-flex justify-content-end">
      <button class="btn btn-sm btn-primary m-1" @click="getPlayerInfo">
        <i class="bi bi-arrow-counterclockwise m-2"></i>갱신
      </button>
    </div>
  </div>

  <div class="row">
    <div class="col">
      <InlineInput class="m-2" label="플레이어ID" :disabled="true" :modelValue="player.playerId" />
      <InlineInput class="m-2" label="보유금액" :disabled="true" v-model="playerMoney" />
    </div>
  </div>

  <div class="row g-2 align-items-center m-2 mt-0">
    <div class="col-2 d-flex justify-content-end">
      <label class="col-form-label form-control-sm p-1">보유주식목록</label>
    </div>
    <div class="col">
      <ItemsTable :nosetting="true" :headers="table.headers" :items="table.items" />
    </div>
  </div>

  <div class="row g-2 align-items-center m-2 mt-0">
    <div class="col-2 d-flex justify-content-end">
      <label class="col-form-label form-control-sm p-1">주식선택</label>
    </div>
    <div class="col">
      <InlineInput v-model="stockId" placeholder="주식ID" />
    </div>
    <div class="col">
      <InlineInput v-model="stockQuantity" placeholder="주식수량" />
    </div>
    <div class="col d-flex justify-content-start">
      <button class="btn btn-sm btn-outline-primary m-1" @click="buyPlayerStock">주식 구매</button>
      <button class="btn btn-sm btn-outline-primary m-1" @click="sellPlayerStock">주식 판매</button>
    </div>
  </div>
</template>
