#include<cmath>
#include"affineMorse.h"
double AffineMorse_::Product(double const Y)const&noexcept
{return this->WellDepth*pow(1 - exp(-this->MorseWidth*(Y/cos(this->Theta) - this->EquilibriumDistance)), 2) - this->WellDepth;}

double AffineMorse_::ProductDerivative(double const Y)const&noexcept
{return 2*this->MorseWidth*this->WellDepth*(1 - exp(-this->MorseWidth*(Y/cos(this->Theta) - this->EquilibriumDistance)))*exp(-this->MorseWidth*(Y/cos(this->Theta) - this->EquilibriumDistance))/cos(this->Theta);}
