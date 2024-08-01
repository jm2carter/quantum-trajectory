_Pragma("once");

#include"hamilton.h"

namespace trajectory{
class HamiltonAction_ final:public Hamilton_
{
  public:
    HamiltonAction_(ReactionCoordinate_ const&,double const,double const);
    std::vector<double>Derivative(std::vector<double>const&)const&override;
};
}
