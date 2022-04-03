import { effect, reactive } from './reactive.js';

const objRef = reactive({
    text: 'hello',
    ok: 1
});

const jobQueue = new Set();
const p = Promise.resolve();
let isFlushing = false;
function flushJob() {
    if (isFlushing) return;
    isFlushing = true;
    p.then(() => {
        console.log('执行了then， jobQueue长度', jobQueue.size);
        jobQueue.forEach((job) => {
            console.log('执行了job');
            return job();
        });
    }).finally(() => {
        isFlushing = false;
    });
}

effect(function fn1() {
    console.log('objRef.ok :>> ', objRef.ok);
}, {
    scheduler(fn) {
        jobQueue.add(fn);
        flushJob();
    }
});
objRef.ok++;
objRef.ok++;
console.log('结束了');