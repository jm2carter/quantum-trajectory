#include<mpi.h>
#include<fstream>
#include"potential/harmonic.h"
#include"potential/eckartMorse.h"
#include"potential/eckartAffineMorse.h"
#include"potential/leps.h"
#include"trajectory/lagrange.h"
#include"trajectory/hamilton.h"
#include"trajectory/classical.h"
#include"sampling/classical.h"
#include"sampling/phaseSpaceApproximation.h"

void produce()
{
  MPI_Init_thread(nullptr,nullptr,MPI_THREAD_FUNNELED,nullptr); 
  int rank,commSize;
  MPI_Comm_rank(MPI_COMM_WORLD,std::addressof(rank)); 
  MPI_Comm_size(MPI_COMM_WORLD,std::addressof(commSize));
  Leps_ const Potential;
  //sampling::Classical_ const Sampling{Potential};
  sampling::PhaseSpaceApproximation_ const Sampling{Potential,0};
  //std::ofstream file{"0"};
  for(std::decimal::decimal32 actionVariable{1./Sampling.Division};actionVariable<=Sampling.MaxActionVariable();actionVariable+=std::decimal::decimal32{1./Sampling.Division})
  {
    auto sum(Sampling.Sum(actionVariable,[&](auto&&...pack){return Sampling.Contour<trajectory::Classical_>(std::forward<decltype(pack)>(pack)...);},rank,commSize));
    if(!rank) MPI_Reduce(MPI_IN_PLACE,sum.data(),sum.size(),MPI_DOUBLE,MPI_SUM,0,MPI_COMM_WORLD);
    else MPI_Reduce(sum.data(),nullptr,sum.size(),MPI_DOUBLE,MPI_SUM,0,MPI_COMM_WORLD);
    //double const CumulativeReactionProbability{boost::accumulate(sum,0.)/std::pow(Sampling.Division,2)};
    //double const CumulativeReactionProbability{Sampling.UnCouple(actionVariable,Potential)};
    //if(!rank) file.write(reinterpret_cast<char const*>(&CumulativeReactionProbability),sizeof CumulativeReactionProbability).flush();
    if(!rank)for(auto const ActionVariable:boost::irange<std::size_t>(0,sum.size()))
    {
      std::ofstream file{std::to_string(ActionVariable),std::ios::app};
      double const CumulativeReactionProbability{sum.at(ActionVariable)/std::pow(Sampling.Division,2)};
      file.write(reinterpret_cast<char const*>(&CumulativeReactionProbability),sizeof CumulativeReactionProbability).flush();
    }
  }
  MPI_Finalize();
}
