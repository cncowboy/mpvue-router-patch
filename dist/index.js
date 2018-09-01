function stringifyQuery(obj) {
  const res = obj ? Object.keys(obj).map(key => {
    const val = obj[key];

    if (val === undefined) {
      return '';
    }

    if (val === null) {
      return key;
    }

    if (Array.isArray(val)) {
      const result = [];
      val.forEach(val2 => {
        if (val2 === undefined) {
          return;
        }
        if (val2 === null) {
          result.push(key);
        } else {
          result.push(`${key}=${val2}`);
        }
      });
      return result.join('&');
    }

    return `${key}=${val}`;
  }).filter(x => x.length > 0).join('&') : null;
  return res ? `?${res}` : '';
}

function parseUrl(location) {
  if (typeof location === 'string') return location;

  const { path, query } = location;
  const queryStr = stringifyQuery(query);

  return `${path}${queryStr}`;
}

function parseRoute($mp) {
  const _$mp = $mp || {};
  const path = _$mp.page && _$mp.page.route;
  return {
    path: `/${path}`,
    params: {},
    query: _$mp.query,
    hash: '',
    fullPath: parseUrl({
      path: `/${path}`,
      query: _$mp.query
    }),
    name: path && path.replace(/\/(\w)/g, ($0, $1) => $1.toUpperCase())
  };
}

function push(location, complete, fail, success) {
  const url = parseUrl(location);
  const params = { url, complete, fail, success };

  if (location.isTab) {
    wx.switchTab(params);
    return;
  }
  if (location.reLaunch) {
    wx.reLaunch(params);
    return;
  }
  wx.navigateTo(params);
}

function replace(location, complete, fail, success) {
  const url = parseUrl(location);
  const params = { url, complete, fail, success };
  if (location.isTab) {
    wx.switchTab(params);
    return;
  }
  if (location.reLaunch) {
    wx.reLaunch(params);
    return;
  }
  wx.redirectTo(params);
}

function go(delta) {
  wx.navigateBack({ delta: delta * -1 });
}

function back() {
  wx.navigateBack();
}

let _Vue;

var index = {
  install(Vue) {
    if (this.installed && _Vue === Vue) return;
    this.installed = true;

    _Vue = Vue;

    let _route = {};
    const _router = {
      mode: 'history',
      currentRoute: _route,
      push,
      replace,
      go,
      back
    };

    Vue.mixin({
      onShow() {
        if (this.$parent) return;
        const { $mp } = this.$root;
        _route = parseRoute($mp);
        _router.app = this;
      }
    });

    const $router = {
      get() {
        return _router;
      }
    };
    const $route = {
      get() {
        return _route;
      },
      set(v) {
        _route = v;
      }
    };

    Object.defineProperty(Vue.prototype, '$router', $router);

    Object.defineProperty(Vue.prototype, '$route', $route);
  }
};

export default index;
export { _Vue };
