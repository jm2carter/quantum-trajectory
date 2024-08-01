#include"classical.h"
#include<cmath>

trajectory::Classical_::Classical_(ReactionCoordinate_ const&ReactionCoordinate,double const Position,double const Energy):Trajectory1dim_{ReactionCoordinate}
{
  this->Set({Position,std::sqrt(2/ReactionCoordinate.Mass*Energy)});
}

std::vector<double>trajectory::Classical_::Derivative(std::vector<double>const&Function)const&
{
  return {Function.at(1),-this->ReactionCoordinate.Derivative(Function.front(),*(Function.cend()-2))/this->ReactionCoordinate.Mass};
}

double trajectory::Classical_::Transmission(double const)const&noexcept
{
  return this->Get().front()<0?1:0;
}

double trajectory::Classical_::Energy()const&noexcept
{
  return this->ReactionCoordinate.Mass*std::pow(this->Get().at(1),2)/2;
}
