#include"potential/oscillator.h"
#include<boost/range/algorithm.hpp>
#include<boost/range/irange.hpp>
#include<boost/range/adaptors.hpp>
#include<boost/type_index.hpp>
#include<boost/algorithm/string.hpp>
#include<mgl2/mgl.h>
#include<mgl2/base.h>

namespace{
Oscillator_ const*oscillator;
std::decimal::decimal32 const MicrocanonicalEnergy{2.4};

void axis(mglGraph&graph)
{
  graph.Axis();
  graph.Label('x',"perpendicular\nposition\ny (a.u.)",0,"value -0.2");
  graph.Label('y',"perpendicular momentum\np_y (a.u.)",0,"value -0.2");
  graph.Label('z',"energy along\nreaction coordinate (a.u.)",0,"value 0.4");
  graph.AddLegend("standard sampling","g");
  graph.Legend(3,"A");
}

auto actionVariable(std::decimal::decimal32 const ActionVariable)
{
  auto const YInitials(oscillator->YInitials(oscillator->OscillationEnergy(ActionVariable),500));
  mglData position(YInitials.size()+1),momentum(position.nx);
  boost::transform(YInitials,position.a,[](auto const YInitial){return YInitial.front();});
  boost::transform(YInitials,momentum.a,[](auto const YInitial){return YInitial.back()*oscillator->Mass;});
  position.SetVal(*position.a,position.nx-1);
  momentum.SetVal(*momentum.a,momentum.nx-1);
  return std::array<mglData,2>{position,momentum}; 
}

void actionVariables(mglGraph&graph,std::decimal::decimal32 const Low,std::decimal::decimal32 const Up,double const Energy)
{
  for(auto actionVariable(Low);actionVariable<Up;actionVariable+=std::decimal::decimal32{0.2})
  {
    auto const ActionVariable(::actionVariable(actionVariable));
    mglData energy(ActionVariable.front().nx);
    std::fill_n(energy.a,energy.nx,Energy);
    graph.Plot(ActionVariable.front(),ActionVariable.back(),energy,"k");
    mglData position(10),momentum(position.nx);
    energy.Crop(0,position.nx);
    boost::copy(boost::adaptors::stride(boost::make_iterator_range(ActionVariable.front().a,std::next(ActionVariable.front().a,ActionVariable.front().nx)),ActionVariable.front().nx/position.nx),position.a);
    boost::copy(boost::adaptors::stride(boost::make_iterator_range(ActionVariable.back().a,std::next(ActionVariable.back().a,ActionVariable.back().nx)),ActionVariable.back().nx/position.nx),momentum.a);
    graph.Plot(position,momentum,energy,"k #o");
  }
}

void classical(mglGraph&graph)
{
  mglData position(501,501),momentum(position.nx,position.ny),energy(position.nx,position.ny);
  for(auto const Integer:boost::irange<std::size_t>(0,position.ny))
  {
    auto const ActionVariable(::actionVariable(Integer*MicrocanonicalEnergy/(position.ny-1)));
    std::copy_n(ActionVariable.front().a,position.nx,std::next(position.a,position.nx*Integer));
    std::copy_n(ActionVariable.back().a,momentum.nx,std::next(momentum.a,momentum.nx*Integer));
    std::fill_n(std::next(energy.a,energy.nx*Integer),energy.nx,oscillator->OscillationEnergy(MicrocanonicalEnergy)-oscillator->OscillationEnergy(Integer*MicrocanonicalEnergy/(position.ny-1)));
  }
  graph.Surf(position,momentum,energy,"g");
}

}//namespace

