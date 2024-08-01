#include<root/TCanvas.h>
#include<root/TAxis.h>
#include<root/TList.h>
#include<root/TGraph.h>
#include<root/TLatex.h>
#include<fstream>
#include<vector>
#include<boost/range/irange.hpp>
#include"sampling/classical.h"
#include"plot.h"

Plot_::Plot_(Oscillator_ const&Oscillator):Oscillator{Oscillator}{}

void Plot_::plot(std::string const File,TLegend&legend,short const Color)const&
{
  std::ifstream file{this->Path/File};
  std::string const Probabilities{std::istreambuf_iterator<char>{file},std::istreambuf_iterator<char>{}};
  TGraph graph(this->energies.size(),this->energies.data(),reinterpret_cast<double const*>(Probabilities.data()));
  graph.SetLineColor(Color);
  graph.SetLineStyle(2);
  this->graphs.Add(new auto{graph});
  legend.AddEntry(this->graphs.GetListOfGraphs()->Last(),boost::algorithm::replace_first_copy(File,"hamiltonContinuous","quantum").data(),"l");
}

void Plot_::plot(std::string const File,TLegend&legend,short const Color,std::size_t const State)const&
{
  std::vector<double>probabilities(this->energies.size());
  TMultiGraph graphs;
  for(auto const ActionVariable:boost::irange<std::size_t>(0,State))
  {
    std::ifstream file{this->Path/std::to_string(ActionVariable)/File};
    std::string const Probabilities{std::istreambuf_iterator<char>{file},std::istreambuf_iterator<char>{}};
    std::vector<double>probability(this->energies.size());
    std::copy_backward(reinterpret_cast<double const*>(Probabilities.data()),reinterpret_cast<double const*>(std::next(Probabilities.data(),Probabilities.size())),probability.end());
    boost::transform(probabilities,probability,probabilities.begin(),std::plus<>{});
    //std::transform(std::make_reverse_iterator(reinterpret_cast<double const*>(std::next(Probabilities.data(),Probabilities.size()))),std::make_reverse_iterator(reinterpret_cast<double const*>(Probabilities.data())),probabilities.crbegin(),probabilities.rbegin(),std::plus<>{});
    graphs.Add(new TGraph{energies.size(),energies.data(),reinterpret_cast<double const*>(probability.data())});
  }
  if(File!="analytic")
  {
    graphs.Draw("al");
    TLatex latex;
    latex.SetTextFont(42);
    latex.SetTextSize(0.03);
    latex.SetTextAlign(31);
    if(typeid(this->Oscillator)!=typeid(Leps_))
    {
      graphs.SetTitle(std::data(boost::algorithm::replace_first_copy(File,"hamiltonContinuous","quantum")+" PSA b="+boost::str(boost::format("%1%")%Couple)));
      for(auto const Level:boost::irange<std::size_t>(0,graphs.GetListOfGraphs()->GetSize()))
      {
        auto const&Graph(*dynamic_cast<TGraph*>(graphs.GetListOfGraphs()->At(Level)));
        auto const Text{[&](double const Text){return latex.DrawLatex(*std::next(Graph.GetX(),std::distance(Graph.GetY(),std::upper_bound(Graph.GetY(),Graph.GetY()+Graph.GetN(),Text))),Text,std::to_string(Level).data());}};
	if(Level<=6) Text(0.5);
	else if(Level<=9) Text(0.85);
	else if(Level<=12||Level==16) Text(0.75);
        else Text(0.7);
      }
    }
    else
    {
      graphs.SetTitle("LEPS PSA");
      for(auto const Level:boost::irange<std::size_t>(0,graphs.GetListOfGraphs()->GetSize()))
      {
        auto const&Graph(*dynamic_cast<TGraph*>(graphs.GetListOfGraphs()->At(Level)));
        if(Level<=12)
        {
          auto const Max(std::max_element(Graph.GetY(),std::next(Graph.GetY(),Graph.GetN())));
          latex.DrawLatex(energies.at(Max-Graph.GetY()),*Max,std::to_string(Level).data())->SetTextAlign(21);
        }
        else latex.DrawLatex(energies.back(),*std::next(Graph.GetY(),Graph.GetN()-1),std::to_string(Level).data());
      }
    }
    graphs.GetXaxis()->SetLimits(this->energies.front(),this->energies.back());
    graphs.GetXaxis()->SetTitle("microcanonical energy(a.u.)");
    graphs.GetXaxis()->CenterTitle();
    graphs.GetYaxis()->SetTitle("partially state resolved reaction probability");
    graphs.GetYaxis()->CenterTitle();
    gPad->Print(std::data(static_cast<std::string>(this->Path)+".pdf"));
  }
  TGraph graph(this->energies.size(),this->energies.data(),reinterpret_cast<double const*>(probabilities.data()));
  graph.SetLineColor(Color);
  this->graphs.Add(new auto{graph});
  if(File!="analytic") legend.AddEntry(this->graphs.GetListOfGraphs()->Last(),std::data(boost::algorithm::replace_first_copy(File,"hamiltonContinuous","quantum")+" PSA"),"l");
  else legend.AddEntry(this->graphs.GetListOfGraphs()->Last(),"analytic","l");
}

