_Pragma("once");

#include"sampling.h"

namespace sampling{
class Classical_ final:public Sampling_
{
  public:
    using Sampling_::Sampling_;
    double MicrocanonicalEnergy(std::decimal::decimal32 const)const&;
    std::vector<double>Sum(std::decimal::decimal32 const,std::function<std::vector<double>(double const,double const)>const&,std::size_t const,std::size_t const)const&override;
    std::decimal::decimal32 MaxActionVariable()const&override;
    [[gnu::pure]]double UnCouple(std::decimal::decimal32 const,Eckart_ const&)const&noexcept override;
};
}
