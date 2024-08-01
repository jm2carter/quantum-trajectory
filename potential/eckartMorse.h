_Pragma("once");

#include"eckartPure.h"
#include"morse.h"

class EckartMorse_ final:public Eckart_,public Morse_
{
  public:
    constexpr EckartMorse_(double const=Eckart.BarrierHeight,double const=0.7);
    [[gnu::pure]]double Potential(double const,double const)const&noexcept override;
    [[gnu::pure]]double Derivative(double const,double const)const&noexcept override;
    [[gnu::pure]]double Derivative2(double const,double const)const&noexcept override;
    [[gnu::pure]]double DerivativeY(double const,double const)const&noexcept override;
    [[gnu::pure]]double DerivativeY2(double const,double const)const&noexcept override;
    [[gnu::pure]]double DerivativeYX(double const,double const)const&noexcept override;
    std::size_t MaxActionVariable()const&override;
};

#include<cmath>

constexpr EckartMorse_::EckartMorse_(double const AngularFrequency,double const MorseWidth):Eckart_{Eckart},Morse_{Eckart.Mass,AngularFrequency,MorseWidth,Eckart.Mass/2*std::pow(AngularFrequency/MorseWidth,2)}{}
