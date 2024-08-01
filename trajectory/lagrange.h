_Pragma("once");

#include"quantum.h"

namespace trajectory{
class Lagrange_:public Quantum_
{
  public:
    Lagrange_(ReactionCoordinate_ const&,double const,double const);
    std::vector<double>Derivative(std::vector<double>const&)const&override;
    [[gnu::pure]]double Velocity()const&noexcept override final;
    [[gnu::pure]]double Momentum()const&noexcept override final;
    [[gnu::pure]]double Energy()const&noexcept override final;
    [[gnu::pure]]double Acceleration()const&noexcept override final;
};
}

//n4567(14.8.1.7)Because the explicit template argument list follows the function template name, and because conversion member function templates and constructor member function templates are called without using a function name, there is no way to provide an explicit template argument list for these function templates.
