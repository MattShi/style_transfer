// hw2_1.cpp : Defines the entry point for the console application.
//

#include <stdio.h>
#include<iostream>
#include <string>
#include <memory.h>

int N_NODESIZE = 100;

int *g_nodes = new int[N_NODESIZE];
int g_currently_maxkey = -1;
int g_maxkey = N_NODESIZE;

const std::string str_add = "add";
const std::string str_remove = "remove";
const std::string str_exit = "e";
const std::string str_all = "a";

void tidynodes()
{
	int * p = new int[N_NODESIZE + g_currently_maxkey + 1];
	memset(p, 0, sizeof(int)*(N_NODESIZE + g_currently_maxkey + 1));
	memcpy(p,g_nodes, sizeof(int)*(g_currently_maxkey + 1));
	delete 	 g_nodes;
	g_nodes = p;
	g_maxkey = g_currently_maxkey + N_NODESIZE;
}

int getparent(int nchildidx)
{
	return (int)(nchildidx/3  + (nchildidx%3 > 0 ? 0:-1));
}

bool getvalue(int nkey,int& nvaule)
{
	if (nkey > g_currently_maxkey)
	{
		return false;
	}
	else
	{
		 nvaule = g_nodes[nkey];
		 return true;
	}
}

bool setvalue(int nkey, int nvalue)
{
	if (nkey > g_currently_maxkey)
	{
		return false;
	}
	else
	{
		 g_nodes[nkey] = nvalue;
		 return true;
	}
}

bool swapvalue(int nkey1, int nkey2)
{
	if ((nkey1 > g_currently_maxkey)
		|| (nkey2 > g_currently_maxkey))
	{
		return false;
	}
	else
	{
		int ntemp = g_nodes[nkey1];
		g_nodes[nkey1] = g_nodes[nkey2];
		g_nodes[nkey2] = ntemp;
		return true;
	}
}


int getleftchild(int nparent)
{
	return 3 * (nparent+1) -2;
}

int min_heapify(int nkey)
{
	int nleftkey = getleftchild(nkey);
	if (nleftkey > g_currently_maxkey) /* no leaves here*/
	{
		return 1;
	}

	int nmidkey = nleftkey +1;
	int nrightkey = nleftkey + 2;
	int nleftv = 0, nmidv = 0, nrightv = 0,nkeyv = 0;
	if (!getvalue(nkey, nkeyv))
	{
		return -1;
	}
	int nsmallestv = nkeyv, nsmallestkey = nkey;
	if (getvalue(nleftkey, nleftv))
	{
		if (nleftv < nsmallestv)
		{
			nsmallestkey = nleftkey;
			nsmallestv = nleftv;
		 }
	}
	if (getvalue(nmidkey, nmidv))
	{
		if (nmidv < nsmallestv)
		{
			nsmallestkey = nmidkey;
			nsmallestv = nmidv;
		}
	}
	if (getvalue(nrightkey, nrightv))
	{
		if (nrightv < nsmallestv)
		{
			nsmallestkey = nrightkey;
			nsmallestv = nrightv;
		}
	}
	if (nsmallestkey != nkey)
	{
		swapvalue(nkey, nsmallestkey);
		return min_heapify(nsmallestkey);
	}
	return -1;
}

int percolate(int nkey)
{
	int nparentkey = getparent(nkey);
	if (nparentkey >= nkey) /*can not be smaller than itself*/
	{
		return 1;		   /*root */
	}
	int nkeyv = 0;
	if (!getvalue(nkey, nkeyv))
	{
		return -1;
	}
	int nparentv = 0;
	if (getvalue(nparentkey, nparentv))
	{
		if (nparentv>  nkeyv)
		{
			swapvalue(nkey, nparentkey);
			return percolate(nparentkey);
		}
	}
	return -1;
}

int add(int v)
{
	g_currently_maxkey++;
	if (g_currently_maxkey >= g_maxkey)
	{
		tidynodes();
	}
	g_nodes[g_currently_maxkey] = v;
	percolate(g_currently_maxkey);

	return g_currently_maxkey;
}

int remove()
{
	int nmin = g_nodes[0];
	g_nodes[0] = g_nodes[g_currently_maxkey];
	g_currently_maxkey--;
	min_heapify(0);
	return nmin;
}

int showall()
{
    for(int i = 0; i <= g_currently_maxkey;i++)
    {
        printf("%d \n",g_nodes[i]);
    }
    return 0;
}



int main(int argc, char *argv[])
{
	memset(g_nodes, 0, sizeof(int)*(g_maxkey));

	char szcmd[10] = {0};
    int nnum = 0;
    while (scanf("%s",szcmd) != EOF)
    {
        if(0 == str_add.compare(szcmd))
        {
            scanf("%d",&nnum);
            add(nnum);
        }
        else if (0 == str_remove.compare(szcmd))
        {
            printf("%d \r\n",remove());
        }
        else if(0 == str_all.compare(szcmd))
        {
             showall();
        }
        else if(0 == str_exit.compare(szcmd))
        {
            return 0;
        }

    }
    return 0;

}

