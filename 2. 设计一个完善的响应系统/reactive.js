let activeEffect;
function effect(fn) {
    activeEffect = fn;
    fn();
}

const buckets = new WeakMap();
function reactive(data) {
    return new Proxy(data, {
        get(target, key) {
            track(target, key);
            return target[key];
        },
        set(target, key, value) {
            target[key] = value;
            trigger(target, key);
            return true;
        }
    });
}


function track(target, key) {
    if (!activeEffect) {
        return;
    }

    let depsMap = buckets.get(target);
    if (!depsMap) {
        depsMap = new Map();
        buckets.set(target, depsMap);
    }

    let effectFnSet = depsMap.get(key);
    if (!effectFnSet) {
        effectFnSet = new Set();
        depsMap.set(key, effectFnSet);
    }
    effectFnSet.add(activeEffect);
}

function trigger(target, key) {
    let depsMap = buckets.get(target);
    if (!depsMap) {
        return;
    }

    let effectFnSet = depsMap.get(key);
    if (!effectFnSet) {
        return;
    }
    
    effectFnSet.forEach((fn) => {
        fn();
    });
}

export { effect, reactive };