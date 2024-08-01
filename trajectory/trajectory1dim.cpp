#include"trajectory1dim.h"

trajectory::Trajectory1dim_::Trajectory1dim_(ReactionCoordinate_ const&ReactionCoordinate):ReactionCoordinate{ReactionCoordinate}{};

std::vector<double>trajectory::Trajectory1dim_::Get()const&noexcept
{
  return this->trajectory;
}

void trajectory::Trajectory1dim_::Set(std::vector<double>const&Trajectory)noexcept
{
  this->trajectory=Trajectory;
}
