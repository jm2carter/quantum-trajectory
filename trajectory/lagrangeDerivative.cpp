#include"lagrange.h"
std::vector<double>trajectory::Lagrange_::Derivative(std::vector<double>const&Function)const&
{
  std::vector<double>derivative(4);
  std::copy(Function.cbegin()+1,Function.cend(),derivative.begin());
  derivative.at(3)=2*(-2*pow(Function.at(1), 6)*this->ReactionCoordinate.Mass*(Function.at(2)*this->ReactionCoordinate.Mass + this->ReactionCoordinate.Derivative(Function.front(),*(Function.cend()-2))) + 4*Function.at(1)*Function.at(2)*Function.at(3) - 5*pow(Function.at(2), 3))/pow(Function.at(1), 2);
  return derivative;
}

double trajectory::Lagrange_::Energy()const&noexcept
{
  auto const Trajectory(this->Get());
  return (1.0L/2.0L)*pow(Trajectory.at(1), 2)*this->ReactionCoordinate.Mass + (1.0L/4.0L)*Trajectory.at(3)/(pow(Trajectory.at(1), 3)*this->ReactionCoordinate.Mass) - 5.0L/8.0L*pow(Trajectory.at(2), 2)/(pow(Trajectory.at(1), 4)*this->ReactionCoordinate.Mass);
}

double trajectory::Lagrange_::Momentum()const&noexcept
{
  auto const Trajectory(this->Get());
  return Trajectory.at(1)*this->ReactionCoordinate.Mass + ((1.0L/4.0L)*Trajectory.at(3)/pow(Trajectory.at(1), 4) - 1.0L/2.0L*pow(Trajectory.at(2), 2)/pow(Trajectory.at(1), 5))/this->ReactionCoordinate.Mass;
}
