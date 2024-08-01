_Pragma("once");

#include"reactionCoordinate.h"
#include<experimental/optional>
#include<decimal/decimal>

constexpr double Couple{-0.5};

class Oscillator_:public ReactionCoordinate_
{
  public:
    double const AngularFrequency;
    constexpr Oscillator_(double const,double const);
    [[gnu::pure]]virtual double Product(double const)const&noexcept=0;
    [[gnu::pure]]virtual double DerivativeY(double const,double const)const&noexcept=0;
    [[gnu::pure]]virtual double DerivativeY2(double const,double const)const&noexcept=0;
    [[gnu::pure]]virtual double DerivativeYX(double const,double const)const&noexcept=0;
    [[gnu::pure]]virtual double ActionVariable(double const)const&noexcept=0;
    [[gnu::pure]]virtual std::experimental::optional<std::size_t>DissociateActionVariable()const&noexcept=0;
    virtual std::size_t MaxActionVariable()const& =0;
    [[gnu::pure]]virtual double OscillationEnergy(std::decimal::decimal32 const)const&noexcept=0;
    [[gnu::pure]]virtual double OscillationMax(double const)const&noexcept=0;
    [[gnu::pure]]virtual double OscillationMin(double const)const&noexcept=0;
    virtual std::vector<std::vector<double>>YInitials(double const,std::size_t const)const& =0;
};

constexpr Oscillator_::Oscillator_(double const Mass,double const AngularFrequency):ReactionCoordinate_{Mass},AngularFrequency{AngularFrequency}{}
