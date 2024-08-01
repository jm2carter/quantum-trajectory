#include"eckartAffineMorse.h"

std::size_t EckartAffineMorse_::MaxActionVariable()const&
{
  if(Couple==0) return 18;
  else if(Couple==-0.5) return 21;
}
