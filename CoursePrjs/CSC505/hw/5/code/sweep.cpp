
#include <stdio.h>
#include <iostream>
#include <memory.h>
#include <vector>
#include <set>
#include <math.h>
#include <algorithm>
#ifndef NULL
#define NULL 0
#endif //

const int N_START = 0;
const int N_END = 1;
const double D_ZERO = 0.00001;
const int N_CFG_DEBUG_OUTPUT = 0;


typedef struct tg_Intersection
{
  double dx;
  double dy;
  long l1;
  long l2;
}Intersection;

typedef struct tg_Direction
{
   double dx;
   double dy;
}Direction;

typedef struct tg_LPoint
{
   double dx;
   double dy;
   int    nLine;
   int    nType;
}LPoint;

typedef struct tg_Line
{
   int sPnt;
   int ePnt;
   Direction d;
   double dswpy;
}Line;

LPoint* g_lpoints = NULL;
int * g_lpoints_sort = NULL;
int g_lpointsnum = 0;
int g_current_pnt_maxpos = -1;

Line* g_lines = NULL;
int g_current_line_maxpos = -1;

std::vector<Intersection> g_intersections;

/*
vector
*/
class CLineContainer
{
   public:
      CLineContainer() {m_dx = 0.0;};
      ~CLineContainer() {};

   public:
      void Insert(const int& val)
      {
         m_vals.insert(val);
         m_dx = g_lpoints[g_lines[val].sPnt].dx;

         if(N_CFG_DEBUG_OUTPUT > 3)
         {
            printf("insert line %d to CL,size  %d ;line Q :",val,(int)m_vals.size());
            std::set<int>::iterator ibg = m_vals.begin();
            int i = -1;
            while(m_vals.end() != ibg)
            {
               i = *ibg;
               printf("line %d point %d(%.2f,%.2f) at %.2f ",i,g_lines[i].sPnt,g_lpoints[g_lines[i].sPnt].dx, g_lpoints[g_lines[i].sPnt].dy,g_lines[i].dswpy);
               ibg++;
            }
            printf("\n");
         }
      };

      void Delete(const int& val)
      {
         std::set<int>::iterator iFind = m_vals.find(val);
         if(m_vals.end() == iFind)
         {
           return ;
         }
         m_vals.erase(iFind);
         if(N_CFG_DEBUG_OUTPUT > 1)
         {
            printf("remove line %d from CL,size %d\n",val,(int)m_vals.size());
         }
      };

      int Below(const int&val)
      {
         std::set<int>::iterator iFind = m_vals.find(val);
         if(m_vals.end() == iFind)
         {
            return -1;
         }
         else if(m_vals.begin() == iFind)
         {
            return -1;
         }
         else
         {
            iFind--;
            if(N_CFG_DEBUG_OUTPUT > 1)
            {
              printf("line %d got a Below line %d \n",val,*iFind);
            }
            return *iFind;
         }
      };

      int Above(const int&val)
      {
         std::set<int>::iterator iFind = m_vals.find(val);
         if(m_vals.end() == iFind)
         {
           return -1;
         }
         iFind++;
         if(m_vals.end() == iFind)
         {
            return -1;
         }
         else
         {
            if(N_CFG_DEBUG_OUTPUT > 1)
            {
              printf("line %d got a Above line %d \n",val,*iFind);
            }
            return *iFind;
         }
      };

   public:
      static bool ComparePointY(const int& x, const int& y)
      {
        if((x > g_current_line_maxpos) || (y > g_current_line_maxpos))
        {
            return false;
        }
        if(g_lpoints[g_lines[x].ePnt].dy < g_lpoints[g_lines[y].ePnt].dy)
        {
            return true;
        }
        else if((g_lpoints[g_lines[x].ePnt].dy == g_lpoints[g_lines[y].ePnt].dy) && (g_lpoints[g_lines[x].ePnt].dx < g_lpoints[g_lines[y].ePnt].dx))
        {
            return true;
        }
        else
        {
           return false;
        }
      };

        struct SymCmp
        {
            bool operator () (const int& x, const int& y) const
            {
               return ComparePointY(x,y);
            }
        };

