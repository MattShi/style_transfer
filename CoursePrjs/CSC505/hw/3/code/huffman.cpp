
#include <stdio.h>
#include<iostream>
#include <string>
#include <memory.h>

/*
1 build min-heap Q
2  for(extract 2 smallest from Q)
{
  new I from 2 smallest
  insert I to Q

}
*/
#ifndef MAX_NUMBER
#define MAX_NUMBER(a, b)  (((a) > (b)) ? (a) : (b))
#endif

const char  ILL_LEAF_CHAR = 0xff;
const int N_CODE_LEN = 64;
const int N_CHAR_VALUE = 256;
const int N_NODESIZE = N_CHAR_VALUE + 1; //FOR EOF
const int CFG_DEBUG_OUTPUT = 0;
const int N_VALID_CHAR_MIN = 0;
const int N_VALID_CHAR_MAX = 256;
const int N_LEFT_NODE = 0;
const int N_RIGHT_NODE = 1;
const int N_OUTPUT_ORGCHAR_MIN = 33;
const int N_OUTPUT_ORGCHAR_MAX = 126;

typedef struct tg_HMNode
{
  int     c;
  long    f;
  long    l;
  long    r;
  long    h;
  char    code[N_CODE_LEN];

  tg_HMNode()
  {
    c = 0;
    f = 1;
    l = -1;
    r = -1;
    h = 0;
    code[0] = '\0';
  }

}HMNode;



long *g_inputchars = new long[N_NODESIZE]; // input chars g_inputnodes[char] = frequency
int g_inoutchar_maxIdx = N_NODESIZE;

int g_currently_hmcode_maxIdx = -1;
int g_hmcode_maxIdx = N_NODESIZE;
HMNode *g_hmnodes = new HMNode[N_NODESIZE];//pos ->hmcode

int g_currently_treenode_maxIdx = -1;
int g_treenode_maxIdx = N_NODESIZE;
long *g_treenodes = new long[N_NODESIZE]; //key pos <-> hamcode node pos -->hamcode detail


/*
when this prom runs out of mem,do this
*/
void tidyhmnodes()
{
	HMNode * p = new HMNode[N_NODESIZE + g_currently_hmcode_maxIdx + 1];
	memset(p, 0, sizeof(HMNode)*(N_NODESIZE + g_currently_hmcode_maxIdx + 1));
	memcpy(p,g_hmnodes, sizeof(HMNode)*(g_currently_hmcode_maxIdx + 1));
	delete 	 g_hmnodes;
	g_hmnodes = p;
	g_hmcode_maxIdx = g_currently_hmcode_maxIdx + N_NODESIZE;
}

void tidytreenodes()
{
	long * p = new long[N_NODESIZE + g_currently_treenode_maxIdx + 1];
	memset(p, 0, sizeof(long)*(N_NODESIZE + g_currently_treenode_maxIdx + 1));
	memcpy(p,g_treenodes, sizeof(long)*(g_currently_treenode_maxIdx + 1));
	delete 	 g_treenodes;
	g_treenodes = p;
	g_treenode_maxIdx = g_currently_treenode_maxIdx + N_NODESIZE;
}

int getparent(int nchildidx)
{
	return (int)(nchildidx/2  + (nchildidx%2 > 0 ? 0:-1));
}

/**
 *  get tree node value ,it should be a idx of hmnode
 *  @param nPos  tree node pos
 *  @param int& nvalue return hm node idx
 *  @return tree node idx
 */
bool getvalue(int nPos,int& nvalue)
{
	if ((nPos < 0) || (nPos > g_currently_hmcode_maxIdx))
	{
		return false;
	}
	else
	{
		 nvalue = g_treenodes[nPos];
		 return true;
	}
}

/**
 *  get tree node value ,it should be a frequency
 *  @param nPos  tree node pos
 *  @param int& nvalue return hm node frequency
 *  @return tree node idx
 */
bool getvalue(int nPos,long& nvalue)
{
	if ((nPos < 0) || (nPos > g_currently_hmcode_maxIdx))
	{
		return false;
	}
	else
	{
		 nvalue = g_hmnodes[g_treenodes[nPos]].f;
		 return true;
	}
}


/**
 *  swap tree node ,just tree node ,not hmnode
 *  @param nPos1  tree node pos
 *  @param nPos2  tree node pos
 *  @return bool true suced,other ,failed
 */
bool swapvalue(int nPos1, int nPos2)
{
	if ((nPos1 > g_currently_hmcode_maxIdx)
		|| (nPos2 > g_currently_hmcode_maxIdx))
	{
		return false;
	}
	else
	{
		int ntemp = g_treenodes[nPos1];
		g_treenodes[nPos1] = g_treenodes[nPos2];
		g_treenodes[nPos2] = ntemp;
		return true;
	}
}


