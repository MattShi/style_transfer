#include<stdio.h>
#include<iostream>
#include <memory.h>
#include<string>
#include<vector>


#ifndef NULL
#define NULL 0
#endif //


const int N_INPUT_MAX_LEN = 128;
const int N_MAX_DIS = 0x0FFFFFFF;
const int CFG_DEBUG_OUTPUT= 0;

int** g_m = NULL;   //[i][j] //for  string dis
int** g_d = NULL;  //[k][i][j]  //for path dis
int** g_p = NULL;  //[i][j]  //for break pos

std::vector<std::string> g_words;

int g_m_size = 0;


void deletemMtx(int** pMtx, int nSize)
{
   for(int n = 0; n < nSize ; n++)
   {
      delete pMtx[n] ;
   }
   delete pMtx;
}

void deletemMtx(int*** pMtx, int nSize)
{
   for(int n = 0; n < nSize ; n++)
   {
      for(int j = 0; j < nSize ; j++)
      {
         delete pMtx[n][j] ;
      }
      delete pMtx[n];
   }
   delete pMtx;
}



void initialMtx()
{
   if(NULL != g_m)
   {
     deletemMtx(g_m,g_m_size);
   }
   if(NULL != g_d)
   {
     deletemMtx(g_d,g_m_size);
   }


    g_m = new int*[g_m_size];
    memset(g_m,0,sizeof(int*)*g_m_size);
    for(int i = 0;i < g_m_size; i++)
    {
        int* p = new int[g_m_size];
        memset(p,0,sizeof(int)*g_m_size);
        g_m[i] = p;
    }

    g_p = new int*[g_m_size];
    memset(g_p,0,sizeof(int*)*g_m_size);
    for(int i = 0;i < g_m_size; i++)
    {
        int* p = new int[g_m_size];
        memset(p,0,sizeof(int)*g_m_size);
        g_p[i] = p;
    }

    g_d = new int*[g_m_size];
    memset(g_d,0,sizeof(int**)*g_m_size);
    for(int i = 0;i < g_m_size; i++)
    {
        int* p = new int[g_m_size];
        memset(p,0,sizeof(int)*g_m_size);
        g_d[i] = p;
    }

}

//insert a string
void addaword(const char* szword)
{
   if(NULL != szword)
   {
      g_words.push_back(std::string(szword));
      if(CFG_DEBUG_OUTPUT > 0)
      {
         printf("add %s %d\n",szword,(int)(g_words.size()));
      }

   }
}

//get distance from pos1 to pos2
int getdistance(int pos1,int pos2)
{
   if((pos1 >= g_m_size) || (pos2 >= g_m_size))
   {
      return N_MAX_DIS;
   }
   else
   {
      int nlen1 = g_words[pos1].length();
      int nlen2 = g_words[pos2].length();
      if((nlen1 != nlen2)
       || (nlen1 <= 0))
      {
         return N_MAX_DIS;
      }
      int* pdis = new int[nlen1];
      int ndifnum = 0;
      int ndis = N_MAX_DIS;
      for(int i = 0; i < nlen1; i++)
      {
         pdis[i] = g_words[pos2].at(i) - g_words[pos1].at(i) ;
         if(pdis[i] != 0)
         {
           ndifnum++;
           ndis = pdis[i];
         }
         if(ndifnum > 1)   //more than 1  different char, break
         {
            delete pdis;
            return N_MAX_DIS;
         }

      }
      delete pdis;
      return ndis > 0 ? ndis:-ndis; //
   }
}

//build string dis mtx
void buildDistanceMtx()
{
    for(int i = 0; i < g_m_size; i++)
    {
       for(int j = 0; j < g_m_size; j++)
       {
          g_m[i][j] = getdistance(i,j);//
          if(CFG_DEBUG_OUTPUT > 0)
          {
             printf("raw dis from %s to %s is %d\n",g_words[i].c_str(),g_words[j].c_str(),g_m[i][j]);
          }
       }
       g_m[i][i] = 0;
    }
}

