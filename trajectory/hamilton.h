_Pragma("once");

#include"quantum.h"

namespace trajectory{
class Hamilton_:public Quantum_
{
  public:
    Hamilton_(ReactionCoordinate_ const&,double const,double const);
    std::vector<double>Derivative(std::vector<double>const&)const&override;
    [[gnu::pure]]double Velocity()const&noexcept override final;
    [[gnu::pure]]double Momentum()const&noexcept override final;
    [[gnu::pure]]double Energy()const&noexcept override final;
    [[gnu::pure]]double Acceleration()const&noexcept override final;
};
}
