<script lang="ts">
import { defineComponent, ref } from 'vue'
import firebase from 'firebase'

import { auth } from '../firebase'
import { authState } from 'rxfire/auth'
import { untilUnmounted } from 'vuse-rx'

export default defineComponent({
  setup() {
    const user = ref<null | firebase.User>(null)

    untilUnmounted(authState(auth)).subscribe((u) => {
      user.value = u
    })
    auth.signInAnonymously()

    return { user }
  },
})

</script>

<template>
  <div>
    <header class="py-3 mb-3 border-bottom bg-dark text-white">
      <div class="container">
        <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
          <span class="d-flex align-items-center mb-2 me-2 mb-lg-0 text-white text-decoration-none fs-3">
            <i class="fas fa-fire-alt"></i>
          </span>
          <ul class="nav col-12 col-sm-auto me-sm-auto mb-2 justify-content-center mb-md-0">
            <span class="fs-4">Fire Chess</span>
          </ul>

        </div>
      </div>
    </header>

    <div class="container-fluid" v-if="user">
      <router-view :uid="user.uid" :username="user.displayName || 'Гость'" />
    </div>
  </div>
</template>


<style>
.signin {
  display: flex;
  align-items: center;
  padding-top: 40px;
  padding-bottom: 40px;
}

.form-signin {
  width: 100%;
  padding: 15px;
  margin: auto;
}
</style>