//compute all pair dis
void allpairDistance()
{
  for(int i = 0; i < g_m_size; i++)
  {
     for(int j = 0; j < g_m_size; j++)
     {
       g_d[i][j] = g_m[i][j];
       g_p[i][j] = -1;
     }
  }
  for(int k = 0; k < g_m_size ;k++)
  {
      for(int i = 0; i < g_m_size; i ++)
      {
         for(int j = 0; j < g_m_size; j++)
         {
            if((N_MAX_DIS != g_d[i][k]) && (N_MAX_DIS != g_d[k][j])
            && (g_d[i][k] + g_d[k][j] < g_d[i][j]))

            {
               g_d[i][j] = g_d[i][k] + g_d[k][j];  //found a shorter one
               g_p[i][j] = k;
               if(CFG_DEBUG_OUTPUT > 0)
               {
                  printf("from %s to %s break at %s k = %d \n",g_words[i].c_str(),g_words[j].c_str(),g_words[k].c_str(),k);
               }
            }
            else
            {
               if(CFG_DEBUG_OUTPUT > 0)
               {
                 printf("from %s to %s reachable  k = %d \n",g_words[i].c_str(),g_words[j].c_str(),k);
               }
            }
         }
      }
  }
}

//print path from pos1 to pos2
void printpath(int npos1,int npos2)
{
  if(npos1 == npos2)
  {
    return;
  }
  else if((npos1 < 0) || (npos2 < 0))
  {
     if(CFG_DEBUG_OUTPUT > 0)
     {
        printf("error pos pos1 = %d ,pos2 = %d\n",npos1,npos2);
     }
  }
  else if((npos1 >= g_m_size) || (npos2 >= g_m_size))
  {
     if(CFG_DEBUG_OUTPUT > 0)
     {
        printf("error pos pos1 = %d ,pos2 = %d\n",npos1,npos2);
     }
  }
  else
  {
    if(N_MAX_DIS != g_m[npos1][npos2])  // no break ,print directly
    {
      printf(" %s", g_words[npos2].c_str());
    }
    else
    {
      printpath(npos1,g_p[npos1][npos2]);  //pos1 to break
      printpath(g_p[npos1][npos2],npos2);  //break to pos2
    }
  }
}

void statisticpath()
{
   int num = 0;
   for(int i = 0; i < g_m_size ; i++)
   {
      for(int j = 0; j < g_m_size ; j++)
      {
         if(g_d[i][j]!= N_MAX_DIS)
         {
            num++;
            if(CFG_DEBUG_OUTPUT > 0)
            {
              printf("from %s to %s reachable ,distance is %d \n",g_words[i].c_str(),g_words[j].c_str(),g_d[i][j]);
            }
         }
      }
   }
   printf("%.2f",num/(g_m_size*1.0));
   if(CFG_DEBUG_OUTPUT > 0)
   {
     for(int i = 0 ; i < g_m_size ;i++)
     {
        for(int j = 0 ;j < g_m_size; j++)
        {
           if(g_p[i][j] >= 0)
           {
              printf("%s to %s break at %s \n",g_words[i].c_str(),g_words[j].c_str(),g_words[g_p[i][j]].c_str());
           }
        }

     }
   }
}

void printdis(int npos1,int npos2)
{
   if(g_d[npos1][npos2] < N_MAX_DIS)
   {
      printf("\n%d %s",g_d[npos1][npos2],g_words[npos1].c_str());
      printpath(npos1,npos2);
   }
   else
   {
      printf("\n%s %s not reachable",g_words[npos1].c_str(),g_words[npos2].c_str());
   }
}

//get one pair dis
void getpairdistance(const char* sz1,const char* sz2)
{
   int npos1 = -1, npos2 = -1;
   for(int i = 0; i < g_m_size ; i++)
   {
      if(0 == g_words[i].compare(sz1))
      {
         npos1  = i;
      }
      else if(0 == g_words[i].compare(sz2))
      {
         npos2 = i;
      }
   }
   if((npos1 < 0) || (npos2 < 0))
   {
      return ;
   }
   if((npos1 >= g_m_size) || (npos2 >= g_m_size))
   {
      return ;
   }

   printdis(npos1,npos2);
}


int main(int argc, char *argv[])
{
    int num = -1;
    char szinput[N_INPUT_MAX_LEN] = {0};
    while (scanf("%d",&num) != EOF)
    {
      if((g_m_size <= 0) &&(num > 0))
      {
          for(int n = 0 ; n < num; n++)
          {
             if(scanf("%s",szinput) != EOF)
             {
                addaword(szinput);
                memset(szinput,0,sizeof(char)*N_INPUT_MAX_LEN);
             }
          }
          g_m_size = num;
          initialMtx();
          buildDistanceMtx();
          allpairDistance();
          statisticpath();
      }
      else if(num > 0)
      {
        while(num > 0)
        {
            char sz1[N_INPUT_MAX_LEN] = {0},sz2[N_INPUT_MAX_LEN] = {0};
            if(scanf("%s %s",sz1,sz2) != EOF)
            {
              getpairdistance(sz1,sz2);
            }
            num--;
        }
      }
    }
}
