import { effect, reactive } from './reactive.js';

const objRef = reactive({
    text: 'hello',
    ok: true
});

let t1, t2;
effect(function fn1() {
    console.log('在fn1中执行');
    effect(function fn2() {
        console.log('在fn2中执行');
        t2 = objRef.ok;
    });
    t1 = objRef.text;
});

objRef.text = 'sod';