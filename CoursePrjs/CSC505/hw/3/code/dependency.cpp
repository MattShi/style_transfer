
#include <stdio.h>
#include<iostream>
#include <string>
#include <memory.h>
#include <vector>
#include <map>
#include <algorithm>

const int COLOR_WHITE = 0;
const int COLOR_GRAY = -1;
const int COLOR_BLACK= 1;
const int CFG_DEBUG_OUTPUT = 0;

const int N_NAME_LEN = 128;

typedef struct tg_Edge
{
   int nFrom;
   int nEnd;
}Edge;


typedef struct tg_Vertex
{
    int nTSta;
    int nTEnd;
    int nParent;
    int nColor; // 0 white -1 gray 1 black
    int nOrgIdx;
    char sname[N_NAME_LEN];
}Vertex;

typedef struct tg_SCC
{
    int* pV;
    int nLen;
}SCC;


typedef std::vector<int> VerticsIdx;
typedef std::map<int,std::vector<int> >  VEAdj; // vertex to related vertics from start to end
typedef std::map<std::string,int> VNames;  // all vertics ,find by name
typedef std::vector<std::vector<int> > VSCCSETS;

VNames g_vnames;
VEAdj g_adj;
std::vector<int > g_finishidx; //save finish

int g_verticssize = -1;
int g_edgesize = -1;

int g_TimeStamp = 0;

Edge* g_edges = 0;
Vertex* g_vertics = 0;
int* g_pVisitV = 0;
VSCCSETS g_vsccsets ;

void addcourse(int nIdx,const char* szName)
{
   g_vnames.insert(std::make_pair(std::string(szName),nIdx));
   strcpy(g_vertics[nIdx].sname,szName);
   g_vertics[nIdx].nParent = -1;
   g_vertics[nIdx].nTEnd = g_vertics[nIdx].nTSta = -1;
   g_vertics[nIdx].nOrgIdx = nIdx;
   g_pVisitV[nIdx]  = nIdx;
}

int getcoursebyname(const char* szName)
{
   VNames::const_iterator cIt = g_vnames.find(std::string(szName));
   if(g_vnames.end() != cIt)
   {
       return cIt->second;
   }
   else
   {
       return -1;
   }
}

void initialEdges(int n)
{
    if(0 == g_edges)
    {
       g_edges = new Edge[n];
       memset(g_edges,0,sizeof(Edge)*n);
    }
}

void initialVertics(int n)
{
    if(0 == g_vertics)
    {
       g_vertics = new Vertex[n];
       memset(g_vertics,0,sizeof(Vertex)*n);
    }
    if(0 == g_pVisitV)
    {
       g_pVisitV = new int[n];
    }

    for(int i = 0; i< n; i++)
    {
       VerticsIdx vept;
       g_adj.insert(std::make_pair(i,vept));

       std::vector<int> v;
       g_vsccsets.push_back(v);
    }
}

void insertEdge(int n,const char* szName1,const char* szName2)
{
   int n1 = getcoursebyname(szName1);
   int n2 = getcoursebyname(szName2);
   if(n1 < 0)
   {
      printf("%s can not be found",szName1);
   }
   if(n2 < 0)
   {
      printf("%s can not be found",szName2);
   }

   g_edges[n].nEnd = n2;
   g_edges[n].nFrom = n1;

   g_adj[n1].push_back(n2);
}

void ResortandTransE()
{
    //resort as g_pVisitV
    for(int j = 0 ; j < g_verticssize ; j++)
    {
       g_adj[j].clear();
       g_pVisitV[j] = g_finishidx.back();

       g_vertics[g_pVisitV[j]].nColor = COLOR_WHITE;
       g_vertics[g_pVisitV[j]].nParent = -1;

       g_finishidx.pop_back();
       g_vsccsets.at(j).clear();
    }

    //trans edges
    Edge* ptransedges = new Edge[g_edgesize];
    memset(ptransedges,0,sizeof(Edge)*g_edgesize);

    for(int i = 0; i < g_edgesize; i++)
    {
       ptransedges[i].nFrom = g_edges[i].nEnd;
       ptransedges[i].nEnd = g_edges[i].nFrom;
       g_adj[ptransedges[i].nFrom].push_back(ptransedges[i].nEnd);

       if(CFG_DEBUG_OUTPUT > 0)
       { printf("push %d->%d \r\n",ptransedges[i].nFrom,ptransedges[i].nEnd);}
    }

    delete g_edges;
    g_edges = ptransedges;

}



