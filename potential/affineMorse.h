_Pragma("once");

#include"morse.h"
#include<cmath>

class AffineMorse_:public Morse_
{
  public:
    static constexpr double EquilibriumDistance{1.40112},Theta{M_PI/6};
  public:
    constexpr AffineMorse_(double const=1837.2893*2/3,double const=1.0288158995136472,double const=0.174454);
    [[gnu::pure]]double OscillationEnergy(std::decimal::decimal32 const)const&noexcept override final;
    [[gnu::pure]]double OscillationMax(double const)const&noexcept override final;
    [[gnu::pure]]double OscillationMin(double const)const&noexcept override final;
    [[gnu::pure]]double Period(double const)const&noexcept override final;
    [[gnu::pure]]double Product(double const)const&noexcept override final;
    [[gnu::pure]]double ProductDerivative(double const)const&noexcept override final;
};

constexpr AffineMorse_::AffineMorse_(double const Mass,double const MorseWidth,double const WellDepth):Morse_{Mass,MorseWidth/std::cos(Theta)*std::sqrt(2*WellDepth/Mass),MorseWidth,WellDepth}{} 
