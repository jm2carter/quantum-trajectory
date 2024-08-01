#include<boost/numeric/odeint.hpp>
#include"trajectory.h"

bool trajectory::Trajectory_::reactant(std::function<bool(decltype(std::chrono::steady_clock::now())const)>const&TimeControl,std::function<void(double const)>const&Observe)
{
  auto stepper(boost::numeric::odeint::bulirsch_stoer<std::vector<double>>(1e-10,1e-10));
  //auto stepper(boost::numeric::odeint::make_controlled<boost::numeric::odeint::runge_kutta_dopri5<std::vector<double>>>(1e-10,1e-10));
  auto trajectory(this->Get());
  double const Position{trajectory.front()};
  auto const Start(std::chrono::steady_clock::now());
  for(double time{},stepsize{-1e-10};trajectory.front()>-Position&&trajectory.front()<Position*1.1&&(TimeControl?TimeControl(Start):true);)
  {
    if(Observe)
    {
      this->Set(trajectory);
      Observe(time);
    }
    stepper.try_step([&](auto const&function,auto&dervative,auto const){dervative=this->Derivative(function);},trajectory,time,stepsize);
    if(std::abs(stepsize)<=10*std::numeric_limits<double>::epsilon()) throw std::underflow_error("a step size could not be found.")/*false*/;
  }
  this->Set(trajectory);
  return trajectory.front()>-Position&&trajectory.front()<Position?false:true;
}