void DFS_VISIT(int u ,std::vector<int>& vs)
{
   if(CFG_DEBUG_OUTPUT > 0)
   {
     printf("enter orgidx = %d \r\n" ,u);
   }

   g_vertics[u].nColor = COLOR_GRAY;
   g_TimeStamp++;
   g_vertics[u].nTSta = g_TimeStamp;

   for(std::size_t i = 0; i < g_adj[u].size(); i++)
   {
      int v = g_adj[u].at(i);
      if(COLOR_WHITE == g_vertics[v].nColor)
      {
         g_vertics[v].nParent = u;
         DFS_VISIT(v,vs);
      }
   }
   g_vertics[u].nColor = COLOR_BLACK;
   g_TimeStamp++;
   g_vertics[u].nTEnd = g_TimeStamp;

   g_finishidx.push_back(u);
   vs.push_back(u);

   if(CFG_DEBUG_OUTPUT > 0)
   {
      printf("leave orgidx = %d \r\n" ,u);
   }

}

void DFS(int n)
{
   if(CFG_DEBUG_OUTPUT > 0)
   {
        printf("DFS  start \r\n");
   }

   for(int u = 0; u < n; u ++)
   {
      if(COLOR_WHITE == g_vertics[g_pVisitV[u]].nColor)
      {
         DFS_VISIT(g_pVisitV[u],g_vsccsets.at(g_pVisitV[u]));
      }
   }
   if(CFG_DEBUG_OUTPUT > 0)
   {
      printf("DFS  end \r\n");
   }
}

void printAll()
{
   //sort each set

   std::vector<std::vector<int> >::iterator iter = g_vsccsets.begin();
   while(g_vsccsets.end() != iter)
   {
      int ilen = iter->size();
      if(ilen <= 1)
      {
         iter = g_vsccsets.erase(iter);
         continue;
      }
      std::sort(iter->begin(),iter->end());
      iter++;
   }

   //for sets
   for(std::size_t n = 0; n < g_vsccsets.size(); n++)
   {
     int nsmall = g_vsccsets.at(n).at(0);
     std::size_t nsmallpos = n;
     for(std::size_t m = n; m < g_vsccsets.size(); m++)
     {
        if(g_vsccsets.at(m).at(0) < nsmall)
        {
          nsmallpos = m;
          nsmall = g_vsccsets.at(m).at(0);
        }
     }

     if(nsmallpos != n)
     {
        std::vector<int> scc = g_vsccsets.at(nsmallpos);
        g_vsccsets.at(nsmallpos) = g_vsccsets.at(n);
        g_vsccsets.at(n) = scc;
     }

   }

   //print
    std::size_t noutpos = 0;
    while(noutpos < g_vsccsets.size())
    {
       for(std::size_t p = 0 ;p < g_vsccsets.at(noutpos).size(); p++)
       {
          printf("%s",g_vertics[g_vsccsets.at(noutpos).at(p)].sname);
          if((p+1) < g_vsccsets.at(noutpos).size())
          {
            printf(" ");
          }
       }
       printf("\n");
       noutpos++;
    }
}


int main(int argc, char *argv[])
{
	int num = -1;
    while (scanf("%d",&num) != EOF)
    {
      if((g_verticssize < 0) &&(num > 0))
      {
         g_verticssize = num;
         initialVertics(num);
         for(int i = 0; i < g_verticssize; i++)
         {
            char sz[128] = {0};
            scanf("%s",sz);
            addcourse(i,sz);
         }
      }
      else if((g_verticssize > 0) &&(num > 0))
      {
         g_edgesize = num;
         initialEdges(num);
         for(int i = 0; i < num; i++ )
         {
            char sz1[128] = {0},sz2[128] = {0};
            scanf("%s %s",sz1,sz2);
            insertEdge(i,sz1,sz2);
         }
      }
      else if((0 == num) && (g_verticssize > 0))
      {
         break;
      }
    }

    DFS(g_verticssize);
    ResortandTransE();
    DFS(g_verticssize);
    printAll();

    return 0;
}