   private:
   std::set<int,SymCmp> m_vals;
   double m_dx;
};

///////////////////////////////////////////////////
double getdirection(int p1,int p2,int p3)
{
   if(p1 > g_current_pnt_maxpos || p2 > g_current_pnt_maxpos || p3 > g_current_pnt_maxpos)
   {
      if(N_CFG_DEBUG_OUTPUT > 1)
      {
         printf("out of range %d %d %d max %d\n",p1,p2,p3,g_current_pnt_maxpos);
      }
      return 0.0;
   }
   return (g_lpoints[p3].dx - g_lpoints[p1].dx)*(g_lpoints[p2].dy - g_lpoints[p1].dy) - (g_lpoints[p2].dx - g_lpoints[p1].dx)*(g_lpoints[p3].dy - g_lpoints[p1].dy);
}

bool checkonsegment(int p1,int p2,int p3)
{
   if(p1 > g_current_pnt_maxpos || p2 > g_current_pnt_maxpos || p3 > g_current_pnt_maxpos)
   {
      if(N_CFG_DEBUG_OUTPUT > 1)
      {
         printf("out of range %d %d %d max %d\n",p1,p2,p3,g_current_pnt_maxpos);
      }
      return false;
   }
    if( (std::min(g_lpoints[p1].dx, g_lpoints[p2].dx) <= g_lpoints[p3].dx)
      && (g_lpoints[p3].dx <= std::max(g_lpoints[p1].dx, g_lpoints[p2].dx))
      && (std::min(g_lpoints[p1].dy, g_lpoints[p2].dy) <= g_lpoints[p3].dy)
      && (g_lpoints[p3].dy <= std::max(g_lpoints[p1].dy, g_lpoints[p2].dy)) )
      {
         return true;
      }
      else
      {
         return false;
      }
}


bool checkintersect(int l1,int l2)
{
   if(l1 > g_current_line_maxpos || l2 > g_current_line_maxpos)
   {
      if(N_CFG_DEBUG_OUTPUT > 1)
      {
         printf("out of range %d %d max %d\n",l1,l2,g_current_line_maxpos);
      }
      return false;
   }
   double d1 = getdirection(g_lines[l2].sPnt,g_lines[l2].ePnt,g_lines[l1].sPnt);
   double d2 = getdirection(g_lines[l2].sPnt,g_lines[l2].ePnt,g_lines[l1].ePnt);
   double d3 = getdirection(g_lines[l1].sPnt,g_lines[l1].ePnt,g_lines[l2].sPnt);
   double d4 = getdirection(g_lines[l1].sPnt,g_lines[l1].ePnt,g_lines[l2].ePnt);

   if ( ((d1 > 0 && d2 < 0)|| (d1 < 0 && d2 > 0))
     && ((d3 > 0 && d4 < 0)|| (d3 < 0 && d4 > 0)) )
     {
        if(N_CFG_DEBUG_OUTPUT > 1)
        {
           printf("line %d with line %d should have a intersection \n",l1,l2);
        }
        return true;
     }
     else if ( (abs(d1) < D_ZERO) && checkonsegment(g_lines[l2].sPnt,g_lines[l2].ePnt,g_lines[l1].sPnt))
     {
        if(N_CFG_DEBUG_OUTPUT > 1)
        {
           printf("line %d with line %d should have a intersection \n",l1,l2);
        }
        return true;
     }
     else if ( (abs(d2) < D_ZERO) && checkonsegment(g_lines[l2].sPnt,g_lines[l2].ePnt,g_lines[l1].ePnt))
     {
        if(N_CFG_DEBUG_OUTPUT > 1)
        {
           printf("line %d with line %d should have a intersection \n",l1,l2);
        }
        return true;
     }
     else if ( (abs(d3) < D_ZERO) && checkonsegment(g_lines[l1].sPnt,g_lines[l1].ePnt,g_lines[l2].sPnt))
     {
        if(N_CFG_DEBUG_OUTPUT > 1)
        {
           printf("line %d with line %d should have a intersection \n",l1,l2);
        }
        return true;
     }
     else if ( (abs(d4) < D_ZERO) && checkonsegment(g_lines[l1].sPnt,g_lines[l1].ePnt,g_lines[l2].ePnt))
     {
        if(N_CFG_DEBUG_OUTPUT > 1)
        {
           printf("line %d with line %d should have a intersection \n",l1,l2);
        }
        return true;
     }
     else
     {
        if(N_CFG_DEBUG_OUTPUT > 1)
        {
           printf("d1 %f d2 %f d3 %f d4 %f \n",d1,d2,d3,d4);
           printf("line checkintersect false %d (%.2f,%.2f) (%.2f,%.2f) line %d (%.2f,%.2f) (%.2f,%.2f)  \n",l1,g_lpoints[g_lines[l1].sPnt].dx,g_lpoints[g_lines[l1].sPnt].dy,g_lpoints[g_lines[l1].ePnt].dx,g_lpoints[g_lines[l1].ePnt].dy,\
                                        l2,g_lpoints[g_lines[l2].sPnt].dx,g_lpoints[g_lines[l2].sPnt].dy,g_lpoints[g_lines[l2].ePnt].dx,g_lpoints[g_lines[l2].ePnt].dy);
        }
        return false;
     }
}


