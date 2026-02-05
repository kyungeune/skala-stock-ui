<script setup>
import { ref } from 'vue'
import PlayerStocks from "./components/PlayerStocks.vue"
import StockList from "./components/StockList.vue"

// ✅ StockList에서 클릭된 주식ID를 들고 있을 상태
const selectedStockId = ref('')
</script>

<template>
  <div class="container-fluid">
    <div class="row bg-body-tertiary">
      <div class="col">
        <span class="ps-2 fs-2">SKALA STOCK Market</span>
      </div>
    </div>

    <div class="row">
      <div class="col border m-1">
        <!-- ✅ StockList가 선택 이벤트를 emit -->
        <StockList @selectStock="(id) => (selectedStockId = String(id))" />
      </div>

      <div class="col border m-1">
        <!-- ✅ PlayerStocks에 선택된 주식ID 전달 -->
        <PlayerStocks :selected-stock-id="selectedStockId" />
      </div>
    </div>
  </div>
</template>
