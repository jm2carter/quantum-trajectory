_Pragma("once");

#include"reactionCoordinate.h"
#include"eckart.h"
#include<complex>

class EckartPure_ final:public ReactionCoordinate_,public Eckart_
{
  public:
    constexpr EckartPure_(double const,double const,double const);
    [[gnu::pure]]double Potential(double const,double const=0)const&noexcept override;
    [[gnu::pure]]double Derivative(double const,double const)const&noexcept override;
    [[gnu::pure]]double Derivative2(double const,double const)const&noexcept override;
    [[gnu::pure]]std::complex<double>WaveFunction(double const,double const,double const)const&noexcept;
    [[gnu::pure]]std::complex<double>ReflectedWave(double const,double const,double const)const&noexcept;
    [[gnu::pure]]std::complex<double>IncidentWave(double const,double const,double const)const&noexcept;
    [[gnu::pure]]std::complex<double>TransmittedWave(double const,double const,double const)const&noexcept;
};

constexpr EckartPure_::EckartPure_(double const Mass,double const BarrierHeight,double const BarrierWidth):ReactionCoordinate_{Mass},Eckart_{BarrierHeight,BarrierWidth}{}

//constexpr function must be defined in header and declaration of constexpr function must have constexpr at the beginning, so constexpr must be appear in class which is unlike inline, see example in n4567 7.1.5.1

#include<gsl/gsl_const_mksa.h>

constexpr EckartPure_ Eckart{2000,400*100*GSL_CONST_MKSA_PLANCKS_CONSTANT_H*GSL_CONST_MKSA_SPEED_OF_LIGHT/4.35974417e-18,3};

//#include<boost/units/systems/si/codata_constants.hpp>
//constexpr EckartPure_ Eckart{2000,(400*100*boost::units::si::reciprocal_meter*boost::units::si::constants::codata::c*boost::units::si::constants::codata::h).value()/4.35974417e-18,3};
