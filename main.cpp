#include"plot.h"
#include"potential/eckartAffineMorse.h"

int main()
{
  EckartAffineMorse_ const Oscillator;
  Plot_{Oscillator}();
}

/*#include"sampling/classical.h"
#include"potential/leps.h"
#include<fstream>
#include<iostream>
#include<iomanip>
#include<boost/range/combine.hpp>

int main()
{
  Leps_ const Potential;
  sampling::Classical_ const Sampling{Potential};
  std::vector<double> energies;
  for(std::decimal::decimal32 actionVariable{1./Sampling.Division};actionVariable<=Sampling.MaxActionVariable();actionVariable+=std::decimal::decimal32{1./Sampling.Division}) energies.emplace_back(Sampling.MicrocanonicalEnergy(actionVariable));
  std::vector<double>probabilities(energies.size());
  for(auto const Level:boost::irange<std::size_t>(0,Potential.MaxActionVariable()))
  {
    std::ifstream file{"../leps/"+std::to_string(Level)+"/classical"};
    std::string const Probabilities{std::istreambuf_iterator<char>{file},std::istreambuf_iterator<char>{}};
    std::transform(std::make_reverse_iterator(reinterpret_cast<double const*>(Probabilities.data()+Probabilities.size())),std::make_reverse_iterator(reinterpret_cast<double const*>(Probabilities.data())),probabilities.crbegin(),probabilities.rbegin(),std::plus<double>{});
  }
  for(auto const Element:boost::combine(energies,probabilities)) std::cout<<std::setprecision(12)<<std::setw(20)<<boost::get<0>(Element)<<std::setw(20)<<boost::get<1>(Element)<<std::endl;
}*/

/*#include"trajectory/lagrangeAction.h"
#include"trajectory/hamiltonAction.h"
#include"potential/eckartPure.h"
#include<boost/range/algorithm.hpp>
#include<mgl2/mgl.h>

int main()
{
  mglGraph graph;
  graph.Rotate(50,60);
  mglData position(500),real(position.nx),imag(position.nx);
  position.Fill(-4,4);
  std::transform(position.a,std::next(position.a,position.nx),real.a,[](auto const Position){return Eckart.WaveFunction(Eckart.Mass,Eckart.BarrierHeight,Position).real();});
  auto const RealRange(std::minmax_element(real.a,std::next(real.a,real.nx)));
  std::transform(position.a,std::next(position.a,position.nx),imag.a,[](auto const Position){return Eckart.WaveFunction(Eckart.Mass,Eckart.BarrierHeight,Position).imag();});
  auto const ImagRange(std::minmax_element(imag.a,std::next(imag.a,imag.nx)));
  graph.SetRanges(*position.a,*std::next(position.a,position.nx-1),*RealRange.first,*RealRange.second,*ImagRange.first,*ImagRange.second);
  graph.Axis();
  graph.Label('x',"position(a.u.)",0,"value -0.2");
  graph.Label('y',"real",0,"value -0.2");
  graph.Label('z',"imaginary",0);
  graph.Plot(position,real,imag,"k");
  trajectory::LagrangeAction_ quantum{Eckart,Eckart.XInitial(),Eckart.BarrierHeight};
  std::vector<double> positions;
  std::vector<std::complex<double>>waveFunction;
  using namespace std::literals;
  auto const Amplitude(quantum.split([&,Velocity=quantum.Velocity()]()
      {
        auto const Trajectory(quantum.Get());
        positions.emplace_back(Trajectory.front());
	waveFunction.emplace_back(std::sqrt(Velocity/quantum.Velocity())*std::exp(1i*Trajectory.back()));
      }));
  positions.resize(positions.size()*2);
  std::transform(std::next(positions.crbegin(),positions.size()/2),positions.crend(),std::next(positions.begin(),positions.size()/2),std::negate<>{});
  waveFunction.resize(waveFunction.size()*2);
  std::transform(std::next(waveFunction.crbegin(),waveFunction.size()/2),waveFunction.crend(),std::next(waveFunction.begin(),waveFunction.size()/2),[&](auto const WaveFunction){return std::conj(WaveFunction)+Amplitude.back()*WaveFunction;});
  std::for_each(waveFunction.begin(),std::next(waveFunction.begin(),waveFunction.size()/2),[&](auto&WaveFunction){WaveFunction*=Amplitude.front();});
  position.Link(positions.data(),positions.size());
  real.Create(waveFunction.size());
  boost::transform(waveFunction,real.a,[&](auto const WaveFunction){return std::real(WaveFunction*std::exp(1i*(std::arg(Eckart.WaveFunction(Eckart.Mass,Eckart.BarrierHeight,4))-std::arg(waveFunction.front()))));});
  imag.Create(waveFunction.size());
  boost::transform(waveFunction,imag.a,[&](auto const WaveFunction){return std::imag(WaveFunction*std::exp(1i*(std::arg(Eckart.WaveFunction(Eckart.Mass,Eckart.BarrierHeight,4))-std::arg(waveFunction.front()))));});
  graph.Plot(position,real,imag," b#o");
  graph.WritePRC("test");
}*/

