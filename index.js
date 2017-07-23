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
});
var IS_AN = (function(GLOBAL_APP_CONFIG, GLOBAL_METHODS) {
  function func(st) {
    return Boolean(!(/[^A-Za-z0-9]/).test(st));
  }

  return func;
});
var WALK = (function(GLOBAL_APP_CONFIG, GLOBAL_METHODS) {
  if (typeof GLOBAL_APP_CONFIG !== 'object' || GLOBAL_APP_CONFIG === null) GLOBAL_APP_CONFIG = {};
  const maxobjdepth = GLOBAL_APP_CONFIG.maxobjdepth || 99;
  const endvar = GLOBAL_APP_CONFIG.walkendkey || '$W_END';

  let ifEndForObjWalk = GLOBAL_METHODS && GLOBAL_METHODS.ifEndForObjWalk;
  if (typeof ifEndForObjWalk !== 'function') {
    ifEndForObjWalk = function(obj, depth) {
      return ((depth < maxobjdepth && typeof obj === 'object' &&
        obj !== null && obj[endvar] !== true) ? obj : false);
    };
  };

  const walkInto = function(fun, rt, obj, key, depth, isLast) {
    if (!depth) depth = 0;
    fun(obj, key, rt, depth || 0, typeof isLast === 'boolean' ? isLast : true);
    const ob = ifEndForObjWalk(obj, depth);
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
});
var WRAP = (function(GLOBAL_APP_CONFIG, GLOBAL_METHODS) {
  if (typeof GLOBAL_APP_CONFIG !== 'object' || GLOBAL_APP_CONFIG === null) GLOBAL_APP_CONFIG = {};

  const START_VAR = GLOBAL_APP_CONFIG.startvar || '\{\{',
    END_VAR = GLOBAL_APP_CONFIG.endvar || '\}\}',
    SVAR_L = START_VAR.length,
    EVAR_L = END_VAR.length,
    FUNC_KEY = GLOBAL_APP_CONFIG.functionkey === undefined ? '@' : GLOBAL_APP_CONFIG.functionkey,
    NOT_FOUND_MSG = GLOBAL_APP_CONFIG.notfoundvalue || 'VAR_NOT_FOUND',
    VAR_REG = GLOBAL_APP_CONFIG.variableregex ||
    new RegExp('\(' + START_VAR + '\[a-zA-Z0-9\\$\\.\_\]+' + END_VAR + '\)\+', 'g');
  FUNC_REG = GLOBAL_APP_CONFIG.functionregex ||
    new RegExp('\(' + START_VAR + '\[a-zA-Z0-9\_\]+\\(\.\*\?\\)' + END_VAR + '\)\+', 'g');

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

  function handleFunction(inp, vars, methods) {
    if (typeof inp === 'object' && inp && FUNC_KEY) {
      if (typeof methods === 'object' && (typeof inp[FUNC_KEY] === 'string') &&
        IS_ALPHA_NUM(inp[FUNC_KEY]) && (typeof methods[inp[FUNC_KEY]] === 'function')) {
        var pms = (typeof inp.params === 'object' && inp.params !== null) ? ASSIGN(false, inp.params) : inp.params;
        var params = mainReplace(pms, vars, methods);
        if (!(Array.isArray(params))) {
          params = [params];
        }
        params.unshift(vars, methods);
        return methods[inp[FUNC_KEY]].apply(null, params);
      }
    }
    return inp;
  }

  function _noUndefined(st, def) {
    return st === undefined ? def : st;
  }

  function getVarVal(varVal, varName, variablesMap) {
    if (variablesMap.hasOwnProperty(varName)) {
      return variablesMap[varName];
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
              curVal = (spls[j] === '$' && Array.isArray(base)) ?
                getVarVal(spls[j], spls[j], variablesMap) : spls[j];
              try {
                base = base[curVal];
              } catch (er) {
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

  function replaceVariable(str, varName, varValue) {
    if (str === varName) return varValue;
    var strType = typeof varValue === "string",
      ln = str.length;
    var patt = (strType || (str.indexOf(START_VAR) !== 0 || str.indexOf(END_VAR) !== (ln - EVAR_L))) ? varName : '"' + varName + '"';
    var rValue = strType ? varValue : JSON.stringify(varValue);
    return str.replace(patt, function() {
      return rValue;
    });
  }

  function extractVarName(variable) {
    return variable.substring(SVAR_L, variable.length - EVAR_L);
  }

  function replaceVariables(str, vars, variablesMap, methodsMap) {
    var varName, replaced, res, ren, wasString;
    for (var i = 0; i < vars.length; i++) {
      varName = extractVarName(vars[i]);
      replaced = getVarVal(vars[i], varName, variablesMap, methodsMap);
      if (replaced !== vars[i]) {
        wasString = typeof replaced === 'string';
        replaced = mainReplace(replaced, variablesMap, methodsMap);
        if (wasString && typeof replaced !== 'string') replaced = JSON.stringify(replaced);
      }
      str = replaceVariable(str, vars[i], replaced);
    }
    return str;
  }

  function extractVars(str) {
    var ar = str.match(VAR_REG) || [],
      ln = ar.length;
    for (var zi = 0, sps, sl; zi < ln; zi++) {
      if (ar[zi].indexOf(END_VAR + START_VAR) !== -1) {
        sps = ar[zi].split(END_VAR + START_VAR);
        sl = sps.length;
        for (var zj = 0; zj < sl; zj++) {
          if (zj) {
            if (zj === sl - 1) {
              sps[zj] = START_VAR + sps[zj];
            } else {
              sps[zj] = START_VAR + sps[zj] + END_VAR;
            }
          } else {
            sps[zj] += END_VAR;
          }
        }
        ar.splice.bind(ar, zi, 1).apply(ar, sps);
        ln += sl - 1;
        zi += sl - 1;
      }
    }
    return ar;
  }

  function extractMethods(str) {
    return str.match(FUNC_REG) || [];
  }

  function extractMethodName(methodDec) {
    return methodDec.substring(SVAR_L, methodDec.indexOf('('));
  }

  function extractParameters(str, methodName) {
    var ar = [];
    if (typeof str === 'string' && str.length) {
      var chars = str.split(','),
        cl = chars.length;
      var pushInto = function(n) {
        chars[n] = chars[n].trim();
        var len = chars[n].length;
        if (len >= 2 && ((chars[n].charAt(0) === "'" && chars[n].charAt(len - 1) === "'") ||
            (chars[n].charAt(0) === '"' && chars[n].charAt(len - 1) === '"'))) {
          chars[n] = '"' + chars[n].substring(1, len - 1).replace(/\"/g, '\\"') + '"';
        }
        try {
          ar.push(JSON.parse(chars[n]));
        } catch (er) {
          ar.push(undefined);
        }
      };
      for (var di, si, eg, fg, n = 0; n < cl; n++) {
        eg = chars[n].charAt(0);
        fg = chars[n].charAt(chars[n].length - 1);
        if (!(eg === fg && (eg === '"' || eg === "'"))) {
          chars[n] = chars[n].trim();
          eg = chars[n].charAt(0);
          fg = chars[n].charAt(chars[n].length - 1);
        }
        di = chars[n].indexOf('"');
        si = chars[n].indexOf("'");
        if (((si === -1) && (di === -1)) || (eg === fg && (eg === '"' || eg === "'")) ||
          (chars[n].charAt(0) === "{" && chars[n].charAt(chars[n].length - 1) === "}" &&
            (chars[n].match(/\{/g).length === chars[n].match(/\}/g).length)) ||
          (chars[n].charAt(0) === "[" && chars[n].charAt(chars[n].length - 1) === "]" &&
            (chars[n].match(/\[/g).length === chars[n].match(/\]/g).length))) {
          pushInto(n);
        } else if (n < (cl - 1)) {
          chars[n] = chars[n] + ',' + chars[n + 1];
          chars.splice(n + 1, 1);
          n--;
          cl--;
          continue;
        }
      }
    }
    return ar;
  }

  function extractMethodParams(methodDec, methodName) {
    var baseDec = methodDec.substring(methodName.length + SVAR_L + 1, methodDec.length - (EVAR_L + 1)).trim();
    return extractParameters(baseDec, methodName);
  }

  function invokeMethod(method, params, methodName, methodsMap) {
    try {
      return method.apply(methodsMap, params);
    } catch (eri) {
      return 'HANDLER_ERROR';
    }
  }

  function getMethodValue(methodDec, methodName, method, methodsMap) {
    var methodParams = extractMethodParams(methodDec, methodName);
    return invokeMethod(method, methodParams, methodName, methodsMap);
  }

  function replaceMethod(str, methodDec, methodName, method, methodsMap) {
    var methodValue = getMethodValue(methodDec, methodName, method, methodsMap);
    if (str === methodDec) return methodValue;
    return str.replace(methodDec, function() {
      return methodValue;
    });
  }

  function replaceMethods(str, methods, methodsMap) {
    var methodName = "";
    for (var i = 0; i < methods.length; i++) {
      methodName = extractMethodName(methods[i]);
      if (typeof methodsMap[methodName] === 'function') {
        str = replaceMethod(str, methods[i], methodName, methodsMap[methodName], methodsMap);
      }
    }
    return str;
  }

  function replaceString(input, vars, methods) {
    var str;
    while (typeof input === 'string' && str != input) {
      str = input;
      input = replaceVariables(input, extractVars(input), vars, methods);
    }
    if (typeof input !== 'string') return input;
    return replaceMethods(input, extractMethods(input), methods);
  }

  function mainReplace(input, vars, methods) {
    if (typeof input !== 'object' || !input) {
      return replaceString(input, vars, methods);
    }
    input = handleFunction(input, vars, methods);
    WALK_INTO(function(valn, key, rt) {
      if (typeof rt === 'object' && rt && typeof rt.hasOwnProperty === 'function' && rt.hasOwnProperty(key)) {
        var val = rt[key],
          tmpKy = null,
          isth = isWithVars(key);
        if (isth) {
          tmpKy = replaceString(key, vars, methods);
          if (tmpKy !== key) {
            val = rt[tmpKy] = rt[key];
            delete rt[key];
          }
        }
        if (typeof val === 'string' && val) {
          isth = isWithVars(val);
          if (isth) {
            rt[tmpKy || key] = replaceString(val, vars, methods);
          }
        } else {
          rt[tmpKy || key] = handleFunction(val, vars, methods);
        }
      }
    }, null, input);
    return input;
  }

  return mainReplace;
});
var START_VAR = '\{\{',
  END_VAR = '\}\}';
var MainConfig = {
  maxobjdepth: 99,
  startvar: START_VAR,
  endvar: END_VAR,
  functionkey: '@',
  walkendkey: '$W_END',
  notfoundvalue: 'VAR_NOT_FOUND',
  variableregex: new RegExp('\(' + START_VAR + '\[a-zA-Z0-9\\$\\.\_\]+' + END_VAR + '\)\+', 'g'),
  functionregex: new RegExp('\(' + START_VAR + '\[a-zA-Z0-9\_\]+\\(\.\*\?\\)' + END_VAR + '\)\+', 'g')
};

var utils = {};

utils.objwalk = WALK(MainConfig, utils);
utils.objwalk.create = WALK;
utils.isAlphaNum = IS_AN(MainConfig, utils);
utils.isAlphaNum.create = IS_AN;
utils.assign = ASSIGN(MainConfig, utils);
utils.assign.create = ASSIGN;

var TEMPLIST = WRAP(MainConfig, utils);
TEMPLIST.config = MainConfig;
TEMPLIST.utils = utils;
TEMPLIST.create = WRAP;
module.exports = TEMPLIST;