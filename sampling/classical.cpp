#include"classical.h"

double sampling::Classical_::MicrocanonicalEnergy(std::decimal::decimal32 const ActionVariable)const&
{
  return this->Sampling_::MicrocanonicalEnergy(ActionVariable);//can not just this->MicrocanonicalEnergy(ActionVariable); it is recursive function, it actually call Classical_::MicrocanonicalEnergy, that is itself, will cause infinite loop.
}

std::vector<double>sampling::Classical_::Sum(std::decimal::decimal32 const ActionVariable,std::function<std::vector<double>(double const,double const)>const&Contour,std::size_t const Rank,std::size_t const Step)const&
{
  double const MicrocanonicalEnergy(this->MicrocanonicalEnergy(ActionVariable));
  std::size_t const DissociateActionVariable{this->Oscillator.DissociateActionVariable()?this->Oscillator.DissociateActionVariable().value():this->Oscillator.MaxActionVariable()};
  std::size_t const MicrocanonicalContour(ActionVariable<=DissociateActionVariable?static_cast<long long>(this->Division*ActionVariable):this->Division*DissociateActionVariable);
  return MicrocanonicalContour>Rank?boost::accumulate(boost::adaptors::transform(boost::irange<std::size_t>(Rank,MicrocanonicalContour,Step),[&](auto const Element)
    {
      double const OscillationEnergy{this->Oscillator.OscillationEnergy((Element+std::decimal::decimal32{0.5})/this->Division)};
      return Contour(MicrocanonicalEnergy-OscillationEnergy,OscillationEnergy);
    }),std::vector<double>(this->DissociateActionVariable),[](auto&sum,auto const&Contour){boost::transform(sum,Contour,sum.begin(),std::plus<>{});return sum;}):std::vector<double>(this->DissociateActionVariable);
}

std::decimal::decimal32 sampling::Classical_::MaxActionVariable()const&
{
  return this->Oscillator.MaxActionVariable();
}

double sampling::Classical_::UnCouple(std::decimal::decimal32 const ActionVariable,Eckart_ const&Eckart)const&noexcept
{
  return boost::accumulate(this->Sum(ActionVariable,[&](auto const EnergyX,auto const){return std::vector<double>{Eckart.Analytic(this->Oscillator.Mass,EnergyX)/this->Division};},0,1),0.);
}
