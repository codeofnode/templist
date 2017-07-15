# The Templist
> The templating specialist

## Install
```
$ npm install templist
```

## Usage
```js
const templist = require('templist');
const myoutput = templist( AnyStringOrPOJO,
                          { variable : 'map' },
                          { OptionalMethods: function(inp){ return modify(inp) } });
```

## What it can do
```txt
templist('hello {{whois}}', { whois : "john" }) --> 'hello john'
templist('hello {{whois.firstname}}', { whois : { firstname: "john" } }) --> 'hello john'
templist({ hello : "{{whois.firstname}}" }, { whois : { firstname: "john" } }) --> { hello : "john" }
templist({ "{{greet}}" : "{{whois.firstname}}" }, { greet : "hello", whois : { firstname: "john" } })
      --> { hello : "john" }
templist({ "{{greet}}" : "{{whois}}" }, { greet : "hello", whois : { firstname: 'john' } })
      --> { hello : { firstname: 'john' } }
templist({ "{{greet}}" : { @ : 'getName' } }, { greet : "hello" }, { getName : function(){ return 'john' } })
      --> { hello : 'john' }
```

## Want more example?
> See [test file](https://github.com/codeofnode/templist/blob/master/test.js).

## License

Templist is released under the MIT license:

http://www.opensource.org/licenses/MIT
