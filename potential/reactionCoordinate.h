_Pragma("once");

#include<vector>

class ReactionCoordinate_
{
  public:
    double const Mass;
    constexpr ReactionCoordinate_(double const);
    ReactionCoordinate_(ReactionCoordinate_&&)=delete;
    [[gnu::pure]]virtual double Potential(double const,double const)const&noexcept=0;
    [[gnu::pure]]virtual double Derivative(double const,double const)const&noexcept=0;
    [[gnu::pure]]virtual double Derivative2(double const,double const)const&noexcept=0;
    [[gnu::pure]]virtual double XInitial()const&noexcept;
  protected:
    ~ReactionCoordinate_()=default;
};

constexpr ReactionCoordinate_::ReactionCoordinate_(double const Mass):Mass{Mass}{}
