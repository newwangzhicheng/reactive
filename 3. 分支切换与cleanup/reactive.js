let activeEffect;
function effect(fn) {
    const effectFn = () => {
        /** 调用前清除副作用依赖 */
        cleanup(effectFn);
        activeEffect = effectFn;
        fn();
    }
    /** 重新收集副作用依赖 */
    effectFn.deps = [];
    effectFn();
}

function cleanup(effectFn) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i];
        deps.delete(effectFn);
    }
    /** 重置副作用依赖集合 */
    effectFn.deps.length = 0;
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

    let deps = depsMap.get(key);
    if (!deps) {
        deps = new Set();
        depsMap.set(key, deps);
    }
    deps.add(activeEffect);
    /** 在track时收集依赖 */
    activeEffect.deps.push(deps);

}

function trigger(target, key) {
    let depsMap = buckets.get(target);
    if (!depsMap) {
        return;
    }

    let deps = depsMap.get(key);
    if (!deps) {
        return;
    }
    
    /** Set.forEach 先删除后添加元素会导致无限循环，创建一个新的Set */
    const newSet = new Set(deps);
    newSet.forEach((fn) => {
        fn();
    });
}

export { effect, reactive };