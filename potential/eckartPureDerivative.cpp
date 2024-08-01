#include<cmath>
#include"eckartPure.h"

double EckartPure_::Potential(double const X,double const Y)const&noexcept
{return this->BarrierHeight*(-pow(tanh(X*this->BarrierWidth), 2) + 1);}

double EckartPure_::Derivative(double const X,double const Y)const&noexcept
{return -2*this->BarrierHeight*this->BarrierWidth*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*tanh(X*this->BarrierWidth);}

double EckartPure_::Derivative2(double const X,double const Y)const&noexcept
{return 2*this->BarrierHeight*pow(this->BarrierWidth, 2)*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*(3*pow(tanh(X*this->BarrierWidth), 2) - 1);}
