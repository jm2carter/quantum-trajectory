_Pragma("once");

#include"oscillator.h"

class Morse_:public Oscillator_
{
  protected:
    double const MorseWidth;
  public:
    double const WellDepth;
    constexpr Morse_(double const,double const,double const,double const);
    [[gnu::pure]]double ActionVariable(double const)const&noexcept override final;
    [[gnu::pure]]std::experimental::optional<std::size_t>DissociateActionVariable()const&noexcept override final;
    [[gnu::pure]]double OscillationEnergy(std::decimal::decimal32 const)const&noexcept override;
    [[gnu::pure]]double OscillationMax(double const)const&noexcept override;
    [[gnu::pure]]double OscillationMin(double const)const&noexcept override;
    [[gnu::pure]]virtual double Period(double const)const&noexcept;
    std::vector<std::vector<double>>YInitials(double const,std::size_t const)const&override final;
    [[gnu::pure]]double Product(double const)const&noexcept override;
    [[gnu::pure]]virtual double ProductDerivative(double const)const&noexcept;
};

constexpr Morse_::Morse_(double const Mass,double const AngularFrequency,double const MorseWidth,double const WellDepth):Oscillator_{Mass,AngularFrequency},MorseWidth{MorseWidth},WellDepth{WellDepth}{}