/*#include"sampling/classical.h"
#include"potential/leps.h"
#include<fstream>
#include<root/TCanvas.h>
#include<root/TGraph.h>
#include<root/TAxis.h>
#include<root/TLatex.h>
#include<boost/range/join.hpp>

int main()
{
  Leps_ const Potential;
  sampling::Classical_ const Sampling{Potential};
  std::vector<double> energies;
  for(std::decimal::decimal32 actionVariable{1./Sampling.Division};actionVariable<=Sampling.MaxActionVariable();actionVariable+=std::decimal::decimal32{1./Sampling.Division}) energies.emplace_back(Sampling.MicrocanonicalEnergy(actionVariable));
  TCanvas canvas;
  canvas.Print("haha.pdf[");
  for(auto const ToLevel:boost::irange<std::size_t>(0,Potential.DissociateActionVariable().value()))
  {
    std::vector<std::vector<double>>probabilities(2*Potential.DissociateActionVariable().value()-1);
    for(auto&element:probabilities) element.resize(energies.size());
    std::vector<decltype(probabilities.front().begin())>maxs(probabilities.size());
    for(auto const FromLevel:boost::irange<std::size_t>(0,Potential.DissociateActionVariable().value()))
    {
      std::ifstream file{"../leps/"+std::to_string(ToLevel)+"/"+std::to_string(FromLevel)};
      std::string probability{std::istreambuf_iterator<char>{file},std::istreambuf_iterator<char>{}};
      std::copy_backward(reinterpret_cast<double const*>(probability.data()),reinterpret_cast<double const*>(std::next(probability.data(),probability.size())),probabilities.at(FromLevel).end());
      maxs.at(FromLevel)=boost::max_element(probabilities.at(FromLevel));
      if(FromLevel-ToLevel)
      {
        file.close();
        file.open("../leps/"+std::to_string(FromLevel)+"/"+std::to_string(ToLevel));
        probability=std::string{std::istreambuf_iterator<char>{file},std::istreambuf_iterator<char>{}};
	auto const Index(FromLevel+Potential.DissociateActionVariable().value()+(FromLevel<ToLevel?0:-1));
        std::copy_backward(reinterpret_cast<double const*>(probability.data()),reinterpret_cast<double const*>(std::next(probability.data(),probability.size())),probabilities.at(Index).end());
        maxs.at(Index)=boost::max_element(probabilities.at(Index));
      }
    }
    for(auto const Range:std::vector<std::pair<std::size_t,std::size_t>>{{0,9},{9,Potential.DissociateActionVariable().value()}})
    {
      TGraph graph(energies.size(),energies.data(),probabilities.at(Range.first).data());
      graph.SetTitle(std::data("state-to-state reaction probabilities for PSA with product state "+std::to_string(ToLevel)));
      graph.GetXaxis()->SetLimits(energies.front(),energies.back());
      std::pair<std::size_t,std::size_t> shift{Potential.DissociateActionVariable().value(),Potential.DissociateActionVariable().value()-1};
      if(ToLevel<Range.first) shift.first-=1;
      else if(ToLevel>=Range.second) shift.second+=1;
      graph.SetMaximum(*boost::max_element(boost::join(maxs|boost::adaptors::sliced(Range.first,Range.second),maxs|boost::adaptors::sliced(Range.first+shift.first,Range.second+shift.second))|boost::adaptors::indirected)*1.03);
      graph.GetXaxis()->SetTitle("microcanonical energy(a.u.)");
      graph.GetXaxis()->CenterTitle();
      graph.GetYaxis()->SetTitle("reaction probability");
      graph.GetYaxis()->CenterTitle();
      graph.GetYaxis()->SetTitleOffset(1.5);
      graph.SetLineWidth(1);
      graph.DrawClone("al");
      TLatex latex;
      latex.SetTextFont(42);
      latex.SetTextSize(0.03);
      latex.SetTextAlign(21);
      for(auto const FromLevel:boost::irange<std::size_t>(Range.first,Range.second))
      {
	auto max(maxs.at(FromLevel));
	if(*max)
	{
	  if(FromLevel!=Range.first)graph.DrawGraph(energies.size(),energies.data(),probabilities.at(FromLevel).data(),"l");
	  latex.DrawLatex(energies.at(max-probabilities.at(FromLevel).cbegin())*1.01,*max,std::to_string(FromLevel).data())->SetTextAlign(31);
	}
	auto const Index(FromLevel+Potential.DissociateActionVariable().value()+(FromLevel<ToLevel?0:-1));
	max=maxs.at(Index);
	if(*max)
	{
	  graph.SetLineColor(kBlue);
	  graph.DrawGraph(energies.size(),energies.data(),probabilities.at(Index).data(),"l");
	  latex.DrawLatex(energies.at(max-probabilities.at(Index).cbegin()),*max,std::to_string(FromLevel).data())->SetTextColor(graph.GetLineColor());
	  graph.SetLineColor(kBlack);
	}
      }
      canvas.Print("haha.pdf");
    }
  }
  canvas.Print("haha.pdf]");
}*/

