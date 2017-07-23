var templist = require('./index');
var assert = require('assert');

assert.equal(templist(),undefined);
assert.equal(templist(2),2);
assert.equal(templist(true),true);
assert.equal(templist(false),false);
assert.equal(templist(-1),-1);
assert.equal(templist(''),'');
assert.equal(templist(null),null);
assert.equal(templist(undefined),undefined);
assert.equal(templist('ab'),'ab');
assert.equal(typeof templist(function(){}), 'function');
assert.equal(templist(undefined,{}),undefined);
assert.equal(templist(2,{}),2);
assert.equal(templist(true,{}),true);
assert.equal(templist(false,{}),false);
assert.equal(templist(-1,{}),-1);
assert.equal(templist('',{}),'');
assert.equal(templist(null,{}),null);
assert.equal(templist('ab',{}),'ab');
assert.equal(typeof templist(function(){},{}), 'function');

assert.equal(templist('{{ab}}',{ab:1}),1);
assert.equal(templist('{{ab}}-1',{ab:1}),'1-1');
assert.equal(templist('{{ab}}-1',{ab:false}),'false-1');
assert.equal(templist('go{{ab3}}-1',{ab:false}),'go{{ab3}}-1');
assert.equal(templist('go{{ab}}-1',{ab:false}),'gofalse-1');
assert.equal(templist('go{{ab}}-1',{ab:{a:1}}),'go{"a":1}-1');
assert.equal(templist('{{ab}}-1{{bm}}',{ab:1,bm:0}),'1-10');
assert.equal(templist('{{ab}}-1{{bm}}',{ab:false,bm:'0'}),'false-10');
assert.equal(templist('go{{ab3}}-1{{bm}}',{ab:false,bm:'0'}),'go{{ab3}}-10');
assert.equal(templist('go{{ab}}-1{{bm}}',{ab:false,bm:'0'}),'gofalse-10');
assert.equal(templist('go{{ab}}{{bm}}',{ab:false,bm:'0'}),'gofalse0');
assert.deepEqual(templist({"asld{{bm}}":"go{{ab}}-1{{bm}}"},{ab:false,bm:'0'}),{"asld0":"gofalse-10"});
assert.deepEqual(templist({a:["asld{{bm}}","go{{ab}}-1{{bm}}"]},{ab:false,bm:'0'}),{a:["asld0","gofalse-10"]});

assert.deepEqual(templist('{{result.0.output}}',{result : [{ output : {a:1} }]}),{ a: 1 });

// nested property
assert.deepEqual(templist({"asld{{ab.cd.gh.ij}}":"go{{ab.cd.ef}}-1{{xy.z}}"},{ab:{cd:{gh:{ij:'val'}, ef: {newd:'itsobjectvalue'}}},xy:{z:0}}),{asldval: 'go{"newd":"itsobjectvalue"}-10'});

// even accepts functions in third parameter
assert.deepEqual(templist({a:{"@":"func"}},{},{func:function(){ return 'db'; }}),{a:"db"});
assert.deepEqual(templist({"gb{{1}}":{"@":"func"}},['3o','l9'],{func:function(){ return 'db'; }}),{"gbl9":"db"});
assert.deepEqual(templist({"gb{{1}}":{"@":"func","params":true}},['3o','l9'],
      {func:function(a,b,inp){ return inp; }}),{"gbl9":true});
assert.deepEqual(templist({"gb{{1}}":{"@":"func","params":[2,3]}},['3o','l9'],
      {func:function(a,b,inp1,inp2){
        // a = the variable map sent. ['3o','l9'] in this case
        // b = the method map sent. { func : //thefunction } in this case
        // inp1 = the 1st custom parameter sent, [2 in this case]
        // inp2 = the 2nd custom parameter sent, [3 in this case]
        return inp1+inp2;
      }}),{"gbl9":5});

//via calls () fashion
assert.deepEqual(templist({"gb{{1}}{{bm}}{{func(1,{{0}})}}":{"@":"func","params":true}},[3,9],
      {func:function(a,b){ return a+b; }}),{'gb9{{bm}}4': '3,9[object Object]'});
