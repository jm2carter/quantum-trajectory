#include<cmath>
#include"harmonic.h"

double Harmonic_::Potential(double const X,double const Y)const&noexcept
{return (1.0L/2.0L)*pow(Y, 2)*pow(this->AngularFrequency, 2)*this->Mass*(Couple*(-pow(tanh(X*this->BarrierWidth), 2) + 1) + 1) + this->BarrierHeight*(-pow(tanh(X*this->BarrierWidth), 2) + 1);}

double Harmonic_::Derivative(double const X,double const Y)const&noexcept
{return -Couple*pow(Y, 2)*pow(this->AngularFrequency, 2)*this->BarrierWidth*this->Mass*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*tanh(X*this->BarrierWidth) - 2*this->BarrierHeight*this->BarrierWidth*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*tanh(X*this->BarrierWidth);}

double Harmonic_::Derivative2(double const X,double const Y)const&noexcept
{return pow(this->BarrierWidth, 2)*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*(Couple*pow(Y, 2)*pow(this->AngularFrequency, 2)*this->Mass*(pow(tanh(X*this->BarrierWidth), 2) - 1) + 2*Couple*pow(Y, 2)*pow(this->AngularFrequency, 2)*this->Mass*pow(tanh(X*this->BarrierWidth), 2) + 2*this->BarrierHeight*(pow(tanh(X*this->BarrierWidth), 2) - 1) + 4*this->BarrierHeight*pow(tanh(X*this->BarrierWidth), 2));}

double Harmonic_::DerivativeY(double const X,double const Y)const&noexcept
{return Y*pow(this->AngularFrequency, 2)*this->Mass*(Couple*(-pow(tanh(X*this->BarrierWidth), 2) + 1) + 1);}

double Harmonic_::DerivativeY2(double const X,double const Y)const&noexcept
{return pow(this->AngularFrequency, 2)*this->Mass*(Couple*(-pow(tanh(X*this->BarrierWidth), 2) + 1) + 1);}

double Harmonic_::DerivativeYX(double const X,double const Y)const&noexcept
{return -2*Couple*Y*pow(this->AngularFrequency, 2)*this->BarrierWidth*this->Mass*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*tanh(X*this->BarrierWidth);}

double Harmonic_::Product(double const Y)const&noexcept
{return (1.0L/2.0L)*pow(Y, 2)*pow(this->AngularFrequency, 2)*this->Mass;}
