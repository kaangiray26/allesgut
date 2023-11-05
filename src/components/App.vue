<template>
  <div class="background h-100 w-100">
    <div class="bg-primary" :style="upvotePercentage"></div>
    <div class="bg-danger" :style="downvotePercentage"></div>
  </div>
  <div class="
      foreground
      row
      h-100
      w-100
      gx-0
      justify-content-center
      align-items-center
    ">
    <div class="col-11 col-sm-6 col-lg-4 col-xl-3 col-xxl-2">
      <div class="card shadow-lg">
        <div class="card-header">
          <h4 class="text-center" style="margin-top: 0.5rem; margin-bottom: 0.5rem">
            Alles gut ?
          </h4>
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-center">
            <h2 v-show="upvotes - downvotes > 0">JA!</h2>
            <h2 v-show="upvotes - downvotes < 0">NEIN!</h2>
          </div>
          <div class="
              d-flex
              flex-column
              justify-content-center
              fw-bolder
              card-text
              text-center
            ">
            <span v-show="upvotes - downvotes < 0"><u>Sadly, most people today are having a bad time 😢</u></span>
            <span v-show="upvotes - downvotes == 0"><u>Perfectly balanced, as all things should be.</u></span>
            <span v-show="upvotes - downvotes > 0"><u>Most people today are having a good time 🙃</u></span>
          </div>
        </div>
        <div class="card-footer">
          <div class="row justify-content-between">
            <div class="col d-flex flex-fill">
              <table class="table">
                <tbody>
                  <tr>
                    <th scope="row">Upvotes</th>
                    <td>{{ upvotes }}</td>
                  </tr>
                  <tr>
                    <th scope="row">Downvotes</th>
                    <td>{{ downvotes }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="
                col
                d-flex
                flex-fill
                justify-content-center
                align-items-center
              ">
              <div class="btn-group flex-fill" role="group" aria-label="Basic outlined example">
                <button type="button" class="btn btn-outline-dark" @click="thumbs_down" :disabled="store.voted">
                  👎
                </button>
                <button type="button" class="btn btn-outline-dark" @click="thumbs_up" :disabled="store.voted">
                  👍
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="alert alert-warning mx-3" role="alert" v-if="showError">
          {{ store.errorText }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
// GUN DB Structure
// { 'votes': 'upvote downvote datetime' }

import { ref, computed } from "vue";
import { store } from "/js/store.js";
import GUN from "gun";

// Set store parameter considering user's preferred language
const language = window.navigator.userLanguage || window.navigator.language;
if (language && typeof language === "string" && language.startsWith("de")) {
  store.isLanguageGerman = true;
}

const gun = GUN("https://gun-manhattan.herokuapp.com/gun");
var doc = gun.get("allesgut").get("data");

const upvotes = ref(0);
const downvotes = ref(0);
const timestamp = ref(0);
const showError = ref(false);

const upvotePercentage = computed(() => {
  let percentage = Math.floor(
    (upvotes.value / (upvotes.value + downvotes.value)) * 100
  );
  return { height: percentage + "%" };
});

const downvotePercentage = computed(() => {
  let percentage = 100 - parseInt(upvotePercentage.value.height);
  return { height: percentage + "%" };
});

function compare_dates(d1, d2) {
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

async function thumbs_up() {
  upvotes.value++;
  gun
    .get("allesgut")
    .put({ data: upvotes.value + " " + downvotes.value + " " + Date.now() });
  localStorage.setItem("voted", Date.now());
  store.voted = true;
}

async function thumbs_down() {
  if (store.isLanguageGerman) {
    store.errorText = "Das ist Deutsch. Diese Antwort ist nicht erlaubt.";
    showError.value = true;
    return;
  }
  downvotes.value++;
  gun
    .get("allesgut")
    .put({ data: upvotes.value + " " + downvotes.value + " " + Date.now() });
  localStorage.setItem("voted", Date.now());
  store.voted = true;
}

doc.on((data) => {
  if (data == null) {
    doc.put("0 0 " + Date.now());
    return;
  } else {
    upvotes.value = parseInt(data.split(" ")[0]);
    downvotes.value = parseInt(data.split(" ")[1]);
    timestamp.value = parseInt(data.split(" ")[2]);
  }

  if (!compare_dates(new Date(timestamp.value), new Date())) {
    upvotes.value = 0;
    downvotes.value = 0;
    gun
      .get("allesgut")
      .put({ data: upvotes.value + " " + downvotes.value + " " + Date.now() });
    return;
  }

  let voted = localStorage.getItem("voted");
  if (voted && compare_dates(new Date(JSON.parse(voted)), new Date())) {
    store.voted = true;
  }
});
</script>
