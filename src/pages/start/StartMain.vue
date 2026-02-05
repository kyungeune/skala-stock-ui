<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiCall from '@/scripts/api-call'
import { storePlayer } from '@/scripts/store-player'
import { notifyInfo } from '@/scripts/store-popups'

const router = useRouter()

const playerId = ref('')
const playerPassword = ref('')
const isNewPlayer = ref(false)

const login = async () => {
  const payload = {
    playerId: playerId.value,
    playerPassword: playerPassword.value,
  }
  console.log('payload:', payload)

  const data = await apiCall.post('/api/players/login', null, payload)

  if (data.result === apiCall.Response.SUCCESS) {
    // 로그인 성공: 스토어 저장 + 이동
    storePlayer(payload)
    isNewPlayer.value = false
    router.push('/stock')
  } else {
    // 로그인 실패: 회원가입 유도
    notifyInfo('로그인 실패: 회원가입을 진행해주세요.')
    isNewPlayer.value = true
  }
}

const signup = async () => {
  const payload = {
    playerId: playerId.value,
    playerPassword: playerPassword.value,
  }

  const data = await apiCall.post('/api/players', null, payload)

  if (data.result === apiCall.Response.SUCCESS) {
    // 회원가입 성공 시 자동 로그인
    await login()
  } else {
    notifyInfo('회원가입 실패')
  }
}
</script>

<template>
  <div class="container-sm mt-3 border border-2 p-1" style="max-width: 600px">
    <div class="bss-background p-1">
      <div class="mt-3 d-flex justify-content-center" style="height: 230px;">
        <span class="text-center text-danger fs-1 fw-bold mt-4">SKALA STOCK Market</span>
      </div>

      <div class="row bg-info-subtle p-2 m-1" style="opacity: 95%;">
        <div class="col">
          <InlineInput v-model="playerId" label="플레이어ID" class="mb-1" type="text" placeholder="플레이어ID" />
          <InlineInput v-model="playerPassword" label="비밀번호" class="mb-1" type="password" placeholder="비밀번호" />
        </div>

        <div class="d-flex justify-content-end">
          <button v-if="isNewPlayer" class="btn btn-primary btn-sm" @click="signup">회원가입</button>
          <button v-else class="btn btn-primary btn-sm" @click="login">로그인</button>
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