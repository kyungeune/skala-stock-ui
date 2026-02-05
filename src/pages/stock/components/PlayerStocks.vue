<script setup>

</script>

<template>
  <div class="row mt-2">
    <span class="fs-4"><i class="bi bi-person m-2"></i>{{ }} 플레이어</span>
  </div>
  <div class="row border-bottom">
    <div class="col d-flex justify-content-end">
      <button class="btn btn-sm btn-primary m-1">
        <i class="bi bi-arrow-counterclockwise m-2"></i>갱신
      </button>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <InlineInput class="m-2" label="플레이어ID" :disabled="true" />
      <InlineInput class="m-2" label="보유금액" :disabled="true" />
    </div>
  </div>
  <div class="row g-2 align-items-center m-2 mt-0">
    <div class="col-2 d-flex justify-content-end">
      <label class="col-form-label form-control-sm p-1">보유주식목록</label>
    </div>
    <div class="col">
      <ItemsTable :nosetting="true" />
    </div>
  </div>
  <div class="row g-2 align-items-center m-2 mt-0">
    <div class="col-2 d-flex justify-content-end">
      <label class="col-form-label form-control-sm p-1">주식선택</label>
    </div>
    <div class="col">
      <InlineInput placeholder="주식ID" />
    </div>
    <div class="col">
      <InlineInput placeholder="주식수량" />
    </div>
    <div class="col d-flex justify-content-start">
      <button class="btn btn-sm btn-outline-primary m-1">주식 구매</button>
      <button class="btn btn-sm btn-outline-primary m-1">주식 판매</button>
    </div>
  </div>
</template>
