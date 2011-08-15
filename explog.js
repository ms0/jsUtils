Math.sgn = function (x) {
  return x<0?-1:x>0?1:x;
}

Math.log1p = function (x) {
  var xp1 = x+1;
  return xp1==1?x:Math.log(xp1)*x/(xp1-1);
}

Math.expm1 = function (x) {
  var ex = Math.exp(x);
  var em1 = ex-1;
  return ex==1?x:em1==-1?-1:isFinite(ex)?em1*x/Math.log(ex):ex;
}


Math.sinh = function(x) {
  return .5*(Math.expm1(x)-Math.expm1(-x));
}

Math.cosh = function(x) {
  return .5*(Math.exp(x)+Math.exp(-x));
}

Math.coshm1 = function(x) {
  var s = Math.sinh(.5*x);
  return 2*s*s;
}

Math.tanh = function(x) {
  var s = Math.sinh(x);
  return isFinite(s) ? s/Math.cosh(x) : sgn(x);
}

Math.atanh = function(x) {
  return .5*(Math.log1p(x)-Math.log1p(-x));
}

Math.asinh = function(x) {
  var s = Math.sqrt(1+x*x);
  return s<Math.SQRT2 ? Math.atanh(x/s) : Math.sgn(x)*Math.log(Math.abs(x)+s);
}

Math.acosh1p = function(x) {
  var s = x*(x+2);
  return isFinite(s) ? Math.log1p(x+Math.sqrt(s)) : Math.log(x)+Math.LN2;
}

Math.acosh = function(x) {
  var s = x*x-1;
  return isFinite(s) ? Math.log(x+Math.sqrt(s)) : Math.log(x)+Math.LN2;
}
