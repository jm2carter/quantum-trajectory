#include"morse.h"
#include<boost/numeric/odeint.hpp>
#include<boost/numeric/odeint/iterator/n_step_iterator.hpp>

double Morse_::ActionVariable(double const OscillationEnergy)const&noexcept
{
  return 2*(this->WellDepth-std::sqrt(-OscillationEnergy*this->WellDepth))/this->AngularFrequency;
}

std::experimental::optional<std::size_t>Morse_::DissociateActionVariable()const&noexcept
{
  return std::floor(this->ActionVariable(0));
}

double Morse_::OscillationEnergy(std::decimal::decimal32 const ActionVariable)const&noexcept
{
  return this->AngularFrequency*std::decimal::decimal_to_double(ActionVariable)-std::pow(this->AngularFrequency*std::decimal::decimal_to_double(ActionVariable),2)/(4*this->WellDepth);
}

double Morse_::OscillationMax(double const OscillationEnergy)const&noexcept
{
  return -std::log(1-std::sqrt(OscillationEnergy/this->WellDepth))/this->MorseWidth;
}

double Morse_::OscillationMin(double const OscillationEnergy)const&noexcept
{
  return -std::log(1+std::sqrt(OscillationEnergy/this->WellDepth))/this->MorseWidth;
}

double Morse_::Period(double const OscillationEnergy)const&noexcept
{
  return 2*M_PI/this->AngularFrequency*std::sqrt(this->WellDepth/(this->WellDepth-OscillationEnergy));
}

std::vector<std::vector<double>>Morse_::YInitials(double const OscillationEnergy,std::size_t const Division)const&
{
  auto stepper(boost::numeric::odeint::bulirsch_stoer_dense_out<std::vector<double>>(1e-13,1e-13));
  std::vector<double>yInitial{this->OscillationMax(OscillationEnergy),0};
  auto const YInitials=boost::numeric::odeint::make_n_step_range(stepper,[&](std::vector<double>const&Function,std::vector<double>&derivative,double const)
    {
      derivative.at(0)=Function.at(1);
      derivative.at(1)=-this->ProductDerivative(Function.at(0))/this->Mass;
    },yInitial,0,this->Period(OscillationEnergy)/Division,Division-1);
  return std::vector<std::vector<double>>{YInitials.first,YInitials.second};
}
