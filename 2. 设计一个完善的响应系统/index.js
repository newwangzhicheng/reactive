import { effect, reactive } from './reactive.js';

const objRef = reactive({
    text: 'hello'
});
effect(changeDOM);
setTimeout(() => {
    objRef.text = 'world';
}, 1500);
setTimeout(() => {
    objRef.foo = '新增的属性';
}, 3000);

function changeDOM() {
    document.querySelector('#app').innerHTML = objRef.text;
}