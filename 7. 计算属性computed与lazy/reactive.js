let activeEffect;
/**
 * 添加一个栈，栈顶指向正在执行的副作用函数
 * 防止嵌套的副作用函数导致依赖收集错误
 */
const effectStack = [];
function effect(fn, options = {}) {
    const effectFn = () => {
        /** 调用前清除副作用依赖 */
        cleanup(effectFn);
        activeEffect = effectFn;
        /**
         * 将副作用函数的引用压入栈顶
         */
        effectStack.push(effectFn);
        /**
         * ! 将结果保存起来
         */
        const res = fn();
        /**
         * 内层函数的执行完毕后，栈顶的副作用弹出
         * 正在活跃的副作用函数activeEffect指向外层的函数
         */
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
        /**
         * ! 将原函数执行的结果返回
         */
        return res;
    }
    /**
     * 将options挂载到函数上
     */
    effectFn.options = options;
    /** 重新收集副作用依赖 */
    effectFn.deps = [];
    /**
     * ! 如果options为true，不选择执行而是return出去
     */
    if (!options.lazy) {
        effectFn();
    }
    return effectFn;
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
    const objReactive = new Proxy(data, {
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
    return objReactive;
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
        /**
         * 判断要trigger的函数是否是正在执行的副作用函数；避免无限递归循环
         */
        if (fn !== activeEffect) {
            /**
             * 有调度器存在的时候将fn交给调度器scheduler执行
             */
            if (fn.options && fn.options.scheduler) {
                fn.options.scheduler(fn);
            } else {
                fn();
            }
        }
    });
}
/**
 * ! 实现vuejs中的computed函数，收集依赖在访问value的时候返回计算值
 */
function computed(getter) {
    /**
     * ! value缓存值，dirty脏值检测
     */
    let value;
    let dirty = true;
    let obj;
    const fn = effect(getter, {
        lazy: true,
        /**
         * ! 调度器会在数据更新的时候调用，可以用它更新dirty值
         */
        scheduler() {
            /**
             * ! 在依赖的响应值修改的时候手动trigger
             */
            if(!dirty) {
                dirty = true;
                trigger(obj, 'value');
            }
        }
    });
    obj = {
        get value() {
            /**
             * ! 如果脏值为true，则调用副函数回调更新
             */
            if (dirty) {
                value = fn();
                dirty = false;
            }
            /**
             * ! 在获取值的时候手动track
             */
            track(obj, 'value');
            return value;
        }
    }
    return obj;
}

export { effect, reactive, computed };