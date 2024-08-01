import re
match=re.search(r'(?<=\\left)\((.*\\right)\)',sympy.latex(lagrange.replace(positionDerivatives[1]))) 
