<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiCall from '@/scripts/api-call'
import { storePlayer } from '@/scripts/store-player'
import { notifyInfo } from '@/scripts/store-popups'

// ✅ 라우터 인스턴스: 로그인 성공 시 페이지 이동에 사용
const router = useRouter()

// ✅ 입력값(아이디/비밀번호) - 템플릿 v-model로 연결됨
const playerId = ref('')
const playerPassword = ref('')

// ✅ 로그인 실패 시 "회원가입 버튼"을 보여주기 위한 플래그
const isNewPlayer = ref(false)

// ✅ 로그인 요청 함수
const login = async () => {
  // ✅ 백엔드로 보낼 로그인 payload
  const payload = {
    playerId: playerId.value,
    playerPassword: playerPassword.value,
  }
  console.log('payload:', payload)

  // ✅ 로그인 API 호출 (POST /api/players/login)
  //    (두 번째 인자 null은 headers/options 자리로 보임 - 프로젝트 apiCall 규약에 따름)
  const data = await apiCall.post('/api/players/login', null, payload)

  // ✅ 성공/실패 분기 (apiCall.Response.SUCCESS == 0 같은 형태)
  if (data.result === apiCall.Response.SUCCESS) {
    // ✅ 로그인 성공:
    // 1) 스토어에 사용자 정보 저장
    // 2) 회원가입 모드 해제
    // 3) 주식 페이지로 이동
    storePlayer(payload)
    isNewPlayer.value = false
    router.push('/stock')
  } else {
    // ✅ 로그인 실패:
    // 1) 안내 팝업
    // 2) 회원가입 버튼 보이도록 전환
    notifyInfo('로그인 실패: 회원가입을 진행해주세요.')
    isNewPlayer.value = true
  }
}

// ✅ 회원가입 요청 함수
const signup = async () => {
  // ✅ 회원가입에 필요한 payload (여기서는 아이디/비밀번호만 받는 구조)
  const payload = {
    playerId: playerId.value,
    playerPassword: playerPassword.value,
  }

  // ✅ 회원가입 API 호출 (POST /api/players)
  const data = await apiCall.post('/api/players', null, payload)

  if (data.result === apiCall.Response.SUCCESS) {
    // ✅ 회원가입 성공 시: 바로 로그인 호출해서 세션/스토어/이동까지 이어지게 함
    await login()
  } else {
    // ✅ 회원가입 실패 시 안내
    notifyInfo('회원가입 실패')
  }
}
</script>

<template>
  <div class="container-sm mt-3 border border-2 p-1" style="max-width: 600px">
    <div class="bss-background p-1">
      <!-- ✅ 타이틀 영역 -->
      <div class="mt-3 d-flex justify-content-center" style="height: 230px;">
        <span class="text-center text-danger fs-1 fw-bold mt-4">SKALA STOCK Market</span>
      </div>

      <!-- ✅ 입력 + 버튼 영역 -->
      <div class="row bg-info-subtle p-2 m-1" style="opacity: 95%;">
        <div class="col">
          <!-- ✅ v-model로 ref(playerId/playerPassword)와 양방향 바인딩 -->
          <InlineInput v-model="playerId" label="플레이어ID" class="mb-1" type="text" placeholder="플레이어ID" />
          <InlineInput v-model="playerPassword" label="비밀번호" class="mb-1" type="password" placeholder="비밀번호" />
        </div>

        <!-- ✅ 로그인 실패 후에는 회원가입 버튼, 기본은 로그인 버튼 -->
        <div class="d-flex justify-content-end">
          <button v-if="isNewPlayer" class="btn btn-primary btn-sm" @click="signup">회원가입</button>
          <button v-else class="btn btn-primary btn-sm" @click="login">로그인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ✅ 배경 이미지/크기/정렬 */
.bss-background {
  width: 590px;
  height: 380px;
  background-image: url('/logo.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
