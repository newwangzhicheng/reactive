import { effect, reactive, computed } from './reactive.js';

const objRef = reactive({
    text: 'hello',
    ok: 1
});

const foo = computed(() => {
    console.log('执行了foo计算属性');
    return objRef.text + objRef.ok
});
console.log('foo.value :>> ', foo.value);
console.log('foo.value :>> ', foo.value);
console.log('foo.value :>> ', foo.value);
objRef.ok = 2;
console.log('foo.value :>> ', foo.value);


const obj2Ref = reactive({
    text: 'world',
    ok: 100
});
const bar = computed(() => {
    console.log('执行了bar计算属性');
    return obj2Ref.text + obj2Ref.ok
});
const fn = effect(() => {
    console.log('bar.value :>> ', bar.value);
})
obj2Ref.ok++;
// fn();
