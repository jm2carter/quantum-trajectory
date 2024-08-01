#include"trajectory2dim.h"
#include<boost/range/algorithm.hpp>

trajectory::Trajectory2dim_::Trajectory2dim_(Oscillator_ const&Oscillator,Trajectory1dim_&Trajectory1dim,std::vector<double>const&YInitial):Oscillator{Oscillator},trajectory1dim{Trajectory1dim}
{
  auto trajectory(this->trajectory1dim.Get());
  trajectory.insert(trajectory.cend(),YInitial.cbegin(),YInitial.cend());
  this->trajectory1dim.Set(trajectory);
}

std::vector<double>trajectory::Trajectory2dim_::Derivative(std::vector<double>const&Function)const&
{
  auto derivative(this->trajectory1dim.Derivative(Function));
  derivative.insert(derivative.cend(),{Function.back(),-this->Oscillator.DerivativeY(Function.front(),*(Function.cend()-2))/this->Oscillator.Mass});
  derivative.shrink_to_fit();
  return derivative;
}

#include<cmath>

double trajectory::Trajectory2dim_::OscillationEnergy()const&noexcept
{
  auto const Trajectory(this->Get());
  return this->Oscillator.Mass/2*std::pow(Trajectory.back(),2)+this->Oscillator.Product(*(Trajectory.cend()-2));
}

#include"../potential/leps.h"

std::vector<double>trajectory::Trajectory2dim_::Transmission(double const Energy)const&noexcept
{
  if(typeid(this->Oscillator)==typeid(Leps_))
  {
    auto const Trajectory(this->Get());
    if(*(Trajectory.cend()-2)>Trajectory.front()*std::tan(M_PI/6))
    {
      auto const Position(Leps_::reflection(Trajectory.front(),*(Trajectory.cend()-2)));
      auto const Velocity(Leps_::reflection(Trajectory.at(1),Trajectory.back()));
      const_cast<trajectory::Trajectory2dim_*>(this)->Set({Position.front(),Velocity.front(),Position.back(),Velocity.back()});
      auto const DissociateActionVariable(this->Oscillator.DissociateActionVariable().value());
      std::vector<double>Transmissions(DissociateActionVariable);
      if(this->OscillationEnergy()<this->Oscillator.OscillationEnergy(DissociateActionVariable)) ++Transmissions.at(std::floor(this->Oscillator.ActionVariable(this->OscillationEnergy())));
      return Transmissions;
    }
    else return {0};
  }
  else if(!Couple) return {this->trajectory1dim.Transmission(Energy)};
  else
  {
    double const Energy{this->trajectory1dim.Energy()};
    return {Energy<0||this->Oscillator.DissociateActionVariable()&&this->OscillationEnergy()>this->Oscillator.OscillationEnergy(this->Oscillator.DissociateActionVariable().value())?0:this->trajectory1dim.Transmission(Energy)};
  }
}

std::vector<double>trajectory::Trajectory2dim_::Get()const&noexcept
{
  return this->trajectory1dim.Get();
}

void trajectory::Trajectory2dim_::Set(std::vector<double>const&Trajectory)noexcept
{
  this->trajectory1dim.Set(Trajectory);
}
