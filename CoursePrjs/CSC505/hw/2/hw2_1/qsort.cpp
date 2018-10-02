// hw2_1.cpp : Defines the entry point for the console application.
//

#include <stdio.h>
#include <iostream>
#include <string>
#include <memory.h>
#include <stdlib.h>

std::string STR_EXIT = "e";
int N_THOUSANDS = 1024*10;

int g_qsortbase = 2;
int g_currentsize = 0;
int *g_sort = new int[N_THOUSANDS];
int g_current_maxsize = N_THOUSANDS;

void changesize()
{
    if(g_current_maxsize <= g_currentsize)
    {

        int* p = new int[g_currentsize + N_THOUSANDS];
        memset(p,0,sizeof(int)*(g_currentsize + N_THOUSANDS));
        memcpy(p,g_sort,sizeof(int)*g_currentsize);
        g_current_maxsize = g_currentsize + N_THOUSANDS;
        delete g_sort;
        g_sort = p;

    }
}

void addele(int n)
{
    changesize();
    g_sort[g_currentsize] = n;
    g_currentsize++;
}

void qsswap(int n,int m)
{
    if( m == n)
    {
        return;
    }
    int ntemp = g_sort[n];
    g_sort[n] = g_sort[m];
    g_sort[m] = ntemp;
}

void bubblesort(int nstart,int nend)
{

    for(int i = nstart;i <= nend; i++)
    {
        int nMinidx = i;
        int nMin = g_sort[i];
        for(int j = i;j <= nend; j++)
        {
            if(g_sort[j] < nMin)
            {
                nMinidx = j;
            }
        }
        qsswap(i,nMinidx);
    }
}


int qspartition(int nstart,int nend)
{
    int npivot = g_sort[nend];
    int nidx = nstart;
    for(int i = nstart; i < nend;i++)
    {
        if(g_sort[i] < npivot)
        {
           qsswap(nidx,i);
           nidx++;
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
    int nstage = nend - nstart + 1;
    if(nstage <= g_qsortbase)
    {
       return bubblesort(nstart,nend);
    }
    int npttion = qspartition(nstart,nend);
    quicksort(nstart,npttion-1);
    quicksort(npttion+1,nend);
}

void printall()
{
    for(int i =0;i < g_currentsize;i++)
    {
        printf("%d \n",g_sort[i]);
    }
}

int main(int argc, char *argv[])
{
    if(argc >= 2)
    {
        g_qsortbase = atoi(argv[1]);
    }
	char szcmd[10] = {0};
    int nnum = 0;
    while (scanf("%d",&nnum) != EOF)
    {
        if(nnum == 0)
        {
            break;
        }
        addele(nnum);
    }
    quicksort(0,g_currentsize-1);
    printall();

    return 0;
}

