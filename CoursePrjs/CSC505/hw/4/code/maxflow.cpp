#include <stdio.h>
#include <iostream>
#include <queue>
#include <memory.h>

#ifndef NULL
#define NULL 0
#endif //

const int CFG_DEBUG_OUTPUT = 0;
const int N_EDGE_NUM = 8;

const int N_EFD = 1;
const int N_EBD = -1;

const int N_MAX = 0x00FFFFFFF;

typedef struct tg_EdgeInfo
{
   int ned; //1 forward 0 -1 backword
   int now;
   int nfw;
}EDGEINFO;

typedef struct tg_Edge
{
   int nf;
   int ne;
}EDGE;

typedef struct tg_Node
{
   int nadjnum;
   int np;
   int bin;
   int bout;
}NODE;

NODE* g_n = NULL; // points
int** g_adj = NULL;//point ->adj edge list
EDGEINFO** g_e_i = NULL; //edges  mtx
EDGE* g_e_l = NULL; //edges list
int g_e_num = 0;
int g_n_num = 0;

void buildGraph(int np,int ne)
{
   if(CFG_DEBUG_OUTPUT > 0)
   {
      printf("buildGraph  %d %d\n",np,ne);
   }

   if(NULL == g_n)
   {
     g_n = new NODE[np];
     memset(g_n,0,sizeof(NODE)*np);
     g_n_num = np;
     for(int i = 0; i < np; i++)
     {
       g_n[i].np = -1;
     }
   }
   if(NULL == g_e_l)
   {
     g_e_l = new EDGE[ne];
     memset(g_e_l,0,sizeof(EDGE)*ne);
   }
   if(NULL == g_e_i)
   {
     g_e_i = new EDGEINFO*[np];
     memset(g_e_i,0,sizeof(EDGEINFO*)*np);
     for(int i = 0 ; i < np; i++)
     {
        EDGEINFO* p = new EDGEINFO[np];
        memset(p,0,sizeof(EDGEINFO)*np);
        g_e_i[i] = p;
     }
     g_e_num = ne;
   }

   if(NULL == g_adj)
   {
      g_adj = new int*[np];
      for(int i = 0; i < np; i ++)
      {
         int* p = new int[N_EDGE_NUM];
         g_adj[i] = p;
      }
   }
}

void insertadj(int nf, int ne)
{
   int nadjnum = g_n[nf].nadjnum;
   if(0 == nadjnum%N_EDGE_NUM) //resize
   {
     int* p = new int[nadjnum + N_EDGE_NUM];
     memcpy(p,g_adj[nf],sizeof(int)*(nadjnum));
     delete g_adj[nf];
     g_adj[nf] = p;
   }
   g_adj[nf][g_n[nf].nadjnum] = ne;
   g_n[nf].nadjnum++;

}


void insertaedge(int nf, int ne, int nw,int neidx)
{
   if((neidx >= g_e_num) || (neidx < 0))
   {
      return ;
   }
   if( (nf < 0) || (nf > g_n_num)
     || (ne < 0) || (ne > g_n_num))
   {
      return ;
   }
   //edge
   g_e_i[nf][ne].now = nw;
   g_e_i[nf][ne].nfw = nw;
   g_e_i[nf][ne].ned = N_EFD;

   //
   g_e_l[neidx].nf = nf;
   g_e_l[neidx].ne = ne;
   //adj
   insertadj(nf,ne);

   //node
   g_n[nf].bout = 1;
   g_n[nf].np = -1;
   g_n[ne].bin = 1;
   //end
   if(CFG_DEBUG_OUTPUT > 0)
   {
      printf("insert edge %d %d %d %d\n",nf,ne,nw,neidx);
   }
}


