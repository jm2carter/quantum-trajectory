import sympy.ga,numpy
base=sympy.ga.Ga('\u0411*0|1',g=[1]*2)
x,y=sympy.symbols('X,Y',real=True)
reflection=numpy.dot([x,y],base.mv()).reflect_in_blade(numpy.dot([1,sympy.tan(sympy.pi/6)],base.mv()))

if __name__=='__main__':
    print('''#include"leps.h"

std::array<double,2>Leps_::reflection(double const X,double const Y)noexcept
{return {'''+','.join(map(sympy.ccode,reflection.blade_coefs(base.mv())))+'''};}''',file=open('reflection.cpp','w'))
    
    import matplotlib.pyplot
    axes=matplotlib.pyplot.figure().add_subplot(1,1,1,aspect='equal')
    axes.set_axis_off()
    axes.set_title('reflection')
    origin=numpy.array([0.3,0.3])
    mirror=numpy.array([0.2,0.15])
    axes.text(*axes.plot(*zip(origin-mirror,origin+3*mirror),color='black')[0].get_xydata()[-1],s='mirror')
    original=numpy.array([0.1,0.5])
    axes.arrow(*origin,*original,color='black')
    #print(axes.artists[0].get_xy())
    axes.axis([0,1,0,1])

    import matplotlib.backends.backend_pdf 
    output=matplotlib.backends.backend_pdf.PdfPages('../../reflection.pdf')
    output.savefig()
    reflection=numpy.array(numpy.dot(original,base.mv()).reflect_in_blade(numpy.dot(mirror,base.mv())).blade_coefs(base.mv()),dtype=float)
    axes.arrow(*origin,*reflection,color='black')
    axes.plot(*zip(origin+reflection,origin+original),color='black',linestyle='--')
    horizontal=numpy.array(numpy.dot(original,base.mv()).project_in_blade(numpy.dot(mirror,base.mv())).blade_coefs(base.mv()),dtype=float)
    vertical=(original-horizontal)*0.05
    axes.plot(*zip(origin+horizontal,origin+horizontal+vertical),color='black')
    axes.plot(*numpy.dstack(map(lambda row:axes.lines[-1].get_xydata()[row]+numpy.linalg.norm(vertical)*mirror/numpy.linalg.norm(mirror),range(axes.lines[-1].get_xydata().shape[0])))[0],color='black')
    axes.plot(*numpy.dstack(map(lambda line:axes.lines[line].get_xydata()[-1],range(-2,0)))[0],color='black')
    output.savefig()
    output.close()
