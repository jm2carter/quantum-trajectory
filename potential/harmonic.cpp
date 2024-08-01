#include<boost/range/irange.hpp>
#include<boost/range/adaptors.hpp>
#include"harmonic.h"

double Harmonic_::ActionVariable(double const OscillationEnergy)const&noexcept
{
  return std::sqrt(OscillationEnergy/this->AngularFrequency);
}

std::experimental::optional<std::size_t>Harmonic_::DissociateActionVariable()const&noexcept
{
  return std::experimental::nullopt;
} 

std::size_t Harmonic_::MaxActionVariable()const&noexcept
{
  return 3;
}

double Harmonic_::OscillationEnergy(std::decimal::decimal32 const ActionVariable)const&noexcept//action variable=volume in phase space//hbar*(n+0.5) the whole is action variable
{
  return this->AngularFrequency*std::decimal::decimal_to_double(ActionVariable);
}

double Harmonic_::OscillationMax(double const OscillationEnergy)const&noexcept
{
  return std::sqrt(2*OscillationEnergy/this->Mass)/this->AngularFrequency;
}

double Harmonic_::OscillationMin(double const OscillationEnergy)const&noexcept
{
  return -this->OscillationMax(OscillationEnergy);
}

std::vector<std::vector<double>>Harmonic_::YInitials(double const OscillationEnergy,std::size_t const Division)const&
{
  auto const YInitials=boost::adaptors::transform(boost::irange<std::size_t>(0,Division),[&](auto const Element)
    {
      auto const Argument(2*M_PI/Division*Element);
      return std::vector<double>{this->OscillationMax(OscillationEnergy)*std::cos(Argument),std::sqrt(2*OscillationEnergy/this->Mass)*std::sin(Argument)};
    });
  return std::vector<std::vector<double>>(std::cbegin(YInitials),std::cend(YInitials));
}
