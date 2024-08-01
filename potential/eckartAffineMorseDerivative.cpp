#include<cmath>
#include"eckartAffineMorse.h"

double EckartAffineMorse_::Potential(double const X,double const Y)const&noexcept
{return this->BarrierHeight*(-pow(tanh(X*this->BarrierWidth), 2) + 1) + (Couple*(-pow(tanh(X*this->BarrierWidth), 2) + 1) + 1)*(this->WellDepth*pow(1 - exp(-this->MorseWidth*(Y/cos(this->Theta) - this->EquilibriumDistance)), 2) - this->WellDepth);}

double EckartAffineMorse_::Derivative(double const X,double const Y)const&noexcept
{return -2*Couple*this->BarrierWidth*(this->WellDepth*pow(1 - exp(-this->MorseWidth*(Y/cos(this->Theta) - this->EquilibriumDistance)), 2) - this->WellDepth)*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*tanh(X*this->BarrierWidth) - 2*this->BarrierHeight*this->BarrierWidth*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*tanh(X*this->BarrierWidth);}

double EckartAffineMorse_::Derivative2(double const X,double const Y)const&noexcept
{return 2*pow(this->BarrierWidth, 2)*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*(Couple*this->WellDepth*(pow(1 - exp(-this->MorseWidth*(Y/cos(this->Theta) - this->EquilibriumDistance)), 2) - 1)*(pow(tanh(X*this->BarrierWidth), 2) - 1) + 2*Couple*this->WellDepth*(pow(1 - exp(-this->MorseWidth*(Y/cos(this->Theta) - this->EquilibriumDistance)), 2) - 1)*pow(tanh(X*this->BarrierWidth), 2) + this->BarrierHeight*(pow(tanh(X*this->BarrierWidth), 2) - 1) + 2*this->BarrierHeight*pow(tanh(X*this->BarrierWidth), 2));}

double EckartAffineMorse_::DerivativeY(double const X,double const Y)const&noexcept
{return 2*this->MorseWidth*this->WellDepth*(1 - exp(-this->MorseWidth*(Y/cos(this->Theta) - this->EquilibriumDistance)))*(Couple*(-pow(tanh(X*this->BarrierWidth), 2) + 1) + 1)*exp(-this->MorseWidth*(Y/cos(this->Theta) - this->EquilibriumDistance))/cos(this->Theta);}

double EckartAffineMorse_::DerivativeY2(double const X,double const Y)const&noexcept
{return 2*pow(this->MorseWidth, 2)*this->WellDepth*(-1 + 2*exp(-this->MorseWidth*(Y/cos(this->Theta) - this->EquilibriumDistance)))*(Couple*(-pow(tanh(X*this->BarrierWidth), 2) + 1) + 1)*exp(-this->MorseWidth*(Y/cos(this->Theta) - this->EquilibriumDistance))/pow(cos(this->Theta), 2);}

double EckartAffineMorse_::DerivativeYX(double const X,double const Y)const&noexcept
{return -4*Couple*this->BarrierWidth*this->MorseWidth*this->WellDepth*(1 - exp(-this->MorseWidth*(Y/cos(this->Theta) - this->EquilibriumDistance)))*(-pow(tanh(X*this->BarrierWidth), 2) + 1)*exp(-this->MorseWidth*(Y/cos(this->Theta) - this->EquilibriumDistance))*tanh(X*this->BarrierWidth)/cos(this->Theta);}
