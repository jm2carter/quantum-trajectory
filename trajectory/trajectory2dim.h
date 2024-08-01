_Pragma("once");

#include"../potential/oscillator.h"
#include"trajectory1dim.h"

namespace trajectory{
class Trajectory2dim_ final:public Trajectory_
{
  public:
    Oscillator_ const&Oscillator;
    Trajectory1dim_&trajectory1dim;
  public:
    Trajectory2dim_(Oscillator_ const&,Trajectory1dim_&,std::vector<double>const&);
    std::vector<double>Derivative(std::vector<double>const&)const&override;
    [[gnu::pure]]double OscillationEnergy()const&noexcept;
    std::vector<double>Transmission(double const)const&noexcept;
    [[gnu::pure]]std::vector<double>Get()const&noexcept override;
    void Set(std::vector<double>const&)noexcept override;
};
}
