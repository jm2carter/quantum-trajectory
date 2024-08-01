import sys
sys.path.append('potential')

from reflection import *

XRight,YBottom=sympy.symbols('XRight,YBottom',real=True)

print('''constexpr double upperRight(double const X,double const Y,double const XRight)
{return '''+sympy.ccode((reflection.subs({x:0,y:1})^numpy.dot([x-XRight,y-XRight*sympy.tan(sympy.pi/6)],base.mv())).blade_coefs([base.I()])[0])+''';}

constexpr double upperLeft(double const X,double const Y,double const YBottom)
{return '''+sympy.ccode((reflection.subs({x:1,y:0})^numpy.dot([x-YBottom/sympy.tan(sympy.pi/6),y-YBottom],base.mv())).blade_coefs([base.I()])[0])+''';}''',file=open('boundary.h','w'))