void initLines(int num)
{
    if(num <= 0)
    {
       return;
    }
    g_lpointsnum = num*2;
    g_lpoints = new LPoint[g_lpointsnum];
    g_lpoints_sort = new int[g_lpointsnum];


    g_lines = new Line[num];
    g_current_line_maxpos = -1;
}

void addALine(double dsx,double dsy,double dex,double dey)
{
  if((g_current_pnt_maxpos + 2) >= g_lpointsnum)
  {
      return ;
  }

  //line
  g_current_line_maxpos++;

  g_current_pnt_maxpos++;
  g_lpoints[g_current_pnt_maxpos].dx = dsx;
  g_lpoints[g_current_pnt_maxpos].dy = dsy;
  g_lpoints[g_current_pnt_maxpos].nLine = g_current_line_maxpos;
  g_lpoints[g_current_pnt_maxpos].nType = dsx < dex? N_START:N_END ;
  g_lpoints_sort[g_current_pnt_maxpos] = g_current_pnt_maxpos;


  g_current_pnt_maxpos++;
  g_lpoints[g_current_pnt_maxpos].dx = dex;
  g_lpoints[g_current_pnt_maxpos].dy = dey;
  g_lpoints[g_current_pnt_maxpos].nLine = g_current_line_maxpos;
  g_lpoints[g_current_pnt_maxpos].nType = dsx < dex ? N_END:N_START;
  g_lpoints_sort[g_current_pnt_maxpos] = g_current_pnt_maxpos;

  g_lines[g_current_line_maxpos].sPnt = g_lpoints[g_current_pnt_maxpos].nType == N_START ? g_current_pnt_maxpos:g_current_pnt_maxpos-1;
  g_lines[g_current_line_maxpos].ePnt = g_lpoints[g_current_pnt_maxpos].nType == N_END ? g_current_pnt_maxpos:g_current_pnt_maxpos-1;

  g_lines[g_current_line_maxpos].d.dx = g_lpoints[g_lines[g_current_line_maxpos].ePnt].dx - g_lpoints[g_lines[g_current_line_maxpos].sPnt].dx;
  g_lines[g_current_line_maxpos].d.dy = g_lpoints[g_lines[g_current_line_maxpos].ePnt].dy - g_lpoints[g_lines[g_current_line_maxpos].sPnt].dy;

  if(N_CFG_DEBUG_OUTPUT > 2)
  {
     if(g_lines[g_current_line_maxpos].d.dx == 0.0)
     {
       printf("line idx %d ,p1 (%.2f,%.2f) %d , p2 (%.2f,%.2f) %d vertical\n",g_current_line_maxpos,dsx,dsy,g_current_pnt_maxpos-1,dex,dey,g_current_pnt_maxpos);
     }
     printf("add line idx %d ,p1 (%.2f,%.2f) %d , p2 (%.2f,%.2f) %d\n",g_current_line_maxpos,dsx,dsy,g_current_pnt_maxpos-1,dex,dey,g_current_pnt_maxpos);
  }
}

