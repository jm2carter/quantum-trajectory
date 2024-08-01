#include"hamilton.h"

trajectory::Hamilton_::Hamilton_(ReactionCoordinate_ const&ReactionCoordinate,double const Position,double const Energy):Quantum_{ReactionCoordinate}
{
  double const Velocity{std::sqrt(2*Energy/this->ReactionCoordinate.Mass)};
  this->Set({Position,Velocity*this->ReactionCoordinate.Mass,Velocity,0});
}

double trajectory::Hamilton_::Velocity()const&noexcept
{
  return this->Get().at(2);
} 

double trajectory::Hamilton_::Momentum()const&noexcept
{
  return this->Get().at(1);
}
