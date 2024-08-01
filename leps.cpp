#include<mgl2/mgl.h>
#include<mgl2/base.h>
#include<boost/range/irange.hpp>
#include<boost/range/combine.hpp>
#include"potential/leps.h"
#include"trajectory/classical.h"
#include"sampling/phaseSpaceApproximation.h"
#include"boundary.h"
#include<root/TCanvas.h>
#include<root/TF2.h>
#include<root/TAxis.h>
#include<root/TLine.h>
#include<root/TLatex.h>
#include<root/TLegend.h>
#include<root/TLegendEntry.h>

void leps()
{
  constexpr Leps_ Leps;
  mglGraph graph;
  graph.Alpha(true);
  graph.SetAlphaDef(0.3);
  graph.Rotate(50,120);
  //graph.Aspect(1,1);
  graph.SetRanges(0,Leps.XInitial(),0,Leps.XInitial()/*leps.reflection(Leps.XInitial(),0).back()*/,-Leps.WellDepth,0.01);
  graph.SetCut(false);
  graph.Axis();
  graph.Label('x',"x(a.u.)",0,"value -0.2");
  graph.Label('y',"y(a.u.)",0,"value -0.2");
  graph.Label('z',"energy(a.u.)",0,"value 0.2");
  mglData x(500),y(500),z(x.nx,y.nx),a(z.nx,z.ny);
  x.Fill(graph.Self()->Min.x,graph.Self()->Max.x);
  y.Fill(graph.Self()->Min.x,graph.Self()->Max.y);
  std::size_t index{};
  for(auto const Y:boost::make_iterator_range(y.a,std::next(y.a,y.nx)))
    for(auto const X:boost::make_iterator_range(x.a,std::next(x.a,x.nx)))
    {
      double const YBottom{Leps.OscillationMin(graph.Self()->Max.z)*0.9};
      z.a[index++]=upperRight(X,Y,graph.Self()->Max.x)<0&&upperLeft(X,Y,YBottom)<0&&Y>YBottom?Leps.Potential(X,Y):NAN;
    }
  //std::for_each(z.a,z.a+x.nx*y.nx,[](auto&z){if(z>=0.05||z==NAN)z=0.05;});
  //std::transform(z.a,z.a+x.nx*y.nx,a.a,[](auto const Z){return Z==0.05?-1:0;});
  graph.Surf(x,y,z,"h");
  for(auto const ActionVariable:boost::irange<std::size_t>(1,Leps.DissociateActionVariable().value()+1))
  {
    double const Energy{Leps.OscillationEnergy(ActionVariable)},OscillationMin{Leps.OscillationMin(Energy)},OscillationMax{Leps.OscillationMax(Energy)};
    graph.Line({graph.Self()->Max.x,OscillationMin,Energy},{graph.Self()->Max.x,OscillationMax,Energy},"h");
    auto const MinReflection(Leps.reflection(graph.Self()->Max.x,OscillationMin)),MaxReflection(Leps.reflection(graph.Self()->Max.x,OscillationMax));
    graph.Line({MaxReflection.front(),MaxReflection.back(),Energy},{MinReflection.front(),MinReflection.back(),Energy},"h");
  }
  double const EnergyX{sampling::PhaseSpaceApproximation_{Leps,7}.EnergyX(std::decimal::decimal32{9.01})};
  double const OscillationEnergy{Leps.OscillationEnergy(std::decimal::decimal32{7.915})};
  for(auto const Element:boost::combine(boost::irange<std::size_t>(51,54),std::array<std::string,3>{"k","b","g"}))
  {
    trajectory::Classical_ trajectory1dim{Leps,graph.Self()->Max.x,EnergyX};
    trajectory::Trajectory2dim_ trajectory2dim{Leps,trajectory1dim,Leps.YInitials(OscillationEnergy,sampling::Sampling_::Division).at(boost::get<0>(Element))};
    std::vector<double> reactionCoordinate,oscillation,energy;
    trajectory2dim.reactant(nullptr,[&](double const)
        {
	  auto const Trajectory(trajectory2dim.Get());
          reactionCoordinate.emplace_back(Trajectory.front());
	  oscillation.emplace_back(*(Trajectory.cend()-2));
	  if(oscillation.back()<Trajectory.front()*std::tan(M_PI/6)) energy.emplace_back(EnergyX+OscillationEnergy-trajectory1dim.Energy());
	  else if(upperRight(Trajectory.front(),oscillation.back(),graph.Self()->Max.x)<0) energy.emplace_back(EnergyX+OscillationEnergy-Leps.Mass/2*std::pow(Leps_::reflection(Trajectory.at(1),Trajectory.back()).front(),2));
	  else energy.emplace_back(NAN);
        });
    x.Link(reactionCoordinate.data(),reactionCoordinate.size());
    y.Link(oscillation.data(),oscillation.size());
    mglData trajectory;
    trajectory.Link(energy.data(),energy.size());
    graph.Plot(x,y,trajectory,boost::get<1>(Element).data());
  }
  graph.AddLegend("inelastic","k");
  graph.AddLegend("dissociate","b");
  graph.AddLegend("exchange","g");
  graph.AddLegend("propagate backward","r");
  graph.Legend(3,"A");
  graph.SetArrowSize(2);
  graph.Arc({graph.Self()->Max.x/2,graph.Self()->Max.x/2*std::tan(M_PI/6),graph.Self()->Max.z},{graph.Self()->Max.x/2,0,graph.Self()->Max.z},-90,"r1A");
  graph.WritePNG("../leps.png");
  graph.WritePRC("../leps");
  TCanvas canvas;
  TLegend legend{0.12,0.8,0.5,0.9};
  legend.SetBorderSize(0);
  legend.SetFillStyle(0);
  TF2 contour("",[](auto const*Variable,auto const*){return Leps.Potential(Variable[0],Variable[1]);},0,8,0,8,0);
  contour.SetTitle("LEPS");
  contour.SetNpx(500);
  contour.SetNpy(500);
  contour.SetLineColor(kBlack);
  contour.SetLineWidth(1);
  std::vector<double>levels{0.0003,0.003,0.01,0.015,0.02,0.03,0.04,0.05,0.06,0.07,0.08,0.09,0.1};
  for(auto&element:levels) element-=Leps.WellDepth;
  contour.SetContour(levels.size(),levels.data());
  auto const Contour(contour.DrawCopy());
  Contour->GetXaxis()->SetTitle("x(a.u.)");
  Contour->GetXaxis()->CenterTitle();
  Contour->GetYaxis()->SetTitle("y(a.u.)");
  Contour->GetYaxis()->CenterTitle();
  legend.AddEntry(std::addressof(contour),"potential contours","l")->SetTextColor(contour.GetLineColor());
  TLine line(0,0,contour.GetYmax()*std::tan(Leps.Theta),contour.GetYmax());
  line.SetLineWidth(1);
  line.DrawClone();
  TLatex latex(0.2,0.8,"#theta");
  latex.SetTextFont(42);
  latex.DrawClone();
  latex.DrawLatex(contour.GetXmax(),contour.GetXmax()*std::tan(M_PI/6)*0.8,"product")->SetTextAlign(31);
  latex.DrawLatex(contour.GetXmax(),contour.GetXmax()*std::tan(M_PI/6),"reactant")->SetTextAlign(31);
  line.SetLineStyle(9);
  legend.AddEntry(line.DrawLine(0,0,contour.GetXmax(),contour.GetXmax()*std::tan(M_PI/6)),"dividing surface","l");
  TF2 reactionCoordinate("",[](auto const*Variable,auto const*){return Leps.Derivative(Variable[0],Variable[1])+Leps.DerivativeY(Variable[0],Variable[1])*std::tan(M_PI/6);},0,contour.GetXmax(),0,contour.GetYmax(),0);
  reactionCoordinate.SetNpx(500);
  reactionCoordinate.SetNpy(500);
  levels={0};
  reactionCoordinate.SetContour(levels.size(),levels.data());
  reactionCoordinate.DrawClone("same");
  legend.AddEntry(reactionCoordinate.DrawClone("same"),"reaction path","l")->SetTextColor(reactionCoordinate.GetLineColor());
  legend.DrawClone();
  canvas.Print("../contour.pdf");
}

/*#include<root/TApplication.h>//root-plugin-graf2d-asimage,root-plugin-graf2d-x11 libroot-graf3d-g3d5.34  
#include<root/TCanvas.h>

void leps()
{
  constexpr Leps_ Leps;
  TApplication theApp("",nullptr,nullptr);
  TCanvas canvas;
  TF2 leps("",[](auto const*variable,auto const*){return Leps.Potential(variable[0],variable[1]);},0,8,0,8);
  leps.Draw("surf1");
  theApp.Run();
}*/
