_Pragma("once");

#include"sampling.h"

namespace sampling{
class PhaseSpaceApproximation_ final:public Sampling_
{
  private:
    std::size_t const ActionVariable;
  public:
    PhaseSpaceApproximation_(Oscillator_ const&,std::size_t const);
    std::vector<double>Sum(std::decimal::decimal32 const,std::function<std::vector<double>(double const,double const)>const&,std::size_t const,std::size_t const)const&override;
    std::decimal::decimal32 MaxActionVariable()const&override;
    [[gnu::pure]]double UnCouple(std::decimal::decimal32 const,Eckart_ const&)const&noexcept override;
    [[gnu::pure]]double EnergyX(std::decimal::decimal32 const)const&noexcept;
};
}
