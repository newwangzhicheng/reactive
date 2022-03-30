const buckets = new Set();
const data = {
    text: '想要设计一个基本的reactive系统'
};
const objRef = new Proxy(data, {
    get(target, key) {
        buckets.add(effect);
        return target[key];
    },
    set(target, key, value) {
        target[key] = value;
        buckets.forEach((fn) => {
            fn();
        });
        return true;
    }
});

function effect() {
    document.querySelector('#app').innerHTML = objRef.text;   
}


effect();
setTimeout(() => {
    objRef.text = "改变想法啦"
}, 2000);
