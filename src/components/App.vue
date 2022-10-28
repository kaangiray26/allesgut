<template>
    <div class="row h-100 w-100 gx-0 justify-content-center align-items-center" :style="style">
        <div class="col-11 col-sm-6 col-lg-4 col-xl-3 col-xxl-2">
            <div class="card shadow-lg">
                <div class="card-header">
                    <h4 class="text-center" style="margin-top: 0.5rem;margin-bottom: 0.5rem;">Alles gut ?</h4>
                </div>
                <div class="card-body">
                    <div class="d-flex justify-content-center">
                        <h2 v-show="state > 0">JA!</h2>
                        <h2 v-show="state < 0">NEIN!</h2>
                    </div>
                    <div class="d-flex flex-column justify-content-center fw-bolder card-text text-center">
                        <span v-show="state < 0"><u>Sadly, most people today are having a bad time 😢</u></span>
                        <span v-show="state == 0"><u>Perfectly balanced, as all things should be.</u></span>
                        <span v-show="state > 0"><u>Most people today are having a good time 🙃</u></span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="row row-cols-2 justify-content-between">
                        <div class="mx-2 col-auto badge bg-secondary d-flex align-items-center justify-content-center">
                            <span class="fw-bold">Votes: <span class="fw-bolder">{{ state }}</span></span>
                        </div>
                        <div v-if="!store.voted" class="col d-flex flex-fill">
                            <div class="w-100 d-flex justify-content-end">
                                <button type="button" class="btn btn-outline-dark me-1" @click="thumbs_down">👎</button>
                                <button type="button" class="btn btn-outline-dark ms-1" @click="thumbs_up">👍</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { store } from '/js/store.js';
import GUN from 'gun';

const gun = GUN();
const state = ref(0);

const style = computed(() => {
    if (state.value == 0) {
        return { 'background-color': '#fff' };
    }

    if (state.value > 0) {
        return { 'background-color': '#cfc' };
    }

    if (state.value < 0) {
        return { 'background-color': '#fcc' };
    }
});

gun.get('allesgut').on((data, key) => {
    state.value = data.state;
});

async function alles_init() {
    gun.get('allesgut').once((data, key) => {
        if (!data) {
            gun.get('allesgut').put({ 'state': 0 });
        } else {
            state.value = data.state;
        }
    });
    let voted = localStorage.getItem('voted');
    if (voted && (voted == new Date().getUTCDate())) {
        store.voted = true;
    }
}

async function thumbs_up() {
    state.value++;
    gun.get('allesgut').put({ 'state': state.value });
    localStorage.setItem('voted', new Date().getUTCDate());
    store.voted = true;
}

async function thumbs_down() {
    state.value--;
    gun.get('allesgut').put({ 'state': state.value });
    localStorage.setItem('voted', new Date().getUTCDate());
    store.voted = true;
}

onMounted(() => {
    alles_init();
});
</script>