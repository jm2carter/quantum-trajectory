_Pragma("once");

#include<chrono>
#include<functional>

namespace trajectory{
class Trajectory_
{
  public:
    Trajectory_()=default;
    Trajectory_(Trajectory_&&)=delete;
    virtual std::vector<double>Derivative(std::vector<double>const&)const& =0;
    bool reactant(std::function<bool(decltype(std::chrono::steady_clock::now())const)>const& =nullptr,std::function<void(double const)>const& =nullptr);
    [[gnu::pure]]virtual std::vector<double>Get()const&noexcept=0;
    virtual void Set(std::vector<double>const&)noexcept=0;
  protected:
    ~Trajectory_()=default;
};
}