void asymptoticPhaseSpace(Oscillator_ const&Oscillator)
{
  ::oscillator=std::addressof(Oscillator);
  auto const File([&]{auto const File(boost::algorithm::erase_tail_copy(boost::typeindex::type_id_runtime(Oscillator).pretty_name(),1));return std::tolower(File.front(),std::locale{})+File.substr(1);}());
  mglGraph graph;
  graph.Alpha(true);
  graph.SetAlphaDef(0.3);
  graph.Rotate(50,60);
  constexpr std::size_t OutMostActionVariable{3};
  auto previous(::actionVariable(OutMostActionVariable));
  auto const MomentumMax(std::max_element(previous.back().a,std::next(previous.back().a,previous.back().nx)));
  graph.SetRanges(Oscillator.OscillationMin(Oscillator.OscillationEnergy(OutMostActionVariable)),Oscillator.OscillationMax(Oscillator.OscillationEnergy(OutMostActionVariable)),-*MomentumMax,*MomentumMax,0,Oscillator.OscillationEnergy(MicrocanonicalEnergy)-Oscillator.OscillationEnergy(0));
  classical(graph);
  actionVariables(graph,std::decimal::decimal32{0.1},MicrocanonicalEnergy,0);
  axis(graph);
  graph.WritePNG(std::data("../"+File+"Classical.png"));
  graph.WritePRC(std::data("../"+File+"Classical"));
  graph.Clf();
  graph.SetRange('z',Oscillator.OscillationEnergy(MicrocanonicalEnergy)-Oscillator.OscillationEnergy(std::decimal::decimal32{OutMostActionVariable-0.5}),graph.Self()->Max.z);
  classical(graph);
  actionVariables(graph,std::decimal::decimal32{1.1},2,Oscillator.OscillationEnergy(MicrocanonicalEnergy)-Oscillator.OscillationEnergy(std::decimal::decimal32{1.5}));
  for(auto const ActionVariable:boost::irange<std::size_t>(OutMostActionVariable,0,-1))
  {
    auto region(::actionVariable(ActionVariable-1));
    mglData energy(region.front().nx);
    std::fill_n(energy.a,energy.nx,Oscillator.OscillationEnergy(MicrocanonicalEnergy)-Oscillator.OscillationEnergy(std::decimal::decimal32{ActionVariable-0.5}));
    graph.Region(previous.front(),previous.back(),energy,region.front(),region.back(),energy,"h");
    graph.Puts({(graph.Self()->Min.x+graph.Self()->Max.x)/2,0,*energy.a},std::data("E_{micro}-E^y(J="+std::to_string(2*ActionVariable-1)+"\\pi\\hbar)"));
    previous=region;
  }
  graph.FSurf("0","b");
  graph.AddLegend("energy along reaction coordinate=0","b");
  graph.AddLegend("PSA sampling","h");
  axis(graph);
  graph.WritePNG(std::data("../"+File+"PSA.png"));
  graph.WritePRC(std::data("../"+File+"PSA"));
}

/*#include"potential/harmonic.h"
#include"potential/eckartMorse.h"
#include"potential/leps.h"

void asymptoticPhaseSpace(Oscillator_ const&);

int main()
{
  constexpr Harmonic_ Harmonic;
  asymptoticPhaseSpace(Harmonic);
  constexpr EckartMorse_ EckartMorse;
  asymptoticPhaseSpace(EckartMorse);
  constexpr Leps_ Leps;
  asymptoticPhaseSpace(Leps);
}*/

/*#include"potential/oscillator.h"
#include<boost/range/algorithm.hpp>
#include<boost/range/combine.hpp>
#include<boost/range/adaptors.hpp>
#include<root/TCanvas.h>
#include<root/TGraph.h>
#include<root/TMarker.h>
#include<boost/type_index.hpp>
#include<boost/algorithm/string.hpp>

void asymptotic(Oscillator_ const&Oscillator)
{
  auto actionVariable=[&](std::decimal::decimal32 const ActionVariable)
  {
    auto YInitials(Oscillator.YInitials(Oscillator.OscillationEnergy(ActionVariable),500));
    TGraph graph(YInitials.size()+1);
    boost::transform(YInitials,graph.GetX(),[](auto const YInitial){return YInitial.front();});
    boost::transform(YInitials,graph.GetY(),[&](auto const YInitial){return YInitial.back()*Oscillator.Mass;});
    graph.SetPoint(graph.GetN()-1,*graph.GetX(),*graph.GetY());
    return graph;
  };
  auto const File([&]{auto const File(boost::algorithm::erase_tail_copy(boost::typeindex::type_id_runtime(Oscillator).pretty_name(),1));return std::tolower(File.front(),std::locale{})+File.substr(1);}());
  TCanvas canvas;
  auto const Low(actionVariable(1));
  auto region(actionVariable(2));
  region.Set(region.GetN()*2);
  std::copy_n(Low.GetX(),Low.GetN(),std::next(region.GetX(),Low.GetN()));
  std::copy_n(Low.GetY(),Low.GetN(),std::next(region.GetY(),Low.GetN()));
  region.SetFillStyle(1001);
  region.SetFillColorAlpha(kBlack,0.3);
  region.DrawClone("af");
  auto const ActionVariable(actionVariable(std::decimal::decimal32{1.5}));
  dynamic_cast<TGraph*>(ActionVariable.DrawClone("c"))->SetLineStyle(2);
  for(auto const Marker:boost::adaptors::stride(boost::combine(boost::make_iterator_range(ActionVariable.GetX(),std::next(ActionVariable.GetX(),ActionVariable.GetN())),boost::make_iterator_range(ActionVariable.GetY(),std::next(ActionVariable.GetY(),ActionVariable.GetN()))),50)) dynamic_cast<TMarker*>(TMarker{boost::get<0>(Marker),boost::get<1>(Marker),8}.DrawClone())->SetMarkerSize(0.7);
  canvas.Print((File+".pdf").data());
}*/
