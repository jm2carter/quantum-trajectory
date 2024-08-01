#include"phaseSpaceApproximation.h"

sampling::PhaseSpaceApproximation_::PhaseSpaceApproximation_(Oscillator_ const& Oscillator,std::size_t const ActionVariable):Sampling_{Oscillator},ActionVariable{ActionVariable}{};

std::vector<double>sampling::PhaseSpaceApproximation_::Sum(std::decimal::decimal32 const ActionVariable,std::function<std::vector<double>(double const,double const)>const&Contour,std::size_t const Rank,std::size_t const Step)const&
{
  return this->Division>Rank?boost::accumulate(boost::adaptors::transform(boost::irange<std::size_t>(this->Division*this->ActionVariable+Rank,this->Division*(this->ActionVariable+1),Step),[&](auto const Element)
    {
      double const OscillationEnergy{this->Oscillator.OscillationEnergy((Element+std::decimal::decimal32{0.5})/this->Division)};
      return Contour(this->EnergyX(ActionVariable),OscillationEnergy);
    }),std::vector<double>(this->DissociateActionVariable),[](auto&sum,auto const&Contour){boost::transform(sum,Contour,sum.begin(),std::plus<>{});return sum;}):std::vector<double>(this->DissociateActionVariable);
}

std::decimal::decimal32 sampling::PhaseSpaceApproximation_::MaxActionVariable()const&
{
  return this->Oscillator.MaxActionVariable()-this->ActionVariable-std::decimal::decimal32{0.5};
}

double sampling::PhaseSpaceApproximation_::UnCouple(std::decimal::decimal32 const ActionVariable,Eckart_ const&Eckart)const&noexcept
{
  return Eckart.Analytic(this->Oscillator.Mass,this->EnergyX(ActionVariable));
}

double sampling::PhaseSpaceApproximation_::EnergyX(std::decimal::decimal32 const ActionVariable)const&noexcept
{
  return this->MicrocanonicalEnergy(ActionVariable+this->ActionVariable+std::decimal::decimal32{0.5})-this->Oscillator.OscillationEnergy(this->ActionVariable+std::decimal::decimal32{0.5});
}
