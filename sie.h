_Pragma("once");

#include<boost/numeric/ublas/matrix.hpp>

template<typename State>class StepperSie
{
  private:
    using state_type=State;
    double xold;
    double atol,rtol;
    bool dense;
    double hdid;
    double EPS;
    int n;
	constexpr static int KMAXX=12,IMAXX=KMAXX+1;
	int k_targ;
	std::vector<int> nseq;
	state_type cost;
	boost::numeric::ublas::matrix<double> table;
	boost::numeric::ublas::matrix<double> dfdy;
	state_type dfdx;
	double jac_redo;
	bool calcjac;
	double theta;
	boost::numeric::ublas::matrix<double> a;
	int kright;
	boost::numeric::ublas::matrix<double> coeff;
	boost::numeric::ublas::matrix<double> fsave;
        state_type dens;
	state_type factrl;
        bool first_step=true;
	bool forward,reject=false,prev_reject=false;
	double errold;
  public:
	StepperSie(const double atol,const double rtol, bool dens=false);
	template<typename D>void try_step(D derivs,state_type&y,double&x,double&hnext);
	template<typename D>bool dy(double const x,state_type const&y, const double htot, const int k, state_type&yend,int&ipt,state_type const&scale,D derivs);
	void polyextr(const int k, boost::numeric::ublas::matrix<double> &table,state_type&last);
	void prepare_dense(state_type const y,const double h,state_type const&ysav,state_type const&scale,const int k);
	double dense_out(const int i,const double x,const double h);
};

template<typename State>
StepperSie<State>::StepperSie(const double atoll,const double rtoll, bool dens)
	: atol(atoll),rtol(rtoll),dense(dens),nseq(IMAXX),cost(IMAXX),calcjac(false),coeff(IMAXX,IMAXX),factrl(IMAXX) 
{
	constexpr double costfunc=1.0,costjac=5.0,costlu=1.0,costsolve=1.0;
	EPS=std::numeric_limits<double>::epsilon();
	jac_redo=std::fmin(1.0e-4,rtol);
	theta=2.0*jac_redo;
	nseq[0]=2;
	nseq[1]=3;
	for (int i=2;i<IMAXX;i++)nseq[i]=2*nseq[i-2];
	cost[0]=costjac+costlu+nseq[0]*(costfunc+costsolve);
	for (int k=0;k<KMAXX;k++)cost[k+1]=cost[k]+(nseq[k+1]-1)*(costfunc+costsolve)+costlu;
	double logfact=-std::log10(rtol+atol)*0.6+0.5;
	k_targ=std::max(1,std::min(KMAXX-1,int(logfact)));
	for (int k=0; k<IMAXX; k++) {
		for (int l=0; l<k; l++) {
			double ratio=double(nseq[k])/nseq[l];
			coeff(k,l)=1.0/(ratio-1.0);
		}
	}
	factrl[0]=1.0;
	for (int k=0; k<IMAXX-1; k++)
		factrl[k+1]=(k+1)*factrl[k];
}