double vectordot(const Direction& d1,const Direction& d2)
{
  return d1.dx* d2.dx + d1.dy* d2.dy;
}

void getintersectval(int l1,int l2)
{
   Direction d1;
   d1.dx = g_lpoints[g_lines[l1].ePnt].dx - g_lpoints[g_lines[l1].sPnt].dx;
   d1.dy = g_lpoints[g_lines[l1].ePnt].dy - g_lpoints[g_lines[l1].sPnt].dy;

   Direction d2;
   d2.dx = g_lpoints[g_lines[l2].ePnt].dx - g_lpoints[g_lines[l2].sPnt].dx;
   d2.dy = g_lpoints[g_lines[l2].ePnt].dy - g_lpoints[g_lines[l2].sPnt].dy;

   Direction d1t;
   d1t.dx = -d1.dy;
   d1t.dy = d1.dx;

   Direction dp1p3;
   dp1p3.dx = g_lpoints[g_lines[l1].sPnt].dx - g_lpoints[g_lines[l2].sPnt].dx ;
   dp1p3.dy = g_lpoints[g_lines[l1].sPnt].dy - g_lpoints[g_lines[l2].sPnt].dy ;

   double d = vectordot(d2,d1t);
   if(d != 0.0)
   {
      double t4 = vectordot(dp1p3,d1t)/d ;
      if(t4 <= 1.0 && t4 >= 0.0)
      {
        Intersection ist;
        ist.dx = g_lpoints[g_lines[l2].sPnt].dx + t4*d2.dx;
        ist.dy = g_lpoints[g_lines[l2].sPnt].dy + t4*d2.dy;
        ist.l1 = l1;
        ist.l2 = l2;

        g_intersections.push_back(ist);
      }

      if(N_CFG_DEBUG_OUTPUT > 0)
      {
         printf("line %d %d  have a intersection, at t4 = %.2f\n",l1,l2,t4);
      }
   }
   else
   {
      if(N_CFG_DEBUG_OUTPUT > 0)
      {
         printf("line %d %d  vectical\n",l1,l2);
      }
   }

}

void printsortresult()
{
   for(int i = 0; i <= g_current_pnt_maxpos; i++)
   {
      printf("x %.2f y %.2f type = %d line %d point %d\n",g_lpoints[g_lpoints_sort[i]].dx,g_lpoints[g_lpoints_sort[i]].dy,g_lpoints[g_lpoints_sort[i]].nType,g_lpoints[g_lpoints_sort[i]].nLine,g_lpoints_sort[i]);
   }
}

/*
quick sort
*/

void qsswap(int n,int m)
{
    if( m == n)
    {
        return;
    }
    int ntemp = g_lpoints_sort[n];
    g_lpoints_sort[n] = g_lpoints_sort[m];
    g_lpoints_sort[m] = ntemp;
}

int qspartition(int nstart,int nend)
{
    int npivot = g_lpoints[g_lpoints_sort[nend]].dx;
    int nidx = nstart;
    for(int i = nstart; i < nend;i++)
    {
        if(g_lpoints[g_lpoints_sort[i]].dx < npivot)
        {
           qsswap(nidx,i);
           nidx++;
        }
        else if((g_lpoints[g_lpoints_sort[i]].dx == npivot)
        && (g_lpoints[g_lpoints_sort[i]].dy <  g_lpoints[g_lpoints_sort[nend]].dy)) // if two pnts have the same x,
        {
           qsswap(nidx,i);
           nidx++;
        }
        else if((g_lpoints[g_lpoints_sort[i]].dx == npivot)
        && (g_lpoints[g_lpoints_sort[i]].dy ==  g_lpoints[g_lpoints_sort[nend]].dy)) // output
        {
            getintersectval(g_lpoints[g_lpoints_sort[i]].nLine,g_lpoints[g_lpoints_sort[nend]].nLine);
        }
    }

    qsswap(nidx,nend);
    return nidx;

}