/*#include<mgl2/mgl.h>
#include<mgl2/base.h>
#include<boost/range.hpp>
#include<boost/range/irange.hpp>
#include"potential/eckartMorse.h"
#include"trajectory/lagrange.h"
#include"sampling/phaseSpaceApproximation.h"

double Couple{-0.25};

int main()
{
  constexpr EckartMorse_ EckartMorse;
  mglGraph graph;
  graph.Alpha(true);
  graph.SetAlphaDef(0.5);
  graph.Rotate(50,60);
  graph.SetRanges(-0.5,0.5,-1,1.5,0,3e-3);
  graph.Axis();
  graph.Label('x',"reaction coordinate\nx (a.u.)",0,"value -0.2");
  graph.Label('y',"oscillation\ny (a.u.)",0,"value -0.2");
  graph.Label('z',"potential (a.u.)",0,"value 0.1");
  mglData x(500),y(500),eckartMorse(x.nx,y.nx);
  x.Fill(graph.Self()->Min.x,graph.Self()->Max.x);
  y.Fill(graph.Self()->Min.y,graph.Self()->Max.y);
  std::size_t index{};
  for(auto const Y:boost::make_iterator_range(y.a,std::next(y.a,y.nx)))
    for(auto const X:boost::make_iterator_range(x.a,std::next(x.a,x.nx))) eckartMorse[index++]=EckartMorse.Potential(X,Y);
  graph.Surf(x,y,eckartMorse,"g");
  graph.AddLegend("coupling parameter=-0.25","g");
  graph.SetAlphaDef(0.3);
  index=0;
  Couple=0;
  for(auto const Y:boost::make_iterator_range(y.a,std::next(y.a,y.nx)))
    for(auto const X:boost::make_iterator_range(x.a,std::next(x.a,x.nx))) eckartMorse[index++]=EckartMorse.Potential(X,Y);
  graph.Surf(x,y,eckartMorse,"b");
  graph.AddLegend("uncoupled","b");
  graph.SetAlphaDef(0.1);
  index=0;
  Couple=1;
  for(auto const Y:boost::make_iterator_range(y.a,std::next(y.a,y.nx)))
    for(auto const X:boost::make_iterator_range(x.a,std::next(x.a,x.nx))) eckartMorse[index++]=EckartMorse.Potential(X,Y);
  graph.Surf(x,y,eckartMorse,"h");
  graph.AddLegend("coupling parameter=1","h");
  graph.Legend(3,"A");
  graph.WritePNG("../couple.png");
  graph.WritePRC("../couple");
}*/

//记得改oscillator.h的couple