template<typename State> template <class D>
void StepperSie<State>::try_step(D derivs,state_type&y,double&x,double&hnext)
{
  if(first_step)
  {
    n=y.size();
    table.resize(KMAXX,n);
    dfdy.resize(n,n);
    dfdx.resize(n);
    a.resize(n,n);
    fsave.resize((IMAXX-1)*(IMAXX+1)/2+2,n);
    dens.resize((IMAXX+2)*n);
  }
	constexpr double STEPFAC1=0.6,STEPFAC2=0.93,STEPFAC3=0.1,STEPFAC4=4.0,STEPFAC5=0.5,KFAC1=0.7,KFAC2=0.9;
	int i,k;
	double fac,h,hnew,err;
	bool firstk;
	state_type hopt(IMAXX),work(IMAXX);
	state_type ysav(n),yseq(n);
	state_type ymid(n),scale(n);
	work[0]=1.e30;
	h=hnext;
	forward = h>0 ? true : false;
	ysav=y;
	if (reject) {
		prev_reject=true;
		theta=2.0*jac_redo;
	}
	for (i=0;i<n;i++)
		scale[i]=atol+rtol*std::abs(y[i]);
	reject=false;
	firstk=true;
	hnew=std::abs(h);
	compute_jac:
	if (theta > jac_redo && !calcjac) {
		derivs.second(y,dfdy,x,dfdx);
		calcjac=true;
	}
	while (firstk || reject) {
		h = forward ? hnew : -hnew;
		firstk=false;
		reject=false;
		if (std::abs(h) <= std::abs(x)*EPS)
			throw("step size underflow in StepperSie");
		int ipt=-1;
		for (k=0; k<=k_targ+1;k++)
		{
			bool success=dy(x,ysav,h,k,yseq,ipt,scale,derivs);
			if (!success) {
				reject=true;
				hnew=std::abs(h)*STEPFAC5;
				break;
			}
			if (k == 0)
				 y=yseq;
			else
				for (i=0;i<n;i++)
					table(k-1,i)=yseq[i];
			if (k != 0) {
				polyextr(k,table,y);
				err=0.0;
				for (i=0;i<n;i++) {
					scale[i]=atol+rtol*std::abs(ysav[i]);
					err+=std::pow((y[i]-table(0,i))/scale[i],2);
				}
				err=std::sqrt(err/n);
				if (err > 1.0/EPS || (k > 1 && err >= errold)) {
					reject=true;
					hnew=std::abs(h)*STEPFAC5;
					break;
				}
				errold=std::max(4.0*err,1.0);
				double expo=1.0/(k+1);
				double facmin=std::pow(STEPFAC3,expo);
				if (err == 0.0)
					fac=1.0/facmin;
				else {
					fac=STEPFAC2/pow(err/STEPFAC1,expo);
					fac=std::fmax(facmin/STEPFAC4,std::fmin(1.0/facmin,fac));
				}
				hopt[k]=std::abs(h*fac);
				work[k]=cost[k]/hopt[k];
				if (first_step && err <= 1.0)
					break;
				if (k == k_targ-1 && !prev_reject && !first_step) {
					if (err <= 1.0)
						break;
					else if (err>nseq[k_targ]*nseq[k_targ+1]*4.0) {
						reject=true;
						k_targ=k;
						if (k_targ>1 && work[k-1]<KFAC1*work[k])
							k_targ--;
						hnew=hopt[k_targ];
						break;
					}
				}
				if (k == k_targ) {
					if (err <= 1.0)
						break;
					else if (err>nseq[k+1]*2.0) {
						reject=true;
						if (k_targ>1 && work[k-1]<KFAC1*work[k])
							k_targ--;
						hnew=hopt[k_targ];
						break;
					}
				}
				if (k == k_targ+1) {
					if (err > 1.0) {
						reject=true;
						if (k_targ>1 && work[k_targ-1]<KFAC1*work[k_targ])
							k_targ--;
						hnew=hopt[k_targ];
					}
					break;
				}
			}
		}
		if (reject)
		{
			prev_reject=true;
			if (!calcjac)
			{
				theta=2.0*jac_redo;
				goto compute_jac;
			}
		}
	}
	calcjac=false;
	if (dense)
		prepare_dense(y,h,ysav,scale,k);
	xold=x;
	x+=h;
	hdid=h;
	first_step=false;
	int kopt;
	if (k == 1)
		kopt=2;
	else if (k <= k_targ) {
		kopt=k;
		if (work[k-1] < KFAC1*work[k])
			kopt=k-1;
		else if (work[k] < KFAC2*work[k-1])
			kopt=std::min(k+1,KMAXX-1);
	} else {
		kopt=k-1;
		if (k > 2 && work[k-2] < KFAC1*work[k-1])
			kopt=k-2;
		if (work[k] < KFAC2*work[kopt])
			kopt=std::min(k,KMAXX-1);
	}
	if (prev_reject) {
		k_targ=std::min(kopt,k);
		hnew=std::fmin(std::abs(h),hopt[k_targ]);
		prev_reject=false;
	}
	else {
		if (kopt <= k)
			hnew=hopt[kopt];
		else {
			if (k<k_targ && work[k]<KFAC2*work[k-1])
				hnew=hopt[k]*cost[kopt+1]/cost[k];
			else
				hnew=hopt[k]*cost[kopt]/cost[k];
		}
		k_targ=kopt;
	}
	if (forward)
		hnext=hnew;
	else
		hnext=-hnew;
}

#include<mkl_lapacke.h>

class Solve final
{
  private:
    boost::numeric::ublas::matrix<double>lu;
    std::vector<int>pivot;
  public:
    Solve(boost::numeric::ublas::matrix<double>const&Matrix):lu(Matrix),pivot(Matrix.size1())
    {
      assert(!::LAPACKE_dgetrf(LAPACK_ROW_MAJOR,lu.size1(),lu.size2(),lu.data().begin(),lu.size1(),pivot.data()));
    };
    Solve(Solve&&)=delete;
    template<typename state_type>void operator()(boost::numeric::ublas::matrix<double>const&Matrix,state_type&right)const&
    {
      auto const Right(right);
      assert(!::LAPACKE_dgetrs(LAPACK_ROW_MAJOR,'N',lu.size1(),1,lu.data().cbegin(),lu.size1(),pivot.data(),right.data(),1));
      double ferr,berr;
      assert(!::LAPACKE_dgerfs(LAPACK_ROW_MAJOR,'N',lu.size1(),1,Matrix.data().cbegin(),lu.size1(),lu.data().cbegin(),lu.size1(),pivot.data(),Right.data(),1,right.data(),1,std::addressof(ferr),std::addressof(berr)));
    };
};

