<script setup>

</script>

<template>
  <div class="container-sm mt-3 border border-2 p-1" style="max-width: 600px">
    <div class="bss-background p-1">
      <div class="mt-3 d-flex justify-content-center" style="height: 230px;">
        <span class="text-center text-danger fs-1 fw-bold mt-4">SKALA STOCK Market</span>
      </div>
      <div class="row bg-info-subtle p-2 m-1" style="opacity: 95%;">
        <div class="col">
          <InlineInput label="플레이어ID" class="mb-1" type="text" placeholder="플레이어ID" />
          <InlineInput label="비밀번호" class="mb-1" type="password" placeholder="비밀번호" />
        </div>
        <div class="d-flex justify-content-end">
          <button class="btn btn-primary btn-sm">회원가입</button>
          <button class="btn btn-primary btn-sm">로그인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bss-background {
  width: 590px;
  height: 380px;
  background-image: url('/logo.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
