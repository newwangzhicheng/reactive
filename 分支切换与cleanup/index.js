import { effect, reactive } from './reactive.js';

const objRef = reactive({
    text: 'hello',
    ok: true
});
effect(changeDOM);
setTimeout(() => {
    objRef.text = 'world';
}, 1500);
setTimeout(() => {
    objRef.ok = false;
}, 3000);
setTimeout(() => {
    objRef.text = 'hello world';
}, 4500);

function changeDOM() {
    console.log('trigger effect function');
    document.querySelector('#app').innerHTML = objRef.ok ? objRef.text : 'boom';
}