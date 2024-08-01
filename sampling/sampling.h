_Pragma("once");

#include"../trajectory/trajectory2dim.h"
#include"../potential/eckart.h"
#include<experimental/type_traits>

namespace sampling{
class Sampling_
{
  protected:
    Oscillator_ const&Oscillator;
    ~Sampling_()=default;
    double MicrocanonicalEnergy(std::decimal::decimal32 const)const&;
    std::size_t const DissociateActionVariable;
  public:
    static constexpr std::size_t Division{100};
    Sampling_(Oscillator_ const&);
    Sampling_(Sampling_&&)=delete;
    virtual std::vector<double>Sum(std::decimal::decimal32 const,std::function<std::vector<double>(double const,double const)>const&,std::size_t const,std::size_t const)const& =0;
    virtual std::decimal::decimal32 MaxActionVariable()const& =0;
    [[gnu::pure]]virtual double UnCouple(std::decimal::decimal32 const,Eckart_ const&Eckart)const&noexcept=0;
    template<typename Trajectory1dim_>requires std::experimental::is_base_of_v<trajectory::Trajectory1dim_,Trajectory1dim_>std::vector<double>Contour(double const,double const)const&;
};
}

#include<future>
#include<boost/range/irange.hpp>
#include<boost/range/algorithm.hpp>
#include<boost/range/adaptors.hpp>
#include<boost/range/numeric.hpp>

//#include<parallel/algorithm>
/*__gnu_parallel::_Settings s;
  s.algorithm_strategy = __gnu_parallel::force_parallel;
  __gnu_parallel::_Settings::set(s);*/

template<typename Trajectory1dim_>requires std::experimental::is_base_of_v<trajectory::Trajectory1dim_,Trajectory1dim_>
std::vector<double>sampling::Sampling_::Contour(double const EnergyX,double const OscillationEnergy)const&
{
  auto const YInitials{this->Oscillator.YInitials(OscillationEnergy,this->Division)};
  /*return boost::accumulate(boost::adaptors::transform(boost::irange<std::size_t>(0,this->Division),[&](auto const Element)
	{
	  std::cout<<Element<<std::endl;
	  Trajectory_ base{this->Oscillator,4,EnergyX};
          ::Trajectory2dim trajectory{this->Oscillator,base,YInitials.at(Element).front(),YInitials.at(Element).back()};
          //return
	  auto a=Couple?Propagate(trajectory,std::experimental::nullopt):Propagate(trajectory,EnergyX);
	  std::cout<<std::setprecision(12)<<a<<std::endl;
	  return a;
	}),0.);*/
  /*std::vector<double>loop(Division);
  boost::iota(loop,0);
  std::__parallel::for_each(loop.begin(),loop.end(),[&](auto&argument){argument*=2*M_PI/Division;
      argument=Trajectory_{4,EnergyX,std::sqrt(2*EnergyY/Mass)*std::cos(argument)/AngularFrequency,std::sqrt(2*EnergyY/Mass)*std::sin(argument),::harmonicQuantum}();});
  return boost::accumulate(loop,0.);*/
  std::atomic<std::size_t>now(std::thread::hardware_concurrency());
  auto thread=[&](std::size_t const Thread)///
  {
    decltype(std::declval<trajectory::Trajectory2dim_>().Transmission(EnergyX))sum(this->DissociateActionVariable); 
    for(auto element(Thread);element<this->Division;element=now++)
    {
      Trajectory1dim_ trajectory1dim{this->Oscillator,this->Oscillator.XInitial(),EnergyX};
      trajectory::Trajectory2dim_ trajectory2dim{this->Oscillator,trajectory1dim,YInitials.at(element)};
      if(trajectory2dim.reactant())boost::transform(sum,trajectory2dim.Transmission(EnergyX),sum.begin(),std::plus<>{});
    }
    return sum;
  };
  std::vector<std::future<decltype(thread(0))>>threads(now-1);
  boost::transform(boost::irange<std::size_t>(1,now),threads.begin(),[&](auto const Thread){return std::async(std::launch::async,std::cref(thread),Thread);});
  auto contour(thread(0));
  for(auto&thread:threads)boost::transform(contour,thread.get(),contour.begin(),std::plus<>{});
  return contour;
}
