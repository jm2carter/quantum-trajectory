#include"hamilton.h"
std::vector<double>trajectory::Hamilton_::Derivative(std::vector<double>const&Function)const&
{
  std::vector<double>derivative(4);
  derivative.at(0)=Function.at(2);
  derivative.at(1)=-this->ReactionCoordinate.Derivative(Function.front(),*(Function.cend()-2));
  derivative.at(2)=-4*pow(Function.at(2), 4)*Function.at(3)*this->ReactionCoordinate.Mass;
  derivative.at(3)=-Function.at(1) + 8*pow(Function.at(2), 3)*pow(Function.at(3), 2)*this->ReactionCoordinate.Mass + Function.at(2)*this->ReactionCoordinate.Mass;
  return derivative;
}

double trajectory::Hamilton_::Energy()const&noexcept
{
  auto const Trajectory(this->Get());
  return Trajectory.at(1)*Trajectory.at(2) - 2*pow(Trajectory.at(2), 4)*pow(Trajectory.at(3), 2)*this->ReactionCoordinate.Mass - 1.0L/2.0L*pow(Trajectory.at(2), 2)*this->ReactionCoordinate.Mass;
}

double trajectory::Hamilton_::Acceleration()const&noexcept
{
  auto const Trajectory(this->Get());
  return -4*pow(Trajectory.at(2), 4)*Trajectory.at(3)*this->ReactionCoordinate.Mass;
}
