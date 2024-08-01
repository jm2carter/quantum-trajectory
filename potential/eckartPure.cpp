#include"eckartPure.h"
#include<gsl/gsl_sf_gamma.h>
#include"acb_hypgeom.h"

std::complex<double>hyp2f1(std::complex<double>const A,std::complex<double>const B,std::complex<double>const C,std::complex<double>const Z)
{
  acb_t result,a,b,c,z;
  acb_init(result);
  acb_init(a);
  acb_init(b);
  acb_init(c);
  acb_init(z);
  acb_set_d_d(a,A.real(),A.imag());
  acb_set_d_d(b,B.real(),B.imag());
  acb_set_d_d(c,C.real(),C.imag());
  acb_set_d_d(z,Z.real(),Z.imag());
  acb_hypgeom_2f1(result,a,b,c,z,0,113);
  std::complex<double>hyp2f1{arf_get_d(arb_midref(acb_realref(result)),ARF_RND_NEAR),arf_get_d(arb_midref(acb_imagref(result)),ARF_RND_NEAR)};
  acb_clear(result);
  acb_clear(a);
  acb_clear(b);
  acb_clear(c);
  acb_clear(z);
  return hyp2f1;
}

std::complex<double>tgamma(std::complex<double>const Variable)
{
  gsl_sf_result lnr,arg;
  gsl_sf_lngamma_complex_e(Variable.real(),Variable.imag(),std::addressof(lnr),std::addressof(arg));
  return std::exp(std::complex<double>{lnr.val,arg.val});
}

std::complex<double>EckartPure_::WaveFunction(double const Mass,double const Energy,double const Position)const&noexcept
{
  using namespace std::literals;
  return Position>=0?pow(1. + exp(-2.*Position*std::complex<double>{this->BarrierWidth}), (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth})*exp(sqrt(2.)*1i*sqrt(Energy)*Position*sqrt(std::complex<double>{Mass}))*tgamma(-sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth})*tgamma(-sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + 1. - 1./2*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth})*hyp2f1(-sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth},(1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth}, -sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + 1., -exp(-2.*Position*std::complex<double>{this->BarrierWidth}))/(tgamma(-sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth})*tgamma(-sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + 1.)):pow(exp(2.*Position*std::complex<double>{this->BarrierWidth}) + 1., (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth})*exp(sqrt(2.)*1i*sqrt(Energy)*Position*sqrt(std::complex<double>{Mass}))*hyp2f1((1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth},sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth}, sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + 1., -exp(2.*Position*std::complex<double>{this->BarrierWidth})) + pow(exp(2.*Position*std::complex<double>{this->BarrierWidth}) + 1., (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth})*exp(-sqrt(2.)*1i*sqrt(Energy)*Position*sqrt(std::complex<double>{Mass}))*tgamma(sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth})*tgamma(-sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth})*tgamma(-sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + 1. - 1./2*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth})*hyp2f1(-sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth},(1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth}, -sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + 1., -exp(2.*Position*std::complex<double>{this->BarrierWidth}))/(tgamma((1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth})*tgamma(-sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth})*tgamma(1. - 1./2*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth}));
}

std::complex<double>EckartPure_::ReflectedWave(double const Mass,double const Energy,double const Position)const&noexcept
{
  using namespace std::literals;
  return pow(exp(2.*Position*std::complex<double>{this->BarrierWidth}) + 1., (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth})*exp(-sqrt(2.)*1i*sqrt(Energy)*Position*sqrt(std::complex<double>{Mass}))*hyp2f1(-sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth},(1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth}, -sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + 1., -exp(2.*Position*std::complex<double>{this->BarrierWidth}));
}

std::complex<double>EckartPure_::IncidentWave(double const Mass,double const Energy,double const Position)const&noexcept
{
  using namespace std::literals;
  return pow(exp(2.*Position*std::complex<double>{this->BarrierWidth}) + 1., (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth})*exp(sqrt(2.)*1i*sqrt(Energy)*Position*sqrt(std::complex<double>{Mass}))*hyp2f1((1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth},sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth}, sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + 1., -exp(2.*Position*std::complex<double>{this->BarrierWidth}));
}

std::complex<double>EckartPure_::TransmittedWave(double const Mass,double const Energy,double const Position)const&noexcept
{
  using namespace std::literals;
  return pow(1. + exp(-2.*Position*std::complex<double>{this->BarrierWidth}), (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth})*exp(sqrt(2.)*1i*sqrt(Energy)*Position*sqrt(std::complex<double>{Mass}))*hyp2f1(-sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + (1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth},(1./2)*(std::complex<double>{this->BarrierWidth} - sqrt(-8.*std::complex<double>{Mass}*std::complex<double>{this->BarrierHeight} + pow(std::complex<double>{this->BarrierWidth}, 2.)))/std::complex<double>{this->BarrierWidth}, -sqrt(2.)*1i*sqrt(Energy)*sqrt(std::complex<double>{Mass})/std::complex<double>{this->BarrierWidth} + 1., -exp(-2.*Position*std::complex<double>{this->BarrierWidth}));
}
