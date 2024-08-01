#include"lagrange.h"

trajectory::Lagrange_::Lagrange_(ReactionCoordinate_ const&ReactionCoordinate,double const Position,double const Energy):Quantum_{ReactionCoordinate}
{
  this->Set({Position,std::sqrt(2/this->ReactionCoordinate.Mass*Energy),0,0});
}

double trajectory::Lagrange_::Velocity()const&noexcept
{
  return this->Get().at(1);
}

double trajectory::Lagrange_::Acceleration()const&noexcept
{
  return this->Get().at(2);
} 
