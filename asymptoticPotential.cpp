#include"potential/harmonic.h"
#include"potential/eckartMorse.h"
#include"potential/leps.h"
#include<root/TCanvas.h>
#include<root/TF1.h>
#include<root/TAxis.h>
#include<root/TGraph.h>
#include<root/TLine.h>
#include<root/TLegend.h>
#include<root/TLatex.h>
#include<boost/range/irange.hpp>

void asymptoticPotential()
{
  TCanvas canvas;
  TLegend legend{0.7,0.7,0.9,0.8};
  legend.SetBorderSize(0);
  legend.SetFillStyle(0);
  constexpr EckartMorse_ EckartMorse;
  constexpr Harmonic_ Harmonic;
  TF1 morse{"",[](auto const*Variable,auto const){return EckartMorse.Product(Variable[0]);},-2,10,0};
  morse.SetNpx(500);
  morse.SetTitle("comparison of Morse and harmonic asymptotic potential");
  morse.SetMaximum(EckartMorse.WellDepth*1.1);
  morse.SetLineColor(kBlack);
  legend.AddEntry(std::addressof(morse),"Morse","l");
  auto const MorseClone(morse.DrawCopy("l"));
  MorseClone->GetXaxis()->SetTitle("position(a.u.)");
  MorseClone->GetXaxis()->CenterTitle();
  MorseClone->GetYaxis()->SetTitle("oscillator energy(a.u.)");
  MorseClone->GetYaxis()->CenterTitle();
  MorseClone->GetYaxis()->SetTitleOffset(1.4);
  MorseClone->GetYaxis()->SetTickLength(0);
  MorseClone->GetYaxis()->SetLabelSize(0);
  TGraph harmonic{std::addressof(morse)};
  std::transform(harmonic.GetX(),std::next(harmonic.GetX(),harmonic.GetN()),harmonic.GetY(),[](auto const Position){return Harmonic.Product(Position);});
  harmonic.SetLineStyle(2);
  legend.AddEntry(harmonic.DrawClone("l"),"harmonic","l");
  legend.DrawClone();
  for(auto const ActionVariable:boost::irange<std::size_t>(0,EckartMorse.DissociateActionVariable().value()))
  {
    TLine line;
    line.SetLineStyle(morse.GetLineStyle());
    double eigenEnergy{EckartMorse.OscillationEnergy(ActionVariable+std::decimal::decimal32{0.5})};
    line.DrawLine(EckartMorse.OscillationMin(eigenEnergy),eigenEnergy,EckartMorse.OscillationMax(eigenEnergy),eigenEnergy);
    eigenEnergy=Harmonic.OscillationEnergy(ActionVariable+std::decimal::decimal32{0.5});
    if(eigenEnergy<morse.GetMaximumStored())
    {
      line.SetLineStyle(harmonic.GetLineStyle());
      line.DrawLine(Harmonic.OscillationMin(eigenEnergy),eigenEnergy,Harmonic.OscillationMax(eigenEnergy),eigenEnergy);
      TLatex latex{morse.GetXmin(),eigenEnergy,std::data(std::to_string(ActionVariable)+".5#omega#hbar")};
      latex.SetTextFont(42);
      latex.SetTextAlign(32);
      latex.SetTextSize(0.04);
      latex.DrawClone();
    }
  }
  canvas.Print("../asymptoticPotential.pdf(");
  canvas.Clear();
  constexpr Leps_ Leps;
  TF1 leps{"",[](auto const*Variable,auto const){return Leps.Product(Variable[0]);},0,7,0};
  leps.SetNpx(500);
  leps.SetMaximum(0.01);
  leps.SetLineColor(kBlack);
  leps.SetTitle("LEPS asymptotic potential");
  auto const LepsClone(leps.DrawCopy("l"));
  LepsClone->GetXaxis()->SetTitle("position(a.u.)");
  LepsClone->GetXaxis()->CenterTitle();
  LepsClone->GetYaxis()->SetTitle("oscillator energy(a.u.)");
  LepsClone->GetYaxis()->CenterTitle();
  LepsClone->GetYaxis()->SetTitleOffset(1.4);
  for(auto const ActionVariable:boost::irange<std::size_t>(0,Leps.DissociateActionVariable().value()))
  {
    double const EigenEnergy{Leps.OscillationEnergy(ActionVariable+std::decimal::decimal32{0.5})};
    TLine line{Leps.OscillationMin(EigenEnergy),EigenEnergy,Leps.OscillationMax(EigenEnergy),EigenEnergy};
    line.DrawClone();
  }
  canvas.Print("../asymptoticPotential.pdf)");
}

/*void asymptoticPotential();

int main()
{
  asymptoticPotential();
}*/
