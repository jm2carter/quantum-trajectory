#include<cmath>
#include"morse.h"
double Morse_::Product(double const Y)const&noexcept
{return this->WellDepth*pow(1 - exp(-Y*this->MorseWidth), 2);}

double Morse_::ProductDerivative(double const Y)const&noexcept
{return 2*this->MorseWidth*this->WellDepth*(1 - exp(-Y*this->MorseWidth))*exp(-Y*this->MorseWidth);}
