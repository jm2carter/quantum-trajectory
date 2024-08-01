_Pragma("once");

#include"eckartPure.h"
#include"oscillator.h"

class Harmonic_ final:public Eckart_,public Oscillator_
{
  public:
    constexpr Harmonic_();
    [[gnu::pure]]double Potential(double const,double const)const&noexcept override;
    [[gnu::pure]]double Derivative(double const,double const)const&noexcept override;
    [[gnu::pure]]double Derivative2(double const,double const)const&noexcept override;
    [[gnu::pure]]double Product(double const)const&noexcept override;
    [[gnu::pure]]double DerivativeY(double const,double const)const&noexcept override;
    [[gnu::pure]]double DerivativeY2(double const,double const)const&noexcept override;
    [[gnu::pure]]double DerivativeYX(double const,double const)const&noexcept override;
    [[gnu::pure]]double ActionVariable(double const)const&noexcept override;
    [[gnu::pure]]std::experimental::optional<std::size_t>DissociateActionVariable()const&noexcept override;
    [[gnu::pure]]std::size_t MaxActionVariable()const&noexcept override;
    [[gnu::pure]]double OscillationEnergy(std::decimal::decimal32 const)const&noexcept override;
    [[gnu::pure]]double OscillationMax(double const)const&noexcept override;
    [[gnu::pure]]double OscillationMin(double const)const&noexcept override;
    std::vector<std::vector<double>>YInitials(double const,std::size_t const)const&override;
};

constexpr Harmonic_::Harmonic_():Eckart_{Eckart},Oscillator_{Eckart.Mass,BarrierHeight}{}
