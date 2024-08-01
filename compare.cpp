#include<mgl2/mgl.h>
#include<mgl2/base.h>
#include"potential/harmonic.h"
#include"potential/eckartMorse.h"
#include<boost/range.hpp>
#include<boost/range/irange.hpp>

void compare()
{
  constexpr Harmonic_ Harmonic;
  constexpr EckartMorse_ EckartMorse;
  mglGraph graph;
  graph.Alpha(true);
  graph.SetAlphaDef(0.3);
  graph.Rotate(50,60);
  graph.SetRanges(-2,2,Harmonic.OscillationMin(EckartMorse.WellDepth*1.1),10,0,EckartMorse.WellDepth*1.1);
  graph.SetTicks('z',Harmonic.AngularFrequency,0,Harmonic.AngularFrequency/2,"\\omega\\hbar");
  graph.Axis();
  graph.Label('x',"reaction coordinate\nx (a.u.)",0,"value -0.2");
  graph.Label('y',"oscillation\ny (a.u.)",0,"value -0.2");
  graph.Label('z',"potential (a.u.)",0);
  mglData x(500),y(500),harmonic(x.nx,y.nx),eckartMorse(x.nx,y.nx);
  x.Fill(graph.Self()->Min.x,graph.Self()->Max.x);
  y.Fill(graph.Self()->Min.y,graph.Self()->Max.y);
  std::size_t index{};
  for(auto const Y:boost::make_iterator_range(y.a,std::next(y.a,y.nx)))
    for(auto const X:boost::make_iterator_range(x.a,std::next(x.a,x.nx)))
    {
      auto const Now(index++);
      harmonic[Now]=Harmonic.Potential(X,Y);
      eckartMorse[Now]=EckartMorse.Potential(X,Y);
    }
  graph.Surf(x,y,eckartMorse,"h");
  graph.AddLegend("Morse","h");
  graph.Surf(x,y,harmonic,"b");
  graph.AddLegend("harmonic","b");
  for(auto const ActionVariable:boost::irange<std::size_t>(0,EckartMorse.DissociateActionVariable().value()))
  {
    double eigenEnergy{EckartMorse.OscillationEnergy(ActionVariable+std::decimal::decimal32{0.5})};
    double const OscillationMin{EckartMorse.OscillationMin(eigenEnergy)},OscillationMax{EckartMorse.OscillationMax(eigenEnergy)};
    graph.Line({graph.Self()->Min.x,OscillationMin,eigenEnergy},{graph.Self()->Min.x,OscillationMax,eigenEnergy},"h");
    graph.Line({graph.Self()->Max.x,OscillationMin,eigenEnergy},{graph.Self()->Max.x,OscillationMax,eigenEnergy},"h");
    eigenEnergy=Harmonic.OscillationEnergy(ActionVariable+std::decimal::decimal32{0.5});
    if(eigenEnergy<graph.Self()->Max.z)
    {
      double const OscillationMin{Harmonic.OscillationMin(eigenEnergy)},OscillationMax{Harmonic.OscillationMax(eigenEnergy)};
      graph.Line({graph.Self()->Min.x,OscillationMin,eigenEnergy},{graph.Self()->Min.x,OscillationMax,eigenEnergy},"b");
      graph.Line({graph.Self()->Max.x,OscillationMin,eigenEnergy},{graph.Self()->Max.x,OscillationMax,eigenEnergy},"b");
    }
  }
  graph.Legend(3,"A");
  graph.WritePNG("../compare.png");
  graph.WritePRC("../compare");
}

/*void compare();

int main()
{
  compare();
}*/
