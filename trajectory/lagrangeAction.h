_Pragma("once");

#include"lagrange.h"

namespace trajectory{
class LagrangeAction_ final:public Lagrange_
{
  public:
    LagrangeAction_(ReactionCoordinate_ const&,double const,double const);
    std::vector<double>Derivative(std::vector<double>const&)const&override;
};
}
