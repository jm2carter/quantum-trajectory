_Pragma("once");

#include"trajectory1dim.h"

namespace trajectory{
class Classical_ final:public Trajectory1dim_
{
  public:
    Classical_(ReactionCoordinate_ const&,double const,double const);
    std::vector<double>Derivative(std::vector<double>const&)const&override;
    [[gnu::pure]]double Transmission(double const)const&noexcept override;
    [[gnu::pure]]double Energy()const&noexcept override;
};
}
