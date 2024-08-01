#include"sampling.h"

sampling::Sampling_::Sampling_(Oscillator_ const&Oscillator):Oscillator{Oscillator},DissociateActionVariable{this->Oscillator.DissociateActionVariable()?this->Oscillator.DissociateActionVariable().value():this->Oscillator.MaxActionVariable()}{};

double sampling::Sampling_::MicrocanonicalEnergy(std::decimal::decimal32 const ActionVariable)const&
{
  return ActionVariable<=this->DissociateActionVariable?this->Oscillator.OscillationEnergy(ActionVariable):this->Oscillator.OscillationEnergy(this->DissociateActionVariable)+this->Oscillator.AngularFrequency*std::decimal::decimal_to_double(ActionVariable-this->DissociateActionVariable);
}
