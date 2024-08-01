#include"leps.h"

std::array<double,2>Leps_::reflection(double const X,double const Y)noexcept
{return {(1.0L/2.0L)*X + (1.0L/2.0L)*sqrt(3)*Y,(1.0L/2.0L)*sqrt(3)*X - 1.0L/2.0L*Y};}