void quicksort(int nstart,int nend)
{
    if((nstart < 0)
    || (nend <= 0)
    || (nend < nstart))
    {
        return;
    }
    int npttion = qspartition(nstart,nend);
    quicksort(nstart,npttion - 1);
    quicksort(npttion + 1,nend);
}
///////////////////////////////////////////////////

bool findlines()
{
   quicksort(0,g_current_pnt_maxpos);
   if(N_CFG_DEBUG_OUTPUT > 2)
   {
      printsortresult();
   }
   CLineContainer lc;
   for(int i = 0; i <= g_current_pnt_maxpos; i++)
   {
      if(N_CFG_DEBUG_OUTPUT > 2)
      {
         printf("processing sorted pnt %d with line %d\n",i,g_lpoints[g_lpoints_sort[i]].nLine);
      }
      if(N_START == g_lpoints[g_lpoints_sort[i]].nType )
      {
          lc.Insert(g_lpoints[g_lpoints_sort[i]].nLine);

          int nab = lc.Above(g_lpoints[g_lpoints_sort[i]].nLine);
          int nbl = lc.Below(g_lpoints[g_lpoints_sort[i]].nLine);
          if(N_CFG_DEBUG_OUTPUT > 0)
          {
             printf("insert get line %d above %d below %d \n",g_lpoints[g_lpoints_sort[i]].nLine,nab,nbl);
          }
          if((nab >= 0) && (checkintersect(g_lpoints[g_lpoints_sort[i]].nLine,nab)))
          {
             getintersectval(g_lpoints[g_lpoints_sort[i]].nLine,nab);
             //continue;
          }
          if((nbl >= 0) && (checkintersect(g_lpoints[g_lpoints_sort[i]].nLine,nbl)))
          {
             getintersectval(g_lpoints[g_lpoints_sort[i]].nLine,nbl);
             //continue;
          }
      }
      else if(N_END == g_lpoints[g_lpoints_sort[i]].nType )
      {
          int nab = lc.Above(g_lpoints[g_lpoints_sort[i]].nLine);
          int nbl = lc.Below(g_lpoints[g_lpoints_sort[i]].nLine);
          if(N_CFG_DEBUG_OUTPUT > 0)
          {
             printf("remove get line %d above %d below %d \n",g_lpoints[g_lpoints_sort[i]].nLine,nab,nbl);
          }
          lc.Delete(g_lpoints[g_lpoints_sort[i]].nLine);
          if((nab >= 0) && (nbl >= 0 )&& (checkintersect(nbl,nab)))
          {
             getintersectval(nbl,nab);
          }
      }
      else
      {
          if(N_CFG_DEBUG_OUTPUT > 0)
          {
             printf("error pnt %d  line %d type %d \n",g_lpoints_sort[i],g_lpoints[g_lpoints_sort[i]].nLine,g_lpoints[g_lpoints_sort[i]].nType);
          }
      }
   }
   return false;
}

///////////////////
//sort intersection

static bool sortist(const Intersection& i1, const Intersection& i2)
{
    if(i1.dx < i2.dx)
    {
            return true;
    }
    else if( (i1.dx == i2.dx) && (i1.dy < i2.dy) )
    {
        return true;
    }
    else
    {
         return false;
    }

}

void showallsit()
{
   std::sort(g_intersections.begin(),g_intersections.end(),sortist);
   std::vector<Intersection>::iterator ci = g_intersections.begin();
   while(g_intersections.end() != ci)
   {
      if(N_CFG_DEBUG_OUTPUT > 0)
      {
         printf("line %ld %ld ",ci->l1,ci->l2);
      }
      printf("%.2f %.2f\n",ci->dx ,ci->dy);
      ci++;
   }
}



int main(int argc, char *argv[])
{
    int num = -1;
    if (scanf("%d",&num) != EOF)
    {
       initLines(num);
       float dsx = 0.0, dsy = 0.0, dex = 0.0,dey = 0.0;
       while(num > 0)
       {
          num--;
          if(scanf("%f%f%f%f",&dsx,&dsy,&dex,&dey) != EOF)
          {
             addALine(dsx,dsy,dex,dey);
          }
       }
       findlines();
       showallsit();
    }
    return 0;
}
