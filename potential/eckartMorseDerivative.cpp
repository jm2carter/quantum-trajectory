#include<cmath>
#include"eckartMorse.h"

double EckartMorse_::Potential(double const X,double const Y)const&noexcept
{return this->BarrierHeight*(-pow(tanh(X*this->BarrierWidth), 2) + 1) + this->WellDepth*pow(1 - exp(-Y*this->MorseWidth), 2)*(Couple*(-pow(tanh(X*this->BarrierWidth), 2) + 1) + 1);}

double EckartMorse_::Derivative(double const X,double const Y)const&noexcept
{return -2*Couple*this->BarrierWidth*this->WellDepth*pow(1 - exp(-Y*this->MorseWidth), 2)*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*tanh(X*this->BarrierWidth) - 2*this->BarrierHeight*this->BarrierWidth*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*tanh(X*this->BarrierWidth);}

double EckartMorse_::Derivative2(double const X,double const Y)const&noexcept
{return 2*pow(this->BarrierWidth, 2)*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*(Couple*this->WellDepth*pow(1 - exp(-Y*this->MorseWidth), 2)*(pow(tanh(X*this->BarrierWidth), 2) - 1) + 2*Couple*this->WellDepth*pow(1 - exp(-Y*this->MorseWidth), 2)*pow(tanh(X*this->BarrierWidth), 2) + this->BarrierHeight*(pow(tanh(X*this->BarrierWidth), 2) - 1) + 2*this->BarrierHeight*pow(tanh(X*this->BarrierWidth), 2));}

double EckartMorse_::DerivativeY(double const X,double const Y)const&noexcept
{return 2*this->MorseWidth*this->WellDepth*(1 - exp(-Y*this->MorseWidth))*(Couple*(-pow(tanh(X*this->BarrierWidth), 2) + 1) + 1)*exp(-Y*this->MorseWidth);}

double EckartMorse_::DerivativeY2(double const X,double const Y)const&noexcept
{return 2*pow(this->MorseWidth, 2)*this->WellDepth*(-1 + 2*exp(-Y*this->MorseWidth))*(Couple*(-pow(tanh(X*this->BarrierWidth), 2) + 1) + 1)*exp(-Y*this->MorseWidth);}

double EckartMorse_::DerivativeYX(double const X,double const Y)const&noexcept
{return -4*Couple*this->BarrierWidth*this->MorseWidth*this->WellDepth*(1 - exp(-Y*this->MorseWidth))*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*exp(-Y*this->MorseWidth)*tanh(X*this->BarrierWidth);}
