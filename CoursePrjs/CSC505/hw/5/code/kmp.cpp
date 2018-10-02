
#include <stdio.h>
#include <iostream>
#include <memory.h>
#include <string>
#include <stdlib.h>
#include <sys/time.h>
#ifndef NULL
#define NULL 0
#endif //

const int N_CFG_DEBUG_OUTPUT = 0;
const long N_MAX_INPUT_LEN = 1024*1024*1024;
const std::string STR_KMP = "kmp";
const std::string STR_STD = "standard";
const std::string STR_NTV = "native";

typedef struct tag_NeedleNode
{
  char c;
  int  i;
}NeedleNode;

NeedleNode* g_nl = NULL;
long g_nl_len = -1;

std::string g_str_hy;
std::string g_str_nl;

long getMilliseconds()
{
    timeval tv;
    gettimeofday( &tv, NULL );
    long int ms = tv.tv_sec;
    ms = ms * 1000 + tv.tv_usec / 1000;
    return ms;
}

class TimeLog
{
  public:
     TimeLog(const char* szprefix)
     {
       m_t = getMilliseconds();
       m_prefix = std::string(szprefix);
       if(N_CFG_DEBUG_OUTPUT > 1)
       {
          printf("%s search start time : %ld \n",m_prefix.c_str(), m_t);
       }
     };
     ~TimeLog()
     {
       long t = getMilliseconds();
       if(N_CFG_DEBUG_OUTPUT > 1)
       {
          printf("%s search end time : %ld \n",m_prefix.c_str(), t);
       }
        printf("%s search time: %ld \n",m_prefix.c_str(),t - m_t);
     };
  private:
     long m_t;
     std::string m_prefix;
};


void initNl(const char* sznl,const char*szhy)
{
   if(NULL == sznl || NULL == szhy)
   {
     return ;
   }
   g_str_hy = std::string(szhy);
   g_str_nl = std::string(sznl);
   g_nl_len = (long)(g_str_nl.size());

   g_nl = new NeedleNode[g_nl_len];
   for(long i = 0; i < g_nl_len;i++)
   {
     g_nl[i].c = g_str_nl.at(i);
     g_nl[i].i = 0;
   }
   if(N_CFG_DEBUG_OUTPUT > 0 )
   {
      printf("hy length %ld nl length %ld \n",g_str_hy.size(),g_str_nl.size());
   }

}

bool c_prefix()
{
   if(NULL == g_nl)
   {
     return false;
   }
   long k = 0;
   g_nl[1].i = 0;
   for(long q = 2; q < g_nl_len; q++ )
   {
      while((k > 0) && (g_nl[k].c != g_nl[q-1].c))
      {
         k = g_nl[k].i;
      }
      if(g_nl[k].c == g_nl[q-1].c)
      {
          k = k + 1;
      }
      g_nl[q].i = k;

      if(N_CFG_DEBUG_OUTPUT > 2)
      {
         printf("%ld prefix %d \n",q,g_nl[q].i);
      }
   }
   return true;
}

long KMP()
{
   if(!c_prefix())
   {
      return -1;
   }

   long q = 0;
   for (std::size_t i = 0; i < g_str_hy.size();i++)
   {
      while((q > 0) && (g_nl[q].c != g_str_hy[i]))
      {
         q = g_nl[q-1].i;
      }
      if(g_nl[q].c == g_str_hy[i])
      {
         q++;
      }
      else
      {
           if(N_CFG_DEBUG_OUTPUT > 2)
           {
              printf("needle at %ld(%c) hay at %ld(%c) \n",q,g_nl[q].c,(long)i,g_str_hy.at(i));
           }
      }
      if(q == g_nl_len)
      {
         if(N_CFG_DEBUG_OUTPUT > 2)
         {
              printf("find a match at from %ld to %ld \n",(long)(i - g_nl_len +1),(long)i);
         }
         return i - g_nl_len +1;
      }
   }
   return -1;
}

long Standard()
{
   std::size_t tpos = g_str_hy.find(g_str_nl.c_str());
   if(std::string::npos != tpos)
   {
      return (long)(tpos);
   }
   else
   {
      return -1;
   }
}

long Native()
{
  std::size_t tj = g_str_nl.size();
  for(std::size_t i = 0; i < (g_str_hy.size() - tj + 1); i++)
  {
     for(std::size_t j = 0; j < g_str_nl.size() ; j++)
     {
        if(g_str_nl.at(j) != g_str_hy.at(i+j))
        {
          break;
        }
        else
        {
          if(j == g_str_nl.size() -1)
          {
             return i;
          }
        }
     }
  }
  return -1;
}

void generateteststr(std::string & strh, std::string  &strn)
{
  const std::string strtmp = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbb1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbb2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbb3aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbb4";
  const std::string strtgt = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbb";
   for(int i = 0; i < 1024*1024; i++)
   {
      strh += strtmp;
      if(i == 20480)
      {
        strh += strtgt;
      }
   }
   strh += strtgt;
   strn = strtgt;

   if(N_CFG_DEBUG_OUTPUT > 4)
   {
      printf("%s %s\n",strh.c_str(),strn.c_str());
   }
}

int main(int argc, char *argv[])
{
    std::string szHay;
	//std::getline(std::cin, szHay);

	std::string szNeedle;
	//std::getline(std::cin, szNeedle);

	generateteststr(szHay,szNeedle);

    long lpos = -1;
    initNl(szNeedle.c_str(),szHay.c_str());
    {
        TimeLog tlog(STR_NTV.c_str());
        lpos = Native();
        printf("found at %ld\n",lpos);
    }

    {
        TimeLog tlog(STR_STD.c_str());
        lpos = Standard();
        printf("found at %ld\n",lpos);
    }

    {
        TimeLog tlog(STR_KMP.c_str());
        lpos = KMP();
        printf("found at %ld\n",lpos);
    }

    return 0;
}
