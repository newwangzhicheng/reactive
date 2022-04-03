import { effect, reactive } from './reactive.js';

const objRef = reactive({
    text: 'hello',
    ok: 1
});

effect(function fn1() {
    objRef.ok++;
});