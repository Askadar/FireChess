<script lang="ts">
import { defineComponent, ref } from 'vue'

import { auth } from './firebase'
import { authState } from 'rxfire/auth'
import { untilUnmounted } from 'vuse-rx'

import Room from './Room.vue'

export default defineComponent({
  setup() {
    const user = ref(null)

    untilUnmounted(authState(auth)).subscribe((u) => {
      user.value = u
    })
    auth.signInAnonymously()

    return { user }
  },
  components: { Room }
})

</script>

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

          <div class="dropdown text-end" v-if="user">
            <a href="#" class="d-block link-secondary text-decoration-none dropdown-toggle" id="dropdownUser1"
              data-bs-toggle="dropdown" aria-expanded="true">
              <img :src="user.photoURL" alt="mdo" width="32" height="32" class="rounded-circle" />
            </a>
            <ul class="dropdown-menu text-small" aria-labelledby="dropdownUser1" style="
							position: absolute;
							inset: 0px auto auto 0px;
							margin: 0px;
							transform: translate(-110px, 34px);
						" data-popper-placement="bottom-end">
              <li>
                <span class="dropdown-item">Hi {{ user.displayName }}!</span>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <div class="container-fluid" v-if="user">
      <room :uid="user.uid" :username="user.displayName || 'guest'" />
    </div>
  </div>
</template>