int getleftchild(int nparent)
{
	return 2 * (nparent+1) -1;
}

/**
 *  min_heapify
 *  @param int nPos tree node pos
 *
 *  @return int  > 0 suced; other failed
 */
int min_heapify(int nPos)
{
	int nleftkey = getleftchild(nPos);
	if (nleftkey > g_currently_treenode_maxIdx) /* no leaves here*/
	{
		return 1;
	}

	int nrightkey = nleftkey + 1;
	long nleftv = 0, nrightv = 0,nPosv = 0;
	if (!getvalue(nPos, nPosv))
	{
		return -1;
	}

	long nsmallestv = nPosv;
	int nsmallestkey = nPos;
	if (getvalue(nleftkey, nleftv))
	{
		if (nleftv < nsmallestv)
		{
			nsmallestkey = nleftkey;
			nsmallestv = nleftv;
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

	if (nsmallestkey != nPos)
	{
		swapvalue(nPos, nsmallestkey);
		return min_heapify(nsmallestkey);
	}
	return -1;
}

/**
 *  percolate: tring to move the node to  the right place
 *  @param int nPos tree node pos
 *
 *  @return int  > 0 suced; other failed
 */
int percolate(int nPos)
{
	int nparentpos = getparent(nPos);
	if (nparentpos >= nPos) /*can not be smaller than itself*/
	{
		return 1;		   /*root */
	}
	long nf = 0;
	if (!getvalue(nPos, nf))
	{
		return -1;
	}
	long nparentf = 0;
	if (getvalue(nparentpos, nparentf))
	{
		if (nparentf >= nf)
		{
			swapvalue(nPos, nparentpos);
			return percolate(nparentpos);
		}
	}
	return -1;
}

/**
 *  insert a hm  node:
 *         while we are inserting a hm node ,its also insert a tree node
 *  @param c char ,from 0 to max_char_value
 *
 *  @return tree node idx
 */
int insertTreenode(int v)
{
      //insert tree node
    g_currently_treenode_maxIdx++;
	if (g_currently_treenode_maxIdx >= g_treenode_maxIdx)
	{
		tidytreenodes();
	}
	g_treenodes[g_currently_treenode_maxIdx] = v; //key : tree node pos ; v hm node idx
	if(CFG_DEBUG_OUTPUT > 0)
	{
	   printf("insert tree node %d char = %c hmnode idx = %d hmnode f = %ld \r\n",g_currently_treenode_maxIdx,g_hmnodes[v].c,v,g_hmnodes[v].f);
    }

	return percolate(g_currently_treenode_maxIdx);
}

/**
 *  insert  hm node:
 *  @param c char ,from 0 to max_char_value
 *
 *  @return hm node idx
 */
int insertHMnode(int c)
{
    g_currently_hmcode_maxIdx++;
	if (g_currently_hmcode_maxIdx >= g_hmcode_maxIdx)
	{
		tidyhmnodes();
	}
	g_hmnodes[g_currently_hmcode_maxIdx].c = c;
	g_hmnodes[g_currently_hmcode_maxIdx].f = (1 > g_inputchars[c]) ? 1 : g_inputchars[c] ;
	return g_currently_hmcode_maxIdx;
}

/**
 *  insert  hm node:
 *  @param const HMNode& hmnode
 *
 *  @return hm node idx
 */
int insertHMnode(const HMNode& hmnode)
{
    g_currently_hmcode_maxIdx++;
	if (g_currently_hmcode_maxIdx >= g_hmcode_maxIdx)
	{
		tidyhmnodes();
	}
    memcpy(&g_hmnodes[g_currently_hmcode_maxIdx],&hmnode,sizeof(HMNode));
	return g_currently_hmcode_maxIdx;
}

/**
 *  insert  node:
 *         include w a hm node and a tree node
 *  @param c char ,from 0 to max_char_value
 *
 *  @return tree node idx
 */
int insertNode(int c)
{
    if((c < N_VALID_CHAR_MIN) || (c > N_VALID_CHAR_MAX))
    {
       return -1;
    }

    //insert hmcode node
	int nHMIdx = insertHMnode(c);

    //insert tree node
    return insertTreenode(nHMIdx);
}


/**
 *  removeMin
 *  @param null
 *
 *  @return value as hmn node idx
 */
int removeMin()
{
	int nmin = g_treenodes[0];
	g_treenodes[0] = g_treenodes[g_currently_treenode_maxIdx];
	g_currently_treenode_maxIdx--;
	min_heapify(0);
	return nmin;
}

int showall()
{
    long loutputidx = N_VALID_CHAR_MIN;
    while((loutputidx <= g_currently_hmcode_maxIdx)
    && (loutputidx <= N_VALID_CHAR_MAX) )
    {
        if(ILL_LEAF_CHAR != g_hmnodes[loutputidx].c )
        {
           if(( loutputidx >= N_OUTPUT_ORGCHAR_MIN ) && (loutputidx <= N_OUTPUT_ORGCHAR_MAX))
           {
             printf(" %c %s\r\n",g_hmnodes[loutputidx].c,g_hmnodes[loutputidx].code);
           }
           else
           {
             if((g_currently_hmcode_maxIdx  == loutputidx) || (N_VALID_CHAR_MAX == loutputidx))
             {
                printf("EOF %s\r\n",g_hmnodes[loutputidx].code); //last one
             }
             else
             {
                printf(" %02X %s\r\n",g_hmnodes[loutputidx].c,g_hmnodes[loutputidx].code);
             }
           }

        }
        loutputidx++;
    }
    return 0;
}

void insertchar(int c)
{
    g_inputchars[c]++;
}

void generateHMcode(int nnodeidx,const char* strparentcode,int nodetype)
{
  if((nnodeidx < 0) || (nnodeidx > g_currently_hmcode_maxIdx))
  {
     return ;
  }
  std::string strcode(strparentcode);
  strcode.append((nodetype == N_LEFT_NODE)? "0":"1");
  strcpy(g_hmnodes[nnodeidx].code,strcode.c_str());
  if(ILL_LEAF_CHAR == g_hmnodes[nnodeidx].c )
  {
    generateHMcode(g_hmnodes[nnodeidx].l,g_hmnodes[nnodeidx].code,N_LEFT_NODE);
    generateHMcode(g_hmnodes[nnodeidx].r,g_hmnodes[nnodeidx].code,N_RIGHT_NODE);
  }
  else
  {
     if(CFG_DEBUG_OUTPUT > 0)
     {
        printf("hmcode char = %c  code = %s\r\n",g_hmnodes[nnodeidx].c,g_hmnodes[nnodeidx].code);
     }
  }
}


void buildhm()
{
    //build tree
    for(int i = 0; i < N_NODESIZE ;i ++)
    {
        insertNode(i);
    }

    //build hmcode
    //n char codes, need n-1 calls

    for(int i = N_VALID_CHAR_MIN; i < N_VALID_CHAR_MAX ;i++)
    {
        int nhmnode1 = removeMin();
        int nhmnode2 = removeMin();
        if((nhmnode1 > g_currently_hmcode_maxIdx) || (nhmnode2 > g_currently_hmcode_maxIdx))
        {
           continue;
        }
        if((nhmnode1 < 0) || (nhmnode2 < 0))
        {
            continue ;
        }
        ////////////////////
        if(g_hmnodes[nhmnode1].c > g_hmnodes[nhmnode2].c) //move the smaller c to left part
        {
              int nodetemp = nhmnode1;
              nhmnode1 = nhmnode2;
              nhmnode2 = nodetemp;
        }

        if(CFG_DEBUG_OUTPUT > 0)
        {
            printf("remove min node1 = %d cnode1 = %c node2 = %d  cnode2 = %c\r\n",nhmnode1,g_hmnodes[nhmnode1].c,nhmnode2,g_hmnodes[nhmnode2].c);
        }
        HMNode newnode;
        newnode.l = nhmnode1;
        newnode.r = nhmnode2;
        newnode.f = g_hmnodes[nhmnode1].f + g_hmnodes[nhmnode2].f;
        newnode.h = MAX_NUMBER(g_hmnodes[nhmnode1].h,g_hmnodes[nhmnode2].h) +1;
        newnode.c = ILL_LEAF_CHAR;
        int newnodeidx = insertHMnode(newnode);
        if(newnodeidx >= 0)
        {
           insertTreenode(newnodeidx);
           if(CFG_DEBUG_OUTPUT > 0)
           {
              printf("insertHMnode hmidx = %d f = %ld left hmidx = %ld right hmidx = %ld \r\n",newnodeidx,newnode.f ,newnode.l,newnode.r);
           }
        }
        else
        {
            if(CFG_DEBUG_OUTPUT > 0)
            {
               printf("insertHMnode return HM idx %d \r\n",newnodeidx);
            }
        }
    }

    std::string strcode = "";
    generateHMcode(g_hmnodes[g_treenodes[0]].l,strcode.c_str(),N_LEFT_NODE);
    generateHMcode(g_hmnodes[g_treenodes[0]].r,strcode.c_str(),N_RIGHT_NODE);
}


int main(int argc, char *argv[])
{
	char c = 0;
    while (scanf("%c",&c) != EOF)
    {
      if(c == '0')
      {
          break;
      }
      insertchar(c);
    }
    buildhm();
    showall();
    return 0;

}
