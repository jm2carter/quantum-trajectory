_Pragma("once");

#include"../potential/reactionCoordinate.h"
#include"trajectory.h"

namespace trajectory{
class Trajectory1dim_:public Trajectory_
{
  protected:
    ReactionCoordinate_ const&ReactionCoordinate;
  private:
    std::vector<double>trajectory;
  public:
    Trajectory1dim_(ReactionCoordinate_ const&);
    [[gnu::pure]]virtual double Transmission(double const)const&noexcept=0;
    [[gnu::pure]]virtual double Energy()const&noexcept=0;
    [[gnu::pure]]std::vector<double>Get()const&noexcept override final;
    void Set(std::vector<double>const&)noexcept override final;
};
}
