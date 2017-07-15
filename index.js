var ASSIGN = (function(GLOBAL_APP_CONFIG, GLOBAL_METHODS) {

  const baseTypes = ['string', 'number', 'boolean', 'undefined'];

  function func(ab, bb, noob) {
    if (typeof ab !== 'object' || !ab) ab = Array.isArray(bb) ? new Array(bb.length) : {};
    if (typeof bb === 'object' && bb) {
      var kys = Object.keys(bb),
        kl = kys.length;
      for (var j = 0; j < kl; j++) {
        if (noob !== true || (baseTypes.indexOf(typeof ab[kys[j]]) !== -1) ||
          (baseTypes.indexOf(typeof bb[kys[j]]) !== -1)) {
          ab[kys[j]] = bb[kys[j]];
        }
      }
    }
    return ab;
  }

  function main() {
    var ln = arguments.length,
      noob = arguments[ln - 1];
    if (noob === true) {
      ln--;
    } else noob = false;
    var no = func(arguments[0], arguments[1], noob);
    for (var j = 2; j < ln; j++) {
      func(no, arguments[j], noob);
    }
    return no;
  }

  return main;
})();
var IS_AN = (function(GLOBAL_APP_CONFIG, GLOBAL_METHODS) {
  function func(st) {
    return Boolean(!(/[^A-Za-z0-9]/).test(st));
  }

  return func;
})();
var WALK = (function(GLOBAL_APP_CONFIG, GLOBAL_METHODS) {

  if (typeof GLOBAL_APP_CONFIG !== 'object' || GLOBAL_APP_CONFIG === null) GLOBAL_APP_CONFIG = {};

  const getNested = function(obj, depth) {
    return ((depth < (GLOBAL_APP_CONFIG.maxobjdepth || 99) && typeof obj === 'object' && obj !== null && obj.$W_END !== true) ? obj : false);
  };

  const walkInto = function(fun, rt, obj, key, depth = 0, isLast = true) {
    fun(obj, key, rt, depth, isLast);
    const ob = getNested(obj, depth);
    if (ob) {
      const kys = Object.keys(ob);
      const lastln = kys.length;
      const deep = depth + 1;
      for (let z = 0; z <= lastln; z += 1) {
        walkInto(fun, ob, ob[kys[z]], kys[z], deep, (z === lastln));
      }
    }
  };

  return walkInto;
})();
var WRAP = (function(GLOBAL_APP_CONFIG, GLOBAL_METHODS) {

  if (typeof GLOBAL_APP_CONFIG !== 'object' || GLOBAL_APP_CONFIG === null) GLOBAL_APP_CONFIG = {};

  const START_VAR = GLOBAL_APP_CONFIG.startvar || '{{',
    END_VAR = GLOBAL_APP_CONFIG.endvar || '}}',
    SVAR_L = START_VAR.length,
    EVAR_L = END_VAR.length,
    NOT_FOUND_MSG = GLOBAL_APP_CONFIG.notfoundvalue || 'VAR_NOT_FOUND',
    FUNC_KEY = GLOBAL_APP_CONFIG.functionkey || '@',
    VAR_REG = GLOBAL_APP_CONFIG.variableregex || /(\{\{[a-zA-Z0-9\$\.\_]+\}\})+/g;

  const WALK_INTO = GLOBAL_METHODS.objwalk,
    IS_ALPHA_NUM = GLOBAL_METHODS.isAlphaNum,
    ASSIGN = GLOBAL_METHODS.assign;

  function isWithVars(st) {
    if (st && typeof st === 'string' && st.length > (END_VAR.length + START_VAR.length)) {
      var f = st.indexOf(START_VAR),
        l = st.indexOf(END_VAR);
      return (f !== -1 && l !== -1) ? [f, l] : false;
    } else return false;
  }

  function _noUndefined(st, def) {
    return st === undefined ? def : st;
  }

  function getVarVal(varVal, varName, variablesMap) {
    if (typeof variablesMap !== 'object' || !variablesMap) {
      return varVal;
    }
    if (varName.indexOf('.') !== -1) {
      var spls = varName.split('.'),
        ln = spls.length,
        valFound = true;
      if (ln) {
        var base = getVarVal(spls[0], spls[0], variablesMap),
          curVal;
        for (var j = 1; j < ln; j++) {
          if (spls[j].length) {
            if (typeof base === 'object') {
              curVal = replace(spls[j], variablesMap);
              try {
                base = base[curVal];
              } catch (erm) {
                valFound = false;
              }
            } else {
              valFound = false;
            }
          }
        }
        if (valFound) {
          return _noUndefined(base, varVal);
        }
      }
    }
    return variablesMap.hasOwnProperty(varName) ? variablesMap[varName] : _noUndefined(varVal);
  }

  function extractVars(str) {
    return str.match(VAR_REG) || [];
  }

  function extractVarName(variable) {
    return variable.substring(SVAR_L, variable.length - EVAR_L);
  }

  function _replace(st, vars) {
    var replaced, varName, nvars = extractVars(st),
      reRep = false;
    for (var i = 0; i < nvars.length; i++) {
      varName = extractVarName(nvars[i]);
      replaced = getVarVal(nvars[i], varName, vars);
      if (st === nvars[i]) return replaced;
      var rValue = (typeof replaced === 'string') ? replaced : JSON.stringify(replaced);
      st = st.replace(nvars[i], function() {
        return rValue;
      });
    }
    return st;
  }

  function replace(st, vars, ins) {
    if (typeof st === 'string') {
      if (typeof vars !== 'object' || !vars) {
        return st;
      }
      if (!(Array.isArray(ins))) {
        ins = isWithVars(st);
      }
      if (!(ins)) {
        return st;
      }
      var reRep = (st.indexOf('.' + START_VAR) !== -1) && (st.indexOf(END_VAR + '.') !== -1);
      st = _replace(st, vars);
      if (reRep) {
        st = _replace(st, vars);
      }
    }
    return st;
  }

  function handleFunction(inp, vars, methods) {
    if (typeof inp === 'object' && inp) {
      if (typeof methods === 'object' && (typeof inp[FUNC_KEY] === 'string') &&
        IS_ALPHA_NUM(inp[FUNC_KEY]) && (typeof methods[inp[FUNC_KEY]] === 'function')) {
        var pms = (typeof inp.params === 'object' && inp.params !== null) ? ASSIGN(false, inp.params) : inp.params;
        var params = deepReplace(pms, vars, methods);
        if (!(Array.isArray(params))) {
          params = [params];
        }
        params.unshift(vars, methods);
        return methods[inp[FUNC_KEY]].apply(null, params);
      }
    }
    return inp;
  }

  function deepReplace(input, vars, methods) {
    if (typeof input !== 'object' || !input) {
      return replace(input, vars);
    }
    input = handleFunction(input, vars, methods);
    WALK_INTO(function(valn, key, rt) {
      if (typeof rt === 'object' && rt && typeof rt.hasOwnProperty === 'function' && rt.hasOwnProperty(key)) {
        var val = rt[key],
          tmpKy = null,
          isth = isWithVars(key);
        if (isth) {
          tmpKy = replace(key, vars, isth);
          if (tmpKy !== key) {
            val = rt[tmpKy] = rt[key];
            delete rt[key];
          }
        }
        if (typeof val === 'string' && val) {
          isth = isWithVars(val);
          if (isth) {
            rt[tmpKy || key] = replace(val, vars, isth);
          }
        } else {
          rt[tmpKy || key] = handleFunction(val, vars, methods);
        }
      }
    }, null, input);
    return input;
  }

  return deepReplace;
});

var TEMPLIST = WRAP(0, {
  objwalk: WALK,
  isAlphaNum: IS_AN,
  assign: ASSIGN
});
TEMPLIST.objwalk = WALK;
TEMPLIST.isAlphaNum = IS_AN;
TEMPLIST.assign = ASSIGN;
module.exports = TEMPLIST;