import sympy

BarrierHeight,BarrierWidth,Mass=sympy.symbols('this->BarrierHeight,this->BarrierWidth,this->Mass',real=True)
Couple=sympy.symbols('Couple',real=True)

AngularFrequency=sympy.symbols('this->AngularFrequency',real=True)

MorseWidth=sympy.symbols('this->MorseWidth',real=True)
WellDepth=sympy.symbols('this->WellDepth',real=True)

EquilibriumDistance=sympy.symbols('this->EquilibriumDistance',real=True)
Theta=sympy.symbols('this->Theta',real=True)

X,Y=sympy.symbols('X,Y',real=True)

Morse=WellDepth*(1-sympy.exp(-MorseWidth*Y))**2

Perpendiculars={'EckartPure':0,'Harmonic':Mass/2*(AngularFrequency*Y)**2,'EckartMorse':Morse,'EckartAffineMorse':Morse.subs(Y,Y/sympy.cos(Theta)-EquilibriumDistance)-WellDepth}

def eckart(Perpendicular):return BarrierHeight*sympy.sech(BarrierWidth*X)**2+(1+Couple*sympy.sech(BarrierWidth*X)**2)*Perpendiculars[Perpendicular]

def leps():
    Distance,Overlap=sympy.symbols('Distance,this->Overlap',real=True)
    AB=X-Y*sympy.tan(Theta)
    BC=Y/sympy.cos(Theta)
    CA=AB+BC
    morse=Morse.subs(Y,Distance-EquilibriumDistance)-WellDepth
    antimorse=WellDepth/2*((1+sympy.exp(-MorseWidth*(Distance-EquilibriumDistance)))**2-1)
    coulomb=((1+Overlap)*morse+(1-Overlap)*antimorse)/2
    exchange=((1+Overlap)*morse-(1-Overlap)*antimorse)/2
    return (coulomb.subs(Distance,AB)+coulomb.subs(Distance,BC)+coulomb.subs(Distance,CA)-sympy.sqrt(((exchange.subs(Distance,AB)-exchange.subs(Distance,BC))**2+(exchange.subs(Distance,BC)-exchange.subs(Distance,CA))**2+(exchange.subs(Distance,CA)-exchange.subs(Distance,AB))**2)/2))/(1+Overlap)

def perpendicular(Perpendicular):
    if Perpendicular!='EckartPure':
        return '''\n\ndouble '''+Perpendicular+'''_::DerivativeY(double const X,double const Y)const&noexcept
{return '''+sympy.ccode(eckart(Perpendicular).diff(Y).subs(sympy.sech(BarrierWidth*X)**2,1-sympy.tanh(BarrierWidth*X)**2))+''';}

double '''+Perpendicular+'''_::DerivativeY2(double const X,double const Y)const&noexcept
{return '''+sympy.ccode(eckart(Perpendicular).diff(Y,2).subs(sympy.sech(BarrierWidth*X)**2,1-sympy.tanh(BarrierWidth*X)**2))+''';}

double '''+Perpendicular+'''_::DerivativeYX(double const X,double const Y)const&noexcept
{return '''+sympy.ccode(eckart(Perpendicular).diff(X).diff(Y).subs(sympy.sech(BarrierWidth*X)**2,1-sympy.tanh(BarrierWidth*X)**2))+''';}'''
    return ''

for Perpendicular in Perpendiculars.keys():
    print('''#include<cmath>
#include"'''+Perpendicular[0].lower()+Perpendicular[1:]+'''.h"

double '''+Perpendicular+'''_::Potential(double const X,double const Y)const&noexcept
{return '''+sympy.ccode(eckart(Perpendicular).subs(sympy.sech(BarrierWidth*X)**2,1-sympy.tanh(BarrierWidth*X)**2))+''';}

double '''+Perpendicular+'''_::Derivative(double const X,double const Y)const&noexcept
{return '''+sympy.ccode(eckart(Perpendicular).diff(X).subs(sympy.sech(BarrierWidth*X)**2,1-sympy.tanh(BarrierWidth*X)**2))+''';}

double '''+Perpendicular+'''_::Derivative2(double const X,double const Y)const&noexcept
{return '''+sympy.ccode(eckart(Perpendicular).diff(X,2).subs(sympy.sech(BarrierWidth*X)**2,1-sympy.tanh(BarrierWidth*X)**2))+''';}'''+perpendicular(Perpendicular),file=open(Perpendicular[0].lower()+Perpendicular[1:]+'Derivative.cpp','w'))

for Perpendicular in Perpendiculars.keys():
    if Perpendicular!='EckartPure' and Perpendicular!='Harmonic':
        Oscillator=Perpendicular.replace('Eckart','')
        print('''#include<cmath>
#include"'''+Oscillator[0].lower()+Oscillator[1:]+'''.h"
double '''+Oscillator+'''_::Product(double const Y)const&noexcept
{return '''+sympy.ccode(Perpendiculars[Perpendicular])+''';}

double '''+Oscillator+'''_::ProductDerivative(double const Y)const&noexcept
{return '''+sympy.ccode(Perpendiculars[Perpendicular].diff(Y))+''';}''',file=open(Oscillator[0].lower()+Oscillator[1:]+'Derivative.cpp','w'))

print('''\ndouble Harmonic_::Product(double const Y)const&noexcept
{return '''+sympy.ccode(Perpendiculars['Harmonic'])+''';}''',file=open('harmonicDerivative.cpp','a'))

print('''#include<cmath>
#include"leps.h"

double Leps_::Potential(double const X,double const Y)const&noexcept
{return '''+sympy.ccode(leps())+''';}

double Leps_::Derivative(double const X,double const Y)const&noexcept
{return '''+sympy.ccode(leps().diff(X))+''';}

double Leps_::Derivative2(double const X,double const Y)const&noexcept
{return '''+sympy.ccode(leps().diff(X,2))+''';}

double Leps_::DerivativeY(double const X,double const Y)const&noexcept
{return '''+sympy.ccode(leps().diff(Y))+''';}

double Leps_::DerivativeY2(double const X,double const Y)const&noexcept
{return '''+sympy.ccode(leps().diff(Y,2))+''';}

double Leps_::DerivativeYX(double const X,double const Y)const&noexcept
{return '''+sympy.ccode(leps().diff(X).diff(Y))+''';}''',file=open('lepsDerivative.cpp','w'))
