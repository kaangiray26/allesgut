// store.js
import { reactive } from "vue";

const store = reactive({
  voted: false,
  isLanguageGerman: false,
  errorText: "",
});

export { store };
