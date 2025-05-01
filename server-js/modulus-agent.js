var ModulusAgent = (function () {
    'use strict';

    class InvalidTokenError extends Error {
    }
    InvalidTokenError.prototype.name = "InvalidTokenError";
    function b64DecodeUnicode(str) {
        return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
            let code = p.charCodeAt(0).toString(16).toUpperCase();
            if (code.length < 2) {
                code = "0" + code;
            }
            return "%" + code;
        }));
    }
    function base64UrlDecode(str) {
        let output = str.replace(/-/g, "+").replace(/_/g, "/");
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += "==";
                break;
            case 3:
                output += "=";
                break;
            default:
                throw new Error("base64 string is not of the correct length");
        }
        try {
            return b64DecodeUnicode(output);
        }
        catch (err) {
            return atob(output);
        }
    }
    function jwtDecode(token, options) {
        if (typeof token !== "string") {
            throw new InvalidTokenError("Invalid token specified: must be a string");
        }
        options || (options = {});
        const pos = options.header === true ? 0 : 1;
        const part = token.split(".")[pos];
        if (typeof part !== "string") {
            throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
        }
        let decoded;
        try {
            decoded = base64UrlDecode(part);
        }
        catch (e) {
            throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
        }
        try {
            return JSON.parse(decoded);
        }
        catch (e) {
            throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
        }
    }

    function _define_property(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }
        return obj;
    }
    class ApiClient {
        async request({ endpoint, method, data }) {
            const headers = {
                Authorization: `Bearer ${this.token}`
            };
            const fetchOptions = {
                method,
                headers
            };
            if (data != null) {
                headers['Content-Type'] = 'application/json';
                fetchOptions.body = JSON.stringify(data);
            }
            const response = await fetch(`${this.baseURL}${endpoint}`, fetchOptions);
            if (!response.ok) {
                throw new Error(`HTTP error (status: ${response.status})`);
            }
            return response;
        }
        constructor(baseURL, token){
            _define_property(this, "baseURL", void 0);
            _define_property(this, "token", void 0);
            this.baseURL = baseURL;
            this.token = token;
        }
    }

    // Lightweight typesafe event emitter.  Based on a few sources, including
    // - https://blog.makerx.com.au/a-type-safe-event-emitter-in-node-js/
    // - https://stackoverflow.com/questions/67243592/typescript-adding-types-to-eventemitter
    //
    // To use, provide an `EventTypes` type of the form
    //   type MyEvents = {
    //     'event-1': [s: string, n: number],
    //     'event-2': [],
    //   }
    //
    // Typescript will complain if you attempt to register an incompatibly-typed
    // listener for a given event.  For example, the following listener types are
    // allowed for MyEvents['event-1']
    //   () => void
    //   (s: string) => void
    //   (s: string, n: number) => void
    // and the following are not allowed
    //   (n: number) => void
    //   (s: string, n: number, x: any) => void
    function _check_private_redeclaration$1(obj, privateCollection) {
        if (privateCollection.has(obj)) {
            throw new TypeError("Cannot initialize the same private elements twice on an object");
        }
    }
    function _class_apply_descriptor_get$1(receiver, descriptor) {
        if (descriptor.get) {
            return descriptor.get.call(receiver);
        }
        return descriptor.value;
    }
    function _class_extract_field_descriptor$1(receiver, privateMap, action) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to " + action + " private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function _class_private_field_get$1(receiver, privateMap) {
        var descriptor = _class_extract_field_descriptor$1(receiver, privateMap, "get");
        return _class_apply_descriptor_get$1(receiver, descriptor);
    }
    function _class_private_field_init$1(obj, privateMap, value) {
        _check_private_redeclaration$1(obj, privateMap);
        privateMap.set(obj, value);
    }
    var _listeners = /*#__PURE__*/ new WeakMap();
    class EventEmitter {
        on(event, listener) {
            const listeners = _class_private_field_get$1(this, _listeners)[event] ?? [];
            _class_private_field_get$1(this, _listeners)[event] = [
                ...listeners,
                listener
            ];
            return ()=>this.off(event, listener);
        }
        once(event, listener) {
            const wrapper = (...args)=>{
                this.off(event, wrapper);
                listener(...args);
            };
            return this.on(event, wrapper);
        }
        off(event, listener) {
            const listeners = _class_private_field_get$1(this, _listeners)[event] ?? [];
            _class_private_field_get$1(this, _listeners)[event] = listeners.filter((it)=>it !== listener);
        }
        emit(event, ...args) {
            for (const listener of _class_private_field_get$1(this, _listeners)[event] ?? []){
                try {
                    listener(...args);
                } catch (err) {
                    console.log('Warning -- unhandled exception in event listener\n', err);
                }
            }
        }
        constructor(){
            _class_private_field_init$1(this, _listeners, {
                writable: true,
                value: {}
            });
        }
    }

    function _check_private_redeclaration(obj, privateCollection) {
        if (privateCollection.has(obj)) {
            throw new TypeError("Cannot initialize the same private elements twice on an object");
        }
    }
    function _class_apply_descriptor_get(receiver, descriptor) {
        if (descriptor.get) {
            return descriptor.get.call(receiver);
        }
        return descriptor.value;
    }
    function _class_apply_descriptor_set(receiver, descriptor, value) {
        if (descriptor.set) {
            descriptor.set.call(receiver, value);
        } else {
            if (!descriptor.writable) {
                throw new TypeError("attempted to set read only private field");
            }
            descriptor.value = value;
        }
    }
    function _class_extract_field_descriptor(receiver, privateMap, action) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to " + action + " private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function _class_private_field_get(receiver, privateMap) {
        var descriptor = _class_extract_field_descriptor(receiver, privateMap, "get");
        return _class_apply_descriptor_get(receiver, descriptor);
    }
    function _class_private_field_init(obj, privateMap, value) {
        _check_private_redeclaration(obj, privateMap);
        privateMap.set(obj, value);
    }
    function _class_private_field_set(receiver, privateMap, value) {
        var descriptor = _class_extract_field_descriptor(receiver, privateMap, "set");
        _class_apply_descriptor_set(receiver, descriptor, value);
        return value;
    }
    function _class_private_method_get(receiver, privateSet, fn) {
        if (!privateSet.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return fn;
    }
    function _class_private_method_init(obj, privateSet) {
        _check_private_redeclaration(obj, privateSet);
        privateSet.add(obj);
    }
    var // High-water mark progress.  Will be equal to the saved progress, except
    // while a submission is in flight.
    _progress = /*#__PURE__*/ new WeakMap(), // Highest progress value that has been sucessfully sent to or received from
    // the Modulus API.
    _submittedProgress = /*#__PURE__*/ new WeakMap(), // Whether a progress submission is currently in flight.
    _submittingProgress = /*#__PURE__*/ new WeakMap(), // Current page state.
    _pageState = /*#__PURE__*/ new WeakMap(), // Whether the current page state matches the last value sent to or received
    // from the Modulus API.
    _pageStateInSync = /*#__PURE__*/ new WeakMap(), // Whether a page state submission is currently in flight.
    _submittingPageState = /*#__PURE__*/ new WeakMap(), // Has the Modulus agent finished initializing itself?
    _status = /*#__PURE__*/ new WeakMap(), // API connection and associated metadata.  Will be undefined if the agent did
    // not initially connect to the API.
    _connection = /*#__PURE__*/ new WeakMap(), _submitProgress = /*#__PURE__*/ new WeakSet(), _submitPageState = /*#__PURE__*/ new WeakSet();
    class ModulusAgent extends EventEmitter {
        async init() {
            if (_class_private_field_get(this, _status) !== 'uninitialized') return;
            _class_private_field_set(this, _status, 'initializing');
            try {
                // Set up API client with token taken from location hash.  This will throw
                // if the token is not found or is invalid.
                const token = window.location.hash.slice(1);
                const { api_server_URL, user, activity_code, activity } = jwtDecode(token);
                const apiClient = new ApiClient(api_server_URL, token);
                const progressPromise = apiClient.request({
                    endpoint: '/agent/activity/progress',
                    method: 'GET'
                }).then((response)=>response.json()).then(({ progress })=>progress);
                const pageStatePromise = apiClient.request({
                    endpoint: '/agent/activity/page-state',
                    method: 'GET'
                }).then((response)=>response.json()).then(({ page_state })=>page_state);
                const [progress, pageState] = await Promise.all([
                    progressPromise,
                    pageStatePromise
                ]);
                _class_private_field_set(this, _progress, progress);
                _class_private_field_set(this, _submittedProgress, progress);
                _class_private_field_set(this, _pageState, pageState);
                _class_private_field_set(this, _connection, {
                    apiClient,
                    user,
                    activityCode: activity_code,
                    activity
                });
                this.emit('progress-changed', {
                    progress
                });
                this.emit('progress-submitted', {
                    progress
                });
                this.emit('pagestate-changed', {
                    pageState
                });
            } catch (err) {
                console.log('Modulus agent failed to authenticate -- falling back to local operation');
            } finally{
                _class_private_field_set(this, _status, 'ready');
                this.emit('ready');
            }
        }
        ready() {
            return _class_private_field_get(this, _status) === 'ready';
        }
        user() {
            return _class_private_field_get(this, _connection)?.user;
        }
        progress() {
            return _class_private_field_get(this, _progress);
        }
        submittedProgress() {
            return _class_private_field_get(this, _submittedProgress);
        }
        setProgress(progress) {
            if (_class_private_field_get(this, _status) !== 'ready') {
                console.log('Warning -- Modulus agent is not initialized');
            } else if (progress > 1.0 || progress < 0.0) {
                console.log('Warning -- invalid progress value');
            } else if (progress > _class_private_field_get(this, _progress)) {
                _class_private_field_set(this, _progress, progress);
                this.emit('progress-changed', {
                    progress
                });
                _class_private_method_get(this, _submitProgress, submitProgress).call(this);
            }
        }
        pageState() {
            return _class_private_field_get(this, _pageState);
        }
        setPageState(pageState) {
            if (_class_private_field_get(this, _status) !== 'ready') {
                console.log('Warning -- Modulus agent is not initialized');
            }
            if (_class_private_field_get(this, _pageState) === pageState) return;
            _class_private_field_set(this, _pageState, pageState);
            _class_private_field_set(this, _pageStateInSync, false);
            this.emit('pagestate-changed', {
                pageState
            });
            _class_private_method_get(this, _submitPageState, submitPageState).call(this);
        }
        constructor(...args){
            super(...args), _class_private_method_init(this, _submitProgress), _class_private_method_init(this, _submitPageState), _class_private_field_init(this, _progress, {
                writable: true,
                value: 0
            }), _class_private_field_init(this, _submittedProgress, {
                writable: true,
                value: 0
            }), _class_private_field_init(this, _submittingProgress, {
                writable: true,
                value: false
            }), _class_private_field_init(this, _pageState, {
                writable: true,
                value: {}
            }), _class_private_field_init(this, _pageStateInSync, {
                writable: true,
                value: true
            }), _class_private_field_init(this, _submittingPageState, {
                writable: true,
                value: false
            }), _class_private_field_init(this, _status, {
                writable: true,
                value: 'uninitialized'
            }), _class_private_field_init(this, _connection, {
                writable: true,
                value: void 0
            });
        }
    }
    async function submitProgress() {
        if (_class_private_field_get(this, _submittingProgress) || _class_private_field_get(this, _connection) == null) return;
        _class_private_field_set(this, _submittingProgress, true);
        const connection = _class_private_field_get(this, _connection);
        let backoff = 1000;
        while(_class_private_field_get(this, _progress) > _class_private_field_get(this, _submittedProgress)){
            try {
                const response = await connection.apiClient.request({
                    endpoint: '/agent/activity/progress',
                    method: 'PUT',
                    data: {
                        progress: _class_private_field_get(this, _progress)
                    }
                });
                const { progress } = await response.json();
                _class_private_field_set(this, _submittedProgress, progress);
                this.emit('progress-submitted', {
                    progress
                });
            } catch (err) {
                if (backoff >= 32000) {
                    console.log('Warning -- Modulus connection lost');
                    break;
                }
                console.log('Warning -- Modulus failed to submit progress');
                await new Promise((resolve)=>setTimeout(resolve, backoff));
                backoff = Math.max(backoff * 2, 1600);
            }
        }
        _class_private_field_set(this, _submittingProgress, false);
    }
    async function submitPageState() {
        if (_class_private_field_get(this, _submittingPageState) || _class_private_field_get(this, _connection) == null) return;
        _class_private_field_set(this, _submittingPageState, true);
        const connection = _class_private_field_get(this, _connection);
        let backoff = 1000;
        while(!_class_private_field_get(this, _pageStateInSync)){
            try {
                const pageState = _class_private_field_get(this, _pageState);
                await connection.apiClient.request({
                    endpoint: '/agent/activity/page-state',
                    method: 'PUT',
                    data: {
                        page_state: pageState
                    }
                });
                if (pageState === _class_private_field_get(this, _pageState)) {
                    _class_private_field_set(this, _pageStateInSync, true);
                }
                this.emit('pagestate-submitted');
            } catch (err) {
                if (backoff >= 32000) {
                    console.log('Warning -- Modulus connection lost');
                    _class_private_field_set(this, _submittingPageState, false);
                    return;
                }
                console.log('Warning -- Modulus failed to submit progress');
                await new Promise((resolve)=>setTimeout(resolve, backoff));
                backoff = Math.max(backoff * 2, 1600);
            }
        }
        _class_private_field_set(this, _submittingPageState, false);
    }

    return ModulusAgent;

})();
