#include<mgl2/mgl.h>
#include<mgl2/base.h>
#include<boost/range.hpp>
#include<boost/range/irange.hpp>
#include"potential/eckartMorse.h"
#include"trajectory/lagrange.h"
#include"sampling/phaseSpaceApproximation.h"

namespace{

constexpr EckartMorse_ EckartMorse;

void region(mglGraph&graph,double const ReactionCoordinate,std::size_t const Low,std::size_t const Up,std::string const Color)
{
  mglData reactionCoordinate(11),oscillationMin(reactionCoordinate.nx),oscillationMax(reactionCoordinate.nx),energy(reactionCoordinate.nx);
  std::fill_n(reactionCoordinate.a,reactionCoordinate.nx,ReactionCoordinate);
  oscillationMin.Fill(Low,Up);
  std::for_each(oscillationMin.a,std::next(oscillationMin.a,oscillationMin.nx),[](auto&element){element=EckartMorse.OscillationMin(EckartMorse.OscillationEnergy(std::decimal::decimal32{element}));});
  oscillationMax.Fill(Low,Up);
  std::for_each(oscillationMax.a,std::next(oscillationMax.a,oscillationMax.nx),[](auto&element){element=EckartMorse.OscillationMax(EckartMorse.OscillationEnergy(std::decimal::decimal32{element}));});
  energy.Fill(EckartMorse.OscillationEnergy(Low),EckartMorse.OscillationEnergy(Up));
  graph.Region(reactionCoordinate,oscillationMin,energy,reactionCoordinate,oscillationMax,energy,Color.data());
}
}//namespace

void eckartMorse()
{
  mglGraph graph;
  graph.Alpha(true);
  graph.SetAlphaDef(0.3);
  graph.Rotate(50,60);
  graph.SetRanges(-EckartMorse.XInitial(),EckartMorse.XInitial(),EckartMorse.OscillationMin(EckartMorse.WellDepth*1.1),10,0,EckartMorse.WellDepth*1.1);
  graph.Axis();
  graph.Label('x',"reaction coordinate\nx (a.u.)",0,"value -0.2");
  graph.Label('y',"oscillation\ny (a.u.)",0,"value -0.2");
  graph.Label('z',"energy (a.u.)",0);
  mglData x(500),y(500),eckartMorse(x.nx,y.nx);
  x.Fill(graph.Self()->Min.x,graph.Self()->Max.x);
  y.Fill(graph.Self()->Min.y,graph.Self()->Max.y);
  std::size_t index{};
  for(auto const Y:boost::make_iterator_range(y.a,std::next(y.a,y.nx)))
    for(auto const X:boost::make_iterator_range(x.a,std::next(x.a,x.nx))) eckartMorse[index++]=EckartMorse.Potential(X,Y);
  graph.Surf(x,y,eckartMorse,"h");
  for(auto const ActionVariable:boost::irange<std::size_t>(1,EckartMorse.DissociateActionVariable().value()+1))
  {
    double const Energy{EckartMorse.OscillationEnergy(ActionVariable)},OscillationMin{EckartMorse.OscillationMin(Energy)},OscillationMax{EckartMorse.OscillationMax(Energy)};
    graph.Line({graph.Self()->Min.x,OscillationMin,Energy},{graph.Self()->Min.x,OscillationMax,Energy},"h");
    graph.Line({graph.Self()->Max.x,OscillationMin,Energy},{graph.Self()->Max.x,OscillationMax,Energy},"h");
  }
  ::region(graph,graph.Self()->Max.x,1,2,"b");
  double const EnergyX{sampling::PhaseSpaceApproximation_{EckartMorse,1}.EnergyX(std::decimal::decimal32{0.5})};
  trajectory::Lagrange_ trajectory1dim{EckartMorse,graph.Self()->Max.x,EnergyX};
  double const OscillationEnergy{EckartMorse.OscillationEnergy(std::decimal::decimal32{1.805})};
  trajectory::Trajectory2dim_ trajectory2dim{EckartMorse,trajectory1dim,EckartMorse.YInitials(OscillationEnergy,sampling::Sampling_::Division).at(sampling::Sampling_::Division/4)};
  std::vector<double> reactionCoordinate,oscillation,energy;
  trajectory2dim.reactant(nullptr,[&](double const)
      {
        auto const Trajectory(trajectory2dim.Get());
        reactionCoordinate.emplace_back(Trajectory.front());
	oscillation.emplace_back(*(Trajectory.cend()-2));
        energy.emplace_back(EnergyX+OscillationEnergy-trajectory1dim.Energy());
      });
  x.Link(reactionCoordinate.data(),reactionCoordinate.size());
  y.Link(oscillation.data(),oscillation.size());
  mglData trajectory;
  trajectory.Link(energy.data(),energy.size());
  graph.Plot(x,y,trajectory,"k");
  ::region(graph,graph.Self()->Min.x,2,3,"g");
  graph.Line({1,0,graph.Self()->Max.z},{-1,0,graph.Self()->Max.z},"rA");
  //graph.Plot(x,y,"|");
  graph.AddLegend("trajectory","k");
  graph.AddLegend("propagate backword","r");
  graph.AddLegend("product state","b");
  graph.AddLegend("reactant state","g");
  graph.Legend(3,"A");
  graph.WritePNG("../eckartMorse.png");
  graph.WritePRC("../eckartMorse");
  /*graph.Ternary(4);
  graph.Clf();
  graph.Axis();
  graph.Plot(x,y,trajectory,"k");
  graph.WriteEPS("projection.eps");
  graph.Ternary(0);*/
}

//NewFrame EndFrame ShowFrame

/*void eckartMorse();

int main()
{
  eckartMorse();
}*/
