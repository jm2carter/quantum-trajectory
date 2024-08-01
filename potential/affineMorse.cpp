#include"affineMorse.h"

double AffineMorse_::OscillationEnergy(std::decimal::decimal32 const ActionVariable)const&noexcept
{
  return this->Morse_::OscillationEnergy(ActionVariable)-this->WellDepth;
}

double AffineMorse_::OscillationMax(double const OscillationEnergy)const&noexcept
{
  return (this->EquilibriumDistance+this->Morse_::OscillationMax(OscillationEnergy+this->WellDepth))*std::cos(this->Theta);
}

double AffineMorse_::OscillationMin(double const OscillationEnergy)const&noexcept
{
  return (this->EquilibriumDistance+this->Morse_::OscillationMin(OscillationEnergy+this->WellDepth))*std::cos(this->Theta);
}

double AffineMorse_::Period(double const OscillationEnergy)const&noexcept
{
  return this->Morse_::Period(OscillationEnergy+this->WellDepth);
}