/*#include"sampling/classical.h"
#include"potential/leps.h"
#include<fstream>
#include<root/TCanvas.h>
#include<root/TGraph.h>
#include<root/TMultiGraph.h>
#include<root/TAxis.h>
#include<root/TLatex.h>
#include<boost/range/join.hpp>

int main()
{
  Leps_ const Potential;
  sampling::Classical_ const Sampling{Potential};
  std::vector<double> energies;
  for(std::decimal::decimal32 actionVariable{1./Sampling.Division};actionVariable<=Sampling.MaxActionVariable();actionVariable+=std::decimal::decimal32{1./Sampling.Division}) energies.emplace_back(Sampling.MicrocanonicalEnergy(actionVariable));
  TCanvas canvas;
  canvas.Print("haha.pdf[");
  for(auto const ToLevel:boost::irange<std::size_t>(0,Potential.DissociateActionVariable().value()))
  {
    TMultiGraph graphs;
    for(auto const FromLevel:boost::irange<std::size_t>(0,Potential.DissociateActionVariable().value()))
    {
      std::ifstream file{"../leps/"+std::to_string(ToLevel)+"/"+std::to_string(FromLevel)};
      std::string const Probabilities{std::istreambuf_iterator<char>{file},std::istreambuf_iterator<char>{}};
      std::vector<double>probabilities(energies.size());
      std::copy_backward(reinterpret_cast<double const*>(Probabilities.data()),reinterpret_cast<double const*>(std::next(Probabilities.data(),Probabilities.size())),probabilities.end());
      TGraph graph(energies.size(),energies.data(),probabilities.data());
      graphs.Add(new auto(graph));
      if(ToLevel-FromLevel)
      {
        file.close();
        file.open("../leps/"+std::to_string(FromLevel)+"/"+std::to_string(ToLevel));
        std::string const Haha{std::istreambuf_iterator<char>{file},std::istreambuf_iterator<char>{}};
        boost::fill(probabilities,0);
        std::copy_backward(reinterpret_cast<double const*>(Haha.data()),reinterpret_cast<double const*>(std::next(Haha.data(),Haha.size())),probabilities.end());
        boost::copy(probabilities,graph.GetY());
        graph.SetLineColor(kBlue);
        graphs.Add(new auto(graph));
      }
    }
    graphs.Draw("al");
    TLatex latex;
    latex.SetTextFont(42);
    latex.SetTextSize(0.03);
    latex.SetTextAlign(21);
    for(auto const Level:boost::irange<std::size_t>(0,graphs.GetListOfGraphs()->GetSize()))
    {
      auto const&Graph(*dynamic_cast<TGraph*>(graphs.GetListOfGraphs()->At(Level)));
      if(Level<=12)
      {
        auto const Max(std::max_element(Graph.GetY(),std::next(Graph.GetY(),Graph.GetN())));
        latex.DrawLatex(energies.at(Max-Graph.GetY()),*Max,std::to_string(Level).data());
      }
      else latex.DrawLatex(energies.back(),*std::next(Graph.GetY(),Graph.GetN()-1),std::to_string(Level).data())->SetTextAlign(31);
    }
    canvas.Print("haha.pdf");
  }
  canvas.Print("haha.pdf]");
}*/

/*#include"potential/eckartAffineMorse.h"
#include"potential/leps.h"
#include<root/TCanvas.h>
#include<root/TF1.h>
#include<root/TLegend.h>
#include<root/TLegendEntry.h>
#include<root/TAxis.h>
#include<boost/format.hpp>

int main()
{
  TCanvas canvas;
  constexpr EckartAffineMorse_ Oscillator;
  TF1 graph{"",[](auto const*Variable,auto const*){return Oscillator.Potential(0,Variable[0]);},0,10,0};
  constexpr Leps_ Leps;
  TF1 graph1{"",[](auto const*Variable,auto const*){return Leps.Potential(Variable[0]*std::cos(M_PI/6),Variable[0]*std::sin(M_PI/6));},0,10,0};
  graph1.SetMaximum(0.02);
  graph1.SetLineColor(kBlack);void eckartPure();
  graph1.Draw();
  graph.SetLineColor(kBlue);
  graph.Draw("same");
  graph1.SetTitle(std::data("b="+boost::str(boost::format("%1%")%Couple)));
  graph1.GetXaxis()->SetTitle("position (a.u.)");
  graph1.GetYaxis()->SetTitle("potential (a.u.)");
  graph1.GetXaxis()->CenterTitle();
  graph1.GetYaxis()->CenterTitle();
  graph1.GetYaxis()->SetTitleOffset(1.3);
  TLegend legend{0.7,0.1,0.9,0.3};
  legend.SetBorderSize(0);
  legend.SetFillStyle(0);
  legend.AddEntry(static_cast<TObject*>(nullptr),"LEPS","")->SetTextColor(graph1.GetLineColor());
  legend.AddEntry(static_cast<TObject*>(nullptr),"simulate","")->SetTextColor(graph.GetLineColor());
  legend.Draw();
  canvas.Print("tata.pdf");
}*/
