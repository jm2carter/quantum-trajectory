#include"lagrangeAction.h"

trajectory::LagrangeAction_::LagrangeAction_(ReactionCoordinate_ const&ReactionCoordinate,double const Position,double const Energy):Lagrange_{ReactionCoordinate,Position,Energy}
{
  auto trajectory(this->Get());
  trajectory.emplace_back(0);
  this->Set(trajectory);
}

std::vector<double>trajectory::LagrangeAction_::Derivative(std::vector<double>const&Function)const&
{
  auto derivative(Lagrange_::Derivative(Function));
  derivative.emplace_back(this->ReactionCoordinate.Mass*std::pow(Function.at(1),2));
  derivative.shrink_to_fit();
  return derivative;
}
