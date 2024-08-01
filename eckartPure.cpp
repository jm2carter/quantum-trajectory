#include"trajectory/lagrangeAction.h"
#include"trajectory/hamiltonAction.h"
#include"potential/eckartPure.h"
#include<root/TCanvas.h>
#include<root/TF1.h>
#include<root/TAxis.h>
#include<root/TGraph.h>
#include<root/TPad.h>
#include<root/TGaxis.h>
#include<root/TArrow.h>
#include<root/TLegend.h>
#include<root/TLegendEntry.h>
#include<root/TLatex.h>
#include<root/TList.h>
#include<boost/range/algorithm.hpp>
#include<mgl2/mgl.h>
#include<boost/algorithm/string.hpp>
#include<boost/type_index.hpp>
#include<unordered_map>
#include<boost/format.hpp>
#include<boost/range/irange.hpp>
#include<boost/range/adaptors.hpp>

namespace
{

std::unordered_map<std::string,std::pair<short,std::string>>const Color{{"single",{kRed,"r"}},{"separate",{kBlue,"b"}}};
constexpr auto File("../eckart.pdf"); 

void propagate(double const Factor)
{
  double const EigenEnergy(Factor*Eckart.BarrierHeight);
  TLegend legend{0.12,0.5,0.5,0.7};
  legend.SetBorderSize(0);
  legend.SetFillStyle(0);
  TLatex latex;
  latex.SetTextFont(42);
  TF1 potential{"",[](auto const*variable,auto const){return Eckart.Potential(variable[0]);},-Eckart.XInitial(),Eckart.XInitial(),0};
  potential.SetNpx(500);
  potential.SetLineColor(kBlack);
  potential.SetLineStyle(9);
  potential.SetTitle("propagate backward");
  potential.SetMaximum(std::max(EigenEnergy,Eckart.BarrierHeight)*1.1);
  auto const Potential(potential.DrawCopy("c"));
  Potential->GetXaxis()->SetTitle("position(a.u.)");
  Potential->GetYaxis()->SetTitle("potential(a.u.)");
  Potential->GetXaxis()->CenterTitle();
  Potential->GetYaxis()->CenterTitle();
  Potential->GetYaxis()->SetTitleOffset(1.5);
  legend.AddEntry(std::addressof(potential),"potential","l");
  TGraph graph(std::addressof(potential));
  std::vector<std::complex<double>>waveFunction(graph.GetX(),std::next(graph.GetX(),graph.GetN()));
  for(auto&element:waveFunction) element=Eckart.WaveFunction(Eckart.Mass,EigenEnergy,element.real());
  boost::transform(waveFunction,graph.GetY(),[](auto const WaveFunction){return std::norm(WaveFunction);});
  trajectory::HamiltonAction_ quantum{Eckart,potential.GetXmax(),EigenEnergy};
  std::vector<double> time,position,energy,momentum,density,action;
  quantum.reactant(nullptr,[&,Velocity=quantum.Velocity()](double const Time)
      {
        time.emplace_back(Time);
        auto const Trajectory(quantum.Get());
        position.emplace_back(Trajectory.front());
        energy.emplace_back(quantum.Energy()+Eckart.Potential(Trajectory.front()));
        momentum.emplace_back(quantum.Momentum());
	density.emplace_back(Velocity/quantum.Velocity());
	action.emplace_back(Trajectory.back());
      });
  for(auto&element:density) element*=quantum.Transmission(EigenEnergy);
  TPad pad{"","",0.1,0.1,0.9,0.9};//GetXlowNDC,GetYlowNDC,GetWNDC,GetHNDC
  pad.SetFillStyle(4000);
  gPad->Update();
  if(Factor==1)
  {
    pad.Range(gPad->GetUxmin(),time.back(),gPad->GetUxmax(),time.front());
    pad.cd();
    graph.SetLineStyle(1);
    graph.DrawGraph(position.size(),position.data(),time.data());
    legend.AddEntry(pad.GetListOfPrimitives()->Last(),"trajectory","l");
    pad.GetMother()->cd();
    pad.DrawClone();
    TGaxis axis{gPad->GetUxmax(),gPad->GetUymin(),gPad->GetUxmax(),gPad->GetUymax(),pad.GetUymin(),pad.GetUymax(),510,"L+"};
    axis.SetTitle("time(a.u.)");
    axis.CenterTitle();
    axis.SetTitleOffset(1.3);
    axis.DrawClone();
    TArrow arrow{gPad->AbsPixeltoX(gPad->UtoAbsPixel(0.45)),gPad->AbsPixeltoY(gPad->VtoAbsPixel(0.93)),gPad->AbsPixeltoX(gPad->UtoAbsPixel(0.55)),gPad->AbsPixeltoY(gPad->VtoAbsPixel(0.93))};///DNC
    arrow.SetOption("<");
    arrow.SetLineColor(kViolet);
    arrow.DrawClone();
    latex.DrawLatexNDC(0.1,0.95,"reactant (left)");
    latex.DrawLatexNDC(0.9,0.95,"product (right)")->SetTextAlign(31);
    legend.DrawClone();
    gPad->Print(::File);
    for(auto const Element:boost::irange<std::size_t>(0,6)) gPad->GetListOfPrimitives()->RemoveLast();
    legend.GetListOfPrimitives()->RemoveLast();
  }
  Potential->GetYaxis()->SetTitle("energy,potential(a.u.)");
  //if(pad.GetUxmin()==0&&pad.GetUxmax()==1&&pad.GetUymin()==0&&pad.GetUymax()==1)
  auto const DensityRange(std::minmax_element(graph.GetY(),std::next(graph.GetY(),graph.GetN())));
  auto const MomentumRange(std::minmax_element(momentum.cbegin(),momentum.cend()));
  pad.Range(gPad->GetUxmin(),std::min(*DensityRange.first,*MomentumRange.first),gPad->GetUxmax(),std::max(*DensityRange.second,*MomentumRange.second)*1.05);
  auto const Color(::Color.at("single"));
  graph.SetLineColor(Color.first);
  graph.SetLineStyle(9);
  graph.DrawGraph(position.size(),position.data(),energy.data());
  latex.DrawLatex(potential.GetXmin(),EigenEnergy,"trajectory energy(dash) ")->SetTextAlign(13);
  pad.cd();
  graph.SetLineStyle(10);
  graph.DrawGraph(position.size(),position.data(),momentum.data());
  latex.DrawLatex(potential.GetXmin(),momentum.back(),"momentum(dot dash) ")->SetTextAlign(11);
  graph.SetLineStyle(1);
  graph.DrawGraph(position.size(),position.data(),density.data());

  std::vector<double>A(25),B(A.size());
  boost::copy(boost::adaptors::stride(boost::make_iterator_range_n(graph.GetX(),graph.GetN()),graph.GetN()/A.size()),A.begin());
  boost::copy(boost::adaptors::stride(boost::make_iterator_range_n(graph.GetY(),graph.GetN()),graph.GetN()/B.size()),B.begin());

  graph.SetMarkerStyle(5);
  graph.SetMarkerColor(kBlack);
  graph.DrawGraph(A.size(),A.data(),B.data(),"p");
  legend.AddEntry(gPad->GetListOfPrimitives()->Last(),"analytic density","p");
  //graph.DrawClone("c");
  latex.DrawLatex(*std::next(graph.GetX(),graph.GetN()-1),*std::next(graph.GetY(),graph.GetN()-1),"density(solid) ")->SetTextAlign(33);
  pad.GetMother()->cd();
  pad.DrawClone();
  TGaxis axis{gPad->GetUxmax(),gPad->GetUymin(),gPad->GetUxmax(),gPad->GetUymax(),pad.GetUymin(),pad.GetUymax(),510,"L+"};
  axis.SetTitle("momentum,density(a.u.)");
  axis.CenterTitle();
  axis.DrawClone();
  TArrow arrow{gPad->AbsPixeltoX(gPad->UtoAbsPixel(0.45)),gPad->AbsPixeltoY(gPad->VtoAbsPixel(0.93)),gPad->AbsPixeltoX(gPad->UtoAbsPixel(0.55)),gPad->AbsPixeltoY(gPad->VtoAbsPixel(0.93))};///DNC
  arrow.SetOption("<");
  arrow.SetLineColor(kViolet);
  arrow.DrawClone();
  latex.DrawLatexNDC(0.1,0.95,"reactant");
  latex.DrawLatexNDC(0.9,0.95,"product")->SetTextAlign(31);
  latex.DrawLatexNDC(0.98,0.02,std::data("E_{eigen}="+boost::str(boost::format("%1%")%Factor)+"H"))->SetTextAlign(31);
  legend.AddEntry(static_cast<TObject*>(nullptr),"single","")->SetTextColor(Color.first);
  legend.DrawClone();
  gPad->Print(::File);
  gPad->Clear();
  mglGraph gr;
  gr.Rotate(50,60);
  mglData real{potential.GetNpx()},imag{potential.GetNpx()};
  boost::transform(waveFunction,real.a,[](auto const WaveFunction){return WaveFunction.real();});
  boost::transform(waveFunction,imag.a,[](auto const WaveFunction){return WaveFunction.imag();});
  auto const RealRange(std::minmax_element(real.a,std::next(real.a,real.nx))),ImagRange(std::minmax_element(imag.a,std::next(imag.a,imag.nx)));
  gr.SetRanges(potential.GetXmin(),potential.GetXmax(),*RealRange.first,*RealRange.second,*ImagRange.first,*ImagRange.second);
  gr.AddLegend(std::data("E_{eigen}="+boost::str(boost::format("%1%")%Factor)+"H"),"");
  gr.AddLegend("analytic","k");
  gr.Plot(mglData{graph.GetX(),graph.GetN()},real,imag,"k");
  real.Create(position.size());
  imag.Create(position.size());
  double const InitialAction{std::arg(Eckart.WaveFunction(Eckart.Mass,EigenEnergy,potential.GetXmax()))};
  boost::transform(density,action,real.a,[&](auto const Density,auto const Action){return std::sqrt(Density)*std::cos(Action+InitialAction);});
  boost::transform(density,action,imag.a,[&](auto const Density,auto const Action){return std::sqrt(Density)*std::sin(Action+InitialAction);});
  gr.AddLegend("single",Color.second.data());
  gr.Plot(mglData{position.data(),position.size()},real,imag,(Color.second+" #o").data());
  gr.Axis();
  gr.Label('x',"position(a.u.)",0);
  gr.Label('y',"real",0);
  gr.Label('z',"imaginary",0);
  gr.Legend(3,"");
  gr.WritePNG(std::data("../waveFunction"+boost::str(boost::format("%1%")%Factor)+".png"));
  gr.WritePRC(std::data("../waveFunction"+boost::str(boost::format("%1%")%Factor)));
}

void probability(std::string const&Quantum,std::function<double(double const)>const&Probability)
{
  gPad->Print(::File);
  auto&graph(*dynamic_cast<TGraph*>(gPad->GetListOfPrimitives()->At(1)));
  std::transform(graph.GetX(),std::next(graph.GetX(),graph.GetN()),graph.GetY(),Probability);
  graph.SetLineColor(::Color.at(Quantum).first);
}

void probabilities()
{
  TF1 analytic{"",[](auto const*Variable,auto const*){return Eckart.Analytic(Eckart.Mass,Variable[0]);},0,2*Eckart.BarrierHeight,0};
  analytic.SetNpx(500);
  analytic.SetLineColor(kBlack);
  TGraph graph(std::addressof(analytic));
  graph.GetXaxis()->SetLimits(analytic.GetXmin(),analytic.GetXmax());
  graph.GetXaxis()->SetTitle("eigenenergy(a.u.)");
  graph.GetYaxis()->SetTitle("transmission probability");
  graph.GetXaxis()->CenterTitle();
  graph.GetYaxis()->CenterTitle();
  graph.DrawClone("ac");
  TLegend legend{0.1,0.7,0.3,0.9};
  legend.SetBorderSize(0);
  legend.SetFillStyle(0);
  legend.AddEntry(static_cast<TObject*>(nullptr),"analytic","");
  for(auto const Element: ::Color)legend.AddEntry(static_cast<TObject*>(nullptr),Element.first.data(),"")->SetTextColor(Element.second.first);
  legend.DrawClone();
  probability("single",[](auto const EigenEnergy){trajectory::Hamilton_ quantum{Eckart,Eckart.XInitial(),EigenEnergy};quantum.reactant();return quantum.Transmission(EigenEnergy);});
  probability("separate",[](auto const EigenEnergy){trajectory::HamiltonAction_ quantum{Eckart,Eckart.XInitial(),EigenEnergy};return std::norm(quantum.split().front());});
}
}//namespace;

void eckartPure()
{
  TCanvas canvas;
  using namespace std::literals;
  canvas.Print(std::data(File+"["s));
  for(auto const Factor:std::vector<double>{1,0.1,0.5,1.5,2}) propagate(Factor);
  probabilities();
  canvas.Print(std::data(File+")"s));
}

/*void eckartPure();

int main()
{
  eckartPure();
}*/
