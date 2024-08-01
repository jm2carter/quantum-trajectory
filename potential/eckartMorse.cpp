#include"eckartMorse.h"

std::size_t EckartMorse_::MaxActionVariable()const&
{
  if(Couple==-0.25||Couple==0) return 10;
  else if(Couple==1) return 15;
}
