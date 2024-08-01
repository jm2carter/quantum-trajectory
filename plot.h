_Pragma("once");

#include<root/TMultiGraph.h>
#include<root/TLegend.h>
#include"potential/oscillator.h"
#include<experimental/filesystem>
#include<boost/type_index.hpp>
#include<boost/format.hpp>
#include<boost/algorithm/string.hpp>

#include"potential/leps.h"

class Plot_
{
  private:
    Oscillator_ const&Oscillator;
    std::experimental::filesystem::path const Path{std::experimental::filesystem::current_path().parent_path()/[&]{auto const Potential(boost::algorithm::erase_tail_copy(boost::typeindex::type_id_runtime(Oscillator).pretty_name(),1));return std::tolower(Potential.front(),std::locale{})+Potential.substr(1);}()/(typeid(Oscillator)==typeid(Leps_)?"":boost::str(boost::format("%1%")%Couple))};
    std::vector<double>energies;
    mutable TMultiGraph graphs;
    void plot(std::string const,TLegend&,short const)const&;
    void plot(std::string const,TLegend&,short const Color,std::size_t const)const&;
  public:
    Plot_(Oscillator_ const&);
    void operator()();
};