int BFS(int i,int j)
{
  std::queue<int> q;
  q.push(i);
  while(!q.empty())
  {
     int nf = q.front();
     q.pop();

     int* padj = g_adj[nf];
     int nadjnum = g_n[nf].nadjnum;
     while(nadjnum > 0)
     {
        nadjnum--;
        int ne = padj[nadjnum];
        if(ne == i)  //never go back to the start place
        {
          continue ;
        }
        if((-1 == g_n[ne].np) && (g_e_i[nf][ne].nfw > 0))
        {
           q.push(ne);
           g_n[ne].np = nf;
           if(ne == j) //end
           {
              return 1;
           }
        }
     }
  }
  return -1;
}

int reweight(int i , int j)
{

  int nflow = N_MAX;
  int ne = j;

  while((ne >= 0) && (ne < g_n_num))
  {
    int nf = g_n[ne].np;
    if(nf < 0 || nf > g_n_num)
    {
       break ;
    }
    nflow  = nflow > g_e_i[nf][ne].nfw ? g_e_i[nf][ne].nfw:nflow;
    ne = nf;
  }
  if(ne != i)
  {
    if(CFG_DEBUG_OUTPUT > 0)
    {
      printf("can not find a backward way from %d %d\n",i,j);
      return nflow;
    }
  }

  //MINUS
  while((j >= 0) && (j < g_n_num))
  {
    int nf = g_n[j].np;
    if(nf < 0 || nf > g_n_num)
    {
       break ;
    }
    g_e_i[nf][j].nfw -= nflow;
    if(CFG_DEBUG_OUTPUT > 0)
    {
       printf("from %d back to %d weight %d \n",j,nf,nflow);
    }

    if(g_e_i[j][nf].ned == 0) //not a fd or bd
    {
      g_e_i[j][nf].ned = N_EBD;
      g_e_i[j][nf].nfw = 0;
      insertadj(j,nf);
    }
    g_e_i[j][nf].nfw += nflow;


    j = nf;
  }

  //clear p
  for(int i = 0 ; i < g_n_num ;i ++)
  {
    g_n[i].np = -1;
  }
  return nflow;
}

// do max flow from i to j
void maxflowtraverse(int i, int j)
{
   int ntotal = 0;
   int nmaxf = 0;
   int nbfssuc = 1;
   while(nbfssuc > 0)
   {
     nbfssuc = BFS(i,j);   //BFS find a pos way from i to j
     nmaxf = reweight(i,j); //change the remain flow of the graph

     if((nbfssuc < 0) || (N_MAX == nmaxf)) //error return
     {
        break;
     }
     ntotal += nmaxf;
     if(CFG_DEBUG_OUTPUT > 0)
     {
       printf("BFS max weight %d\n",nmaxf);
     }
   }
   printf("%d\n",ntotal);
   int nf = -1, ne = -1;
   for(int k = 0; k < g_e_num; k++)
   {
      nf = g_e_l[k].nf;
      ne = g_e_l[k].ne;
      printf("%d %d %d\n",nf,ne,g_e_i[nf][ne].now - g_e_i[nf][ne].nfw);
   }
}

//find the start place and dst node
/*
void getstaanddst(int& i,int&j)
{
   for(int k = 0 ;k < g_n_num; k++)
   {
     if(false == g_n[k].bout)
     {
       j = k;
     }
     else if(false == g_n[k].bin)
     {
       i = k;
     }
   }
}
*/

void findmaxflow()
{
   int i = 0, j = 1;
   //getstaanddst(i,j);

   if(CFG_DEBUG_OUTPUT > 0)
   {
      printf("findmaxflow from %d  to %d\n",i,j);
   }

   if(i >= 0 || j >= 0 )
   {
     maxflowtraverse(i,j);
   }
}

int main(int argc, char *argv[])
{
	int n1 = 0 ,n2 = 0;
    while (scanf("%d %d",&n1,&n2) != EOF)
    {
      if((n1 > 0) && (n2 > 0))
      {
         buildGraph(n1,n2);
      }
      int k = 0,l = 0,m = 0;
      for(int i = 0; i < n2 ; i++)
      {
        scanf("%d %d %d",&k,&l,&m);
        insertaedge(k,l,m,i);
      }
      findmaxflow();
    }

    return 0;
}