template<typename State> template <class D>
bool StepperSie<State>::dy(double const x,state_type const&y,const double htot,const int k,state_type&yend,int &ipt,state_type const&scale,D derivs)
{
  state_type del(n),ytemp(n),dytemp(n);
	int nstep=nseq[k];
	double h=htot/nstep;
	for (int i=0;i<n;i++) {
		for (int j=0;j<n;j++) a(i,j) = -dfdy(i,j);
		a(i,i) += 1.0/h;
	}
	::Solve solve{a};
	double xnew=x+h;
	derivs.first(y,del,xnew);
	ytemp=y;
	solve(a,del);
	if (dense && nstep==k+1) {
		ipt++;
		for (int i=0;i<n;i++)
			fsave(ipt,i)=del[i];
	}
	for (int nn=1;nn<nstep;nn++) {
		for (int i=0;i<n;i++)
			ytemp[i] += del[i];
		xnew += h;
		derivs.first(ytemp,yend,xnew);
		if (nn ==1 && k<=1) {
			double del1=0.0;
			for (int i=0;i<n;i++)
				del1 += std::pow(del[i]/scale[i],2);
			del1=std::sqrt(del1);
			derivs.first(ytemp,dytemp,x+h);
			for (int i=0;i<n;i++)
				del[i]=dytemp[i]-del[i]/h;
			solve(a,del);
			double del2=0.0;
			for (int i=0;i<n;i++)
				del2 += std::pow(del[i]/scale[i],2);
			del2=std::sqrt(del2);
			theta=del2/std::fmax(1.0,del1);
			if (theta > 1.0)
				return false;
		}
		del=yend;
		solve(a,del);
		if (dense && nn >= nstep-k-1) {
			ipt++;
			for (int i=0;i<n;i++)
				fsave(ipt,i)=del[i];
		}
	}
	for (int i=0;i<n;i++)
		yend[i]=ytemp[i]+del[i];
	return true;
}

template<typename State>
void StepperSie<State>::polyextr(const int k,boost::numeric::ublas::matrix<double>&table,state_type&last) {
	int l=last.size();
	for (int j=k-1; j>0; j--)
		for (int i=0; i<l; i++)
			table(j-1,i)=table(j,i)+coeff(k,j)*(table(j,i)-table(j-1,i));
	for (int i=0; i<l; i++)
		last[i]=table(0,i)+coeff(k,0)*(table(0,i)-last[i]);
}

template<typename State>
void StepperSie<State>::prepare_dense(state_type const y,const double h,state_type const&ysav,state_type const&scale,const int k) {
	kright=k;
	for (int i=0; i<n; i++) {
		dens[i]=ysav[i];
		dens[n+i]=y[i];
	}
	for (int klr=0; klr < kright; klr++) {
		if (klr >= 1) {
			for (int kk=klr; kk<=k; kk++) {
				int lbeg=((kk+3)*kk)/2;
				int lend=lbeg-kk+1;
				for (int l=lbeg; l>=lend; l--)
					for (int i=0; i<n; i++)
						fsave(l,i)=fsave(l,i)-fsave(l-1,i);
			}
		}
		for (int kk=klr; kk<=k; kk++) {
			double facnj=nseq[kk];
			facnj=std::pow(facnj,klr+1)/factrl[klr+1];
			int ipt=((kk+3)*kk)/2;
				int krn=(kk+2)*n;
			for (int i=0; i<n; i++) {
				dens[krn+i]=fsave(ipt,i)*facnj;
			}
		}
		for (int j=klr+1; j<=k; j++) {
			double dblenj=nseq[j];
			for (int l=j; l>=klr+1; l--) {
				double factor=dblenj/nseq[l-1]-1.0;
				for (int i=0; i<n; i++) {
					int krn=(l+2)*n+i;
					dens[krn-n]=dens[krn]+(dens[krn]-dens[krn-n])/factor;
				}
			}
		}
	}
	for (int in=0; in<n; in++) {
		for (int j=1; j<=kright+1; j++) {
			int ii=n*j+in;
			dens[ii]=dens[ii]-dens[ii-n];
		}
	}
}

template<typename State>
double StepperSie<State>::dense_out(const int i,const double x,const double h)
{
	double theta=(x-xold)/h;
	int k=kright;
	double yinterp=dens[(k+1)*n+i];
	for (int j=1; j<=k; j++) yinterp=dens[(k+1-j)*n+i]+yinterp*(theta-1.0);
	return dens[i]+yinterp*theta;
}
