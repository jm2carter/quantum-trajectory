#include"quantum.h"
#include<boost/numeric/odeint.hpp>

double trajectory::Quantum_::Transmission(double const Energy)const&noexcept
{
  return 2/(1+this->Momentum()/std::sqrt(2*this->ReactionCoordinate.Mass*Energy));
}

#define lapack_complex_double std::complex<double>
#include<mkl_lapacke.h>

std::array<std::complex<double>,2>trajectory::Quantum_::split(std::function<void()>const&Observe)
{
  auto const Velocity(this->Velocity());
  auto stepper(boost::numeric::odeint::bulirsch_stoer_dense_out<std::vector<double>>(1e-10,1e-10));
  auto trajectory(this->Get());
  for(stepper.initialize(this->Get(),0,-1e-10);stepper.current_state().front()>0;stepper.do_step([&](auto const&function,auto&dervative,auto const){dervative=this->Derivative(function);}))
  {
    if(Observe)
    {
      this->Set(stepper.current_state());
      Observe();
    }
    if(std::abs(stepper.current_time_step())<=10*std::numeric_limits<double>::epsilon()) throw std::underflow_error("A step size could not be found.");
  }
  stepper.calc_state(boost::math::tools::halley_iterate(
	[&](auto const Time){stepper.calc_state(Time,trajectory);this->Set(trajectory);return std::make_tuple(trajectory.front(),this->Velocity(),this->Acceleration());},
        (stepper.previous_time()+stepper.current_time())/2,
	stepper.current_time(),stepper.previous_time(),
	std::numeric_limits<double>::digits*0.4),trajectory);
  this->Set(trajectory);
  if(Observe)Observe();
  using namespace std::literals;
  std::complex<double>const WaveFunction{std::sqrt(Velocity/this->Velocity())*std::exp(1i*trajectory.back())};
  auto const WaveFunctionDerivative(std::complex<double>{-this->Acceleration()/2/std::pow(std::sqrt(this->Velocity()),5)*std::sqrt(Velocity),this->ReactionCoordinate.Mass*std::sqrt(this->Velocity()*Velocity)}*std::exp(1i*trajectory.back()));
  std::array<std::complex<double>,4>matrix{WaveFunction,WaveFunctionDerivative,-WaveFunction,WaveFunctionDerivative};
  std::array<int,2>pivot;
  std::array<std::complex<double>,2>right{std::conj(WaveFunction),-std::conj(WaveFunctionDerivative)};
  assert(!::LAPACKE_zgesv(LAPACK_COL_MAJOR,2,1,matrix.data(),2,pivot.data(),right.data(),2));
  return right;
}
