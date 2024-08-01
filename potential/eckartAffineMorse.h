_Pragma("once");

#include"eckart.h"
#include"affineMorse.h"

class EckartAffineMorse_ final:public Eckart_,public AffineMorse_
{
  public:
    constexpr EckartAffineMorse_();
    [[gnu::pure]]double Potential(double const,double const)const&noexcept override;
    [[gnu::pure]]double Derivative(double const,double const)const&noexcept override;
    [[gnu::pure]]double Derivative2(double const,double const)const&noexcept override;
    [[gnu::pure]]double DerivativeY(double const,double const)const&noexcept override;
    [[gnu::pure]]double DerivativeY2(double const,double const)const&noexcept override;
    [[gnu::pure]]double DerivativeYX(double const,double const)const&noexcept override;
    std::size_t MaxActionVariable()const&override;
};

constexpr EckartAffineMorse_::EckartAffineMorse_():Eckart_{0.013456741836102765,M_PI/2.306}{}
