#include"eckart.h"
#include<cmath>

double Eckart_::Analytic(double const Mass,double const Energy)const&noexcept
{
  std::pair<double,double> const FG{std::sqrt(Mass*Energy/2)/this->BarrierWidth,std::sqrt(2*Mass*this->BarrierHeight/std::pow(this->BarrierWidth,2)-0.25)};
  return std::pow(std::sinh(2*M_PI*FG.first),2)/std::cosh(M_PI*(2*FG.first+FG.second))/std::cosh(M_PI*(2*FG.first-FG.second));
}
