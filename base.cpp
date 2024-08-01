#include"potential/eckartPure.h"
#include<root/TCanvas.h>
#include<root/TF1.h>
#include<root/TAxis.h>
#include<boost/format.hpp>
#include<root/TH1.h>
#include<root/TLegend.h>

namespace{
void base(std::string const&Base,double const Factor)
{
  auto base{Base=="transmitted"?&EckartPure_::TransmittedWave:&EckartPure_::ReflectedWave};
  if(Base=="incident") base=&EckartPure_::IncidentWave; 
  TF1 graph{"",[&](auto const*variable,auto const){return std::norm(std::invoke(base,Eckart,Eckart.Mass,Factor*Eckart.BarrierHeight,variable[0]));},-Eckart.XInitial(),Eckart.XInitial(),0};
  graph.SetNpx(500);
  graph.SetLineColor(kBlack);
  graph.SetTitle(std::data(Base+" wave ("+boost::str(boost::format("%1%")%Factor)+" barrier height)"));
  graph.SetMarkerStyle(5);
  using namespace std::literals;
  TLegend legend{0.1+(Base=="transmitted"?0.6:0),0.7,0.3+(Base=="transmitted"?0.6:0),0.9};
  legend.SetBorderSize(0);
  legend.SetFillStyle(0);
  legend.AddEntry(graph.DrawClone(std::data("c"s+(Base=="transmitted"?"y+":""))),"numerical","l");
  graph.GetXaxis()->SetTitle("position(a.u.)");
  graph.GetYaxis()->SetTitle("density");
  graph.GetXaxis()->CenterTitle();
  graph.GetYaxis()->CenterTitle();
  graph.SetNpx(50);
  legend.AddEntry(graph.GetHistogram()->DrawClone("p same"),"analytic","p");
  legend.DrawClone();
  gPad->Print("../base.pdf");
}
}//namespace

void base()
{
  TCanvas canvas;
  canvas.Print("../base.pdf[");
  base("transmitted",1);
  base("reflected",1);
  base("incident",1);
  for(auto const Factor:std::vector<double>{0.001,0.1,0.5,1.5,2,10})
  {
    base("transmitted",Factor);
    base("reflected",Factor);
  }
  canvas.Print("../base.pdf]");
}

/*void base();

int main()
{
  base();
}*/
