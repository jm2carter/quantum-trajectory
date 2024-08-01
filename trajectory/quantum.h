_Pragma("once");

#include"trajectory1dim.h"
#include<complex>

namespace trajectory{
class Quantum_:public Trajectory1dim_
{
  public:
    using Trajectory1dim_::Trajectory1dim_;
    [[gnu::pure]]virtual double Velocity()const&noexcept=0;
    [[gnu::pure]]virtual double Momentum()const&noexcept=0;
    [[gnu::pure]]double Transmission(double const)const&noexcept override final;
    std::array<std::complex<double>,2>split(std::function<void()>const& =nullptr);
    [[gnu::pure]]virtual double Acceleration()const&noexcept=0;
};
}
