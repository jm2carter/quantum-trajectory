constexpr double upperRight(double const X,double const Y,double const XRight)
{return (1.0L/2.0L)*X - XRight + (1.0L/2.0L)*sqrt(3)*Y;}

constexpr double upperLeft(double const X,double const Y,double const YBottom)
{return -1.0L/2.0L*sqrt(3)*X + (1.0L/2.0L)*Y + YBottom;}
