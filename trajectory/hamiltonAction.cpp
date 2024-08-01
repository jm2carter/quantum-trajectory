#include"hamiltonAction.h"

trajectory::HamiltonAction_::HamiltonAction_(ReactionCoordinate_ const&ReactionCoordinate,double const Position,double const Energy):Hamilton_{ReactionCoordinate,Position,Energy}
{
  auto trajectory(this->Get());
  trajectory.emplace_back(0);
  this->Set(trajectory);
}

std::vector<double>trajectory::HamiltonAction_::Derivative(std::vector<double>const&Function)const&
{
  auto derivative(Hamilton_::Derivative(Function));
  derivative.emplace_back(std::pow(Function.at(2),2)*this->ReactionCoordinate.Mass);
  derivative.shrink_to_fit();
  return derivative;
}
