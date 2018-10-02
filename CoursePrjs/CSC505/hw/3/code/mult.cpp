
#include <stdio.h>
#include<iostream>
#include <string>
#include <memory.h>
#include <vector>



const long N_COST_MAX = 1024*1024*1024;
long** g_matrix = 0;
long** g_s = 0;
int* g_cost = 0;
int g_costsize = -1;

void matrix_mutil(int* szunit, int n)
{
   g_matrix = new long*[n+1];
   g_s  = new long*[n+1];
   for(int i = 1; i <= n; i++)
   {
       long* pl = new long[n+1];
       memset(pl,0,sizeof(long)*(n+1));
       g_matrix[i] = pl;
       g_matrix[i][i] = 0;

       long* ps = new long[n+1];
       memset(ps,0,sizeof(long)*(n+1));
       g_s[i] = ps;
   }

   for(int l = 2; l <= n; l++)
   {
       for(int i = 1; i <= n-l+1; i++)
       {
           int j = i+l-1;
           g_matrix[i][j] = N_COST_MAX;
           g_s[i][j] = 0;

           for(int k = i; k <= j-1;k++)
           {
              long q = g_matrix[i][k] + g_matrix[k+1][j] + szunit[i-1]*szunit[k]*szunit[j];
              if(q < g_matrix[i][j])
              {
                 g_matrix[i][j] = q;
                 g_s[i][j] = k;
              }
           }
       }
   }

}

void printmtx(int i,int j,int nIdx)
{
  if( i == j)
  {
     printf("M%d",i);
  }
  else
  {
      if(nIdx != 0) // outermost
      {
        printf("( ");
      }
      printmtx(i,g_s[i][j],nIdx+1);
      printf(" * ");
      printmtx(g_s[i][j]+1,j,nIdx+1);

      if(nIdx != 0) // outermost
      {
        printf(" )");
      }
  }
}


int main(int argc, char *argv[])
{
	int num = -1;
    int nIdx = 0;
    while (scanf("%d",&num) != EOF)
    {
      if((g_costsize < 0) &&(num > 0))
      {
         g_costsize = num+1;
         g_cost = new int[g_costsize];
         memset(g_cost,0,sizeof(int)*g_costsize);
      }
      /*
      else if((0 == num) && (g_costsize > 0))
      {
         break;
      }
      */
      else if(0 != g_cost)
      {
         g_cost[nIdx] = num;
         nIdx++;
      }
    }

    if(0 != g_cost)
    {
       matrix_mutil(g_cost,g_costsize-1);
       printmtx(1,g_costsize -1,0);
    }

    return 0;

}
