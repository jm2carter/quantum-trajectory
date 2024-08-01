_Pragma("once");

#include"affineMorse.h"
#include<array>

class Leps_ final:public AffineMorse_
{
  private:
    static constexpr double Overlap{0.1475};
  public:
    [[gnu::pure]]double Potential(double const,double const)const&noexcept override;
    [[gnu::pure]]double Derivative(double const,double const)const&noexcept override;
    [[gnu::pure]]double Derivative2(double const,double const)const&noexcept override;
    [[gnu::pure]]double DerivativeY(double const,double const)const&noexcept override;
    [[gnu::pure]]double DerivativeY2(double const,double const)const&noexcept override;
    [[gnu::pure]]double DerivativeYX(double const,double const)const&noexcept override;
    std::size_t MaxActionVariable()const&override;
    [[gnu::pure]]double XInitial()const&noexcept override;
    [[gnu::pure]]static std::array<double,2>reflection(double const,double const)noexcept;
};
