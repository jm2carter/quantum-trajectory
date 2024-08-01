_Pragma("once");

#include<utility>

class Eckart_
{
  public:
    double const BarrierHeight,BarrierWidth;
    constexpr Eckart_(double const,double const);
    [[gnu::pure]]double Analytic(double const,double const)const&noexcept;
};

constexpr Eckart_::Eckart_(double const BarrierHeight,double const BarrierWidth):BarrierHeight{BarrierHeight},BarrierWidth{BarrierWidth}{}