void Plot_::operator()()
{
  TCanvas canvas;
  canvas.Print(std::data(static_cast<std::string>(this->Path)+".pdf["));
  sampling::Classical_ const Sampling{this->Oscillator};
  for(std::decimal::decimal32 actionVariable{1./Sampling.Division};actionVariable<=Sampling.MaxActionVariable();actionVariable+=std::decimal::decimal32{1./Sampling.Division}) this->energies.emplace_back(Sampling.MicrocanonicalEnergy(actionVariable));
  this->energies.shrink_to_fit();
  TLegend legend{0.12,0.7,0.5,0.9};
  legend.SetBorderSize(0);
  legend.SetFillStyle(0);
  legend.SetNColumns(2);
  this->plot("classical",legend,kBlack);
  auto const State(Oscillator.DissociateActionVariable()?Oscillator.DissociateActionVariable().value():Oscillator.MaxActionVariable());
  this->plot("classical",legend,kBlack,State);
  if(typeid(this->Oscillator)!=typeid(Leps_))
  {
    this->plot("hamiltonContinuous",legend,kBlue);
    this->plot("hamiltonContinuous",legend,kBlue,State);
    //this->plot(graph,"hamiltonSplit",legend,kGreen);
    //this->plot(graph,"hamiltonSplit",legend,kGreen,State);
    if(!Couple) this->plot("analytic",legend,kViolet,State);
    this->graphs.SetTitle(std::data("b="+boost::str(boost::format("%1%")%Couple)));
    /*std::ifstream file{this->Path/"discreteVariableRepresentation"};
    std::vector<double>discreteVariableRepresentation{std::istream_iterator<double>{file},std::istream_iterator<double>{}};
    std::vector<double>energies(discreteVariableRepresentation.size());
    boost::generate(energies,[energy=0.001]()mutable{return energy+=0.0005;});/////0.001 0.0005//-0.08 0.01
    TGraph graph{energies.size(),energies.data(),discreteVariableRepresentation.data()};
    graph.SetMarkerStyle(2);
    graph.SetMarkerColor(kBlue);
    this->graphs.Add(new auto{graph},"p");
    legend.AddEntry(this->graphs.GetListOfGraphs()->Last(),"discrete variable representation","p");*/
    if(this->Oscillator.DissociateActionVariable())this->graphs.SetMaximum(this->Oscillator.DissociateActionVariable().value());
  }
  else
  {
    std::vector<double>energies,probabilities;
    for(auto const Division:boost::irange<std::size_t>(0,5))
    {
      std::ifstream file{"../discreteVariableRepresentation/"+std::to_string(Division)+"/middle"};
      double energy,probability;
      for(;file>>energy>>probability;)
      {
        energies.emplace_back(energy);
        probabilities.emplace_back(probability);
      }
    }
    energies.shrink_to_fit();
    probabilities.shrink_to_fit();
    for(auto&energy:energies) energy=energy/27.2-0.174454;
    TGraph graph(energies.size(),energies.data(),probabilities.data());
    graph.SetLineColor(kBlue);
    this->graphs.Add(new auto(graph));
    legend.AddEntry(this->graphs.GetListOfGraphs()->Last(),"discrete variable representation","l");
    this->graphs.SetTitle("LEPS");
    this->graphs.SetMaximum(3);
  } 
  this->graphs.Draw("ac");
  this->graphs.GetXaxis()->SetLimits(this->energies.front(),this->energies.back());
  this->graphs.GetXaxis()->SetTitle("microcanonical energy(a.u.)");
  this->graphs.GetXaxis()->CenterTitle();
  this->graphs.GetYaxis()->SetTitle("cumulative reaction probability");
  this->graphs.GetYaxis()->CenterTitle();
  legend.DrawClone();
  canvas.Print(std::data(static_cast<std::string>(this->Path)+".pdf)"));
}

//black blue green red orange cyan violet gray
