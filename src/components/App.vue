<template>
    <div class="row h-100 w-100 gx-0 justify-content-center align-items-center" :style="style">
        <div class="col-11 col-sm-6 col-lg-4 col-xl-3 col-xxl-2">
            <div class="card shadow-lg">
                <div class="card-header">
                    <h4 class="text-center" style="margin-top: 0.5rem;margin-bottom: 0.5rem;">Alles gut ?</h4>
                </div>
                <div class="card-body">
                    <div class="d-flex justify-content-center">
                        <h2 v-show="votes > 0">JA!</h2>
                        <h2 v-show="votes < 0">NEIN!</h2>
                    </div>
                    <div class="d-flex flex-column justify-content-center fw-bolder card-text text-center">
                        <span v-show="votes < 0"><u>Sadly, most people today are having a bad time 😢</u></span>
                        <span v-show="votes == 0"><u>Perfectly balanced, as all things should be.</u></span>
                        <span v-show="votes > 0"><u>Most people today are having a good time 🙃</u></span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="row row-cols-2 justify-content-between">
                        <div class="mx-2 col-auto badge bg-secondary d-flex align-items-center justify-content-center">
                            <span class="fw-bold">Votes: <span class="fw-bolder">{{ votes }}</span></span>
                        </div>
                        <div class="col d-flex flex-fill">
                            <div class="w-100 d-flex justify-content-end">
                                <button type="button" class="btn btn-outline-dark me-1" @click="thumbs_down"
                                    :disabled="store.voted">👎</button>
                                <button type="button" class="btn btn-outline-dark ms-1" @click="thumbs_up"
                                    :disabled="store.voted">👍</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import { store } from '/js/store.js';
import GUN from 'gun';

const gun = GUN('https://gunjs.herokuapp.com/gun');
var doc = gun.get('allesgut').get('votes');

const votes = ref(0);
const timestamp = ref(0);

const style = computed(() => {
    if (votes.value == 0) {
        return { 'background-color': '#fff' };
    }

    if (votes.value > 0) {
        return { 'background-color': 'var(--bs-warning)' };
    }

    if (votes.value < 0) {
        return { 'background-color': 'var(--bs-danger)' };
    }
});

function compare_dates(d1, d2) {
    return (d1.getUTCFullYear() === d2.getUTCFullYear() && d1.getUTCMonth() === d2.getUTCMonth() && d1.getUTCDate() === d2.getUTCDate());
}

async function thumbs_up() {
    votes.value++;
    gun.get('allesgut').put({ 'votes': votes.value + ' ' + Date.now() });
    localStorage.setItem('voted', Date.now());
    store.voted = true;
}

async function thumbs_down() {
    votes.value--;
    gun.get('allesgut').put({ 'votes': votes.value + ' ' + Date.now() });
    localStorage.setItem('voted', Date.now());
    store.voted = true;
}

doc.on((data) => {
    if (data == null) {
        doc.put('0 ' + Date.now());
        return;
    } else {
        votes.value = parseInt(data.split(' ')[0]);
        timestamp.value = parseInt(data.split(' ')[1]);
    }

    if (!compare_dates(new Date(timestamp.value), new Date())) {
        votes.value = 0;
        gun.get('allesgut').put({ 'votes': votes.value + ' ' + Date.now() });
        return;
    }

    let voted = localStorage.getItem('voted');
    if (voted && compare_dates(new Date(JSON.parse(voted)), new Date())) {
        store.voted = true;
    }
});
</script>