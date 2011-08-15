/* Methods to serialize and parse standard javascript datastructures:
   Arrays
   Dictionary Objects
   Dates
   Strings
   RegExps
   Numbers, including Infinity and -Infinity and NaN
   Booleans
   Functions
   null
   undefined
*/

// Delimiters et al are designed to not need "escape"ing:
// WARNING: Can't use number parts: Ee+-.0123456789
var TERMINATOR='*';        // ] }
var DELIMITER='/';         // ,
var reDELIMITER = /\//g;
var ArraySTART='A';        // [
var DictionarySTART='D';   // {
var DateSTART='T';         // followed by number
var RegExpSTART='R';       // / uses StringDELIMITER followed by octit
var StringDELIMITER='@';   // '
var reStringDELIMITER = /@/g;
var StringESC='/';        // \
var FunctionSTART='F';    // name/arg0/arg1/...argn*{
var PInfinity='I';        // Infinity
var MInfinity='i';        // -Infinity
var NAN='N'               // NaN
var False='f';            // false
var True='t';             // true
var Null='n'              // null
var Undefined='u'         // undefined

function serialize(o) {
  var s;
  var t;
  var k;
  if (o == null) return o-0==0 ? Null : Undefined;
  switch (o.constructor.name) {
  case 'Array':
    s = ArraySTART;
    t = '';
    for (k in o) {
      s+=t+serialize(o[k]);
      t = DELIMITER;
    }
    return (s+TERMINATOR);
  case 'Object':
    s = DictionarySTART;
    t = '';
    for (k in o) {
      s+=t+k.replace(reDELIMITER,DELIMITER+DELIMITER).replace(reStringDELIMITER,DELIMITER+StringDELIMITER)+StringDELIMITER+serialize(o[k]);
      t = DELIMITER;
    }
    return (s+TERMINATOR);
  case 'Function':
    return FunctionSTART+(o+'').slice(9).replace(reDELIMITER,DELIMITER+DELIMITER).replace(reStringDELIMITER,DELIMITER+StringDELIMITER)+StringDELIMITER;
  case 'Number':
    if (isNaN(o)) return 'N';
    if (isFinite(o)) {
      if (o) {
	s = (Math.abs(o)+'').replace('+','');
	if (s[0]=='0') s=s.slice(1);
	if (s.slice(-3) == '000') {
	  for (k = 3; s[s.length-1-k] == '0'; k++) ;
	  s = s.slice(0,-k)+'e'+k;
	}
	return o<0?'-'+s:s;
      }	
      return '0';
    }
    return o<0?'i':'I';
  case 'Boolean':
    return o ? 't':'f';
  case 'String':
    return StringDELIMITER+o.replace(reDELIMITER,DELIMITER+DELIMITER).replace(reStringDELIMITER,DELIMITER+StringDELIMITER)+StringDELIMITER;
  case 'Date':
    return DateSTART+serialize(o.valueOf());
  case 'RegExp':
    return RegExpSTART+o.source.replace(reDELIMITER,DELIMITER+DELIMITER).replace(reStringDELIMITER,DELIMITER+StringDELIMITER)+StringDELIMITER+(o.global*4+o.ignoreCase*2+o.multiline);
  default:
    return '';
  }
}

function deserialize(s) {
  return parse(s)[0];
}

function parsestring(s) {
  var n;
  var o = '';
  for (n=1;n<s.length;n++) {
    switch (s[n]) {
    case DELIMITER:
      o += s[++n];
      continue;
    case StringDELIMITER:
      return [o,s.slice(n+1)];
    default:
      o += s[n];
    }
  }
  throw "parse error: ran out of characters while parsing string";
}

function parse(s) {
  var o = null; // object being created
  var k;        // key while parsing dictionary entry, or modifiers in regexp
  var v;        // value while parsing dictionary entry; or number string
  if (s.length=0) throw "parse error: no characters while parsing object";
  switch(s[0]){
  case TERMINATOR:
  case DELIMITER:
    throw "parse error: delimiter or terminator instead of object";
  case True:
    return [true,s.slice(1)];
  case False:
    return [false,s.slice(1)];
  case PInfinity:
    return [Infinity,s.slice(1)];
  case MInfinity:
    return [-Infinity,s.slice(1)];
  case NAN:
    return [NaN,s.slice(1)];
  case Null:
    return [null,s.slice(1)];
  case Undefined:
    return [undefined,s.slice(1)];
  case StringDELIMITER:
    return parsestring(s);
  case RegExpSTART:
    v = parsestring(s);
    k = v[1][0]-0;    // numerical encoding of modifiers
    return [RegExp(v[0],((k&4)?'g':'')+((k&2)?'i':'')+((k&1)?'m':'')),v[1].slice(1)];
  case ArraySTART:
    s = s.slice(1);
    o = [];
    while (s[0] != TERMINATOR) {
      v = parse(s);
      s = v[1];
      o.push(v[0]);
      if (s[0] == TERMINATOR) return [o,s.slice(1)];
      if (s[0] != DELIMITER) throw "parse error: array entry doesn't end with delimiter or terminator";
      s = s.slice(1);
    }
    return [o,s.slice(1)];
  case DictionarySTART:
    o = {};
    while (s[1] != TERMINATOR) {
      v = parsestring(s);    // parsestring assumes initial StringDELIMITER
      s = v[1];
      k = v[0];
      v = parse(s);
      o[k] = v[0];
      s = v[1];
      if (s[0] == TERMINATOR) return [o,s.slice(1)]
      if (s[0] != DELIMITER) throw "parse error: dictionary entry doesn't end with delimiter or terminator";
    }
    return [o,s.slice(2)];
  case DateSTART:
    v = parse(s.slice(1));
    v[0] = new Date(v[0]);
    return v;
  case FunctionSTART:
    v = parsestring(s);
    eval('v[0] = function '+v[0]);
    return v;
  default:
    // better be a number!!!
    v = /^(\+|-)?((\d+\.?\d*)|(\d*\.?\d+))([Ee](\+|-)?\d+)?/.exec(s);
    if (!v) throw "parse error: unexpected character while parsing number";
    return [parseFloat(v[0]),s.slice(v[0].length)];
  }
}
