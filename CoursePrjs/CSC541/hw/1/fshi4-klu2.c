/*****************************************************************************
Copyright: 2017,NCSU
File name:	   fshi4-klu2.c
Description:  541 hw1 
Author: fangyuan shi(fshi4), kai lu(klu2)
Version: v1.01
Date:13/02/2017 
History: 
*****************************************************************************/ 

#include <stdio.h>
#include <stdlib.h>

const int N_HEIGHT_START = 0;	  // the zero height level 
typedef int key_t;
typedef int height_t;
typedef int object_t;
typedef int len_t;
typedef object_t char_object_t;

typedef struct tr_n_t
{
    key_t      key;
	height_t  height;
    struct tr_n_t  *left;
    struct tr_n_t  *right;
	struct tr_n_t  *parent;	         // point to the parent 
} tree_node_t;

#define BLOCKSIZE 256

tree_node_t *currentblock = NULL;
int    size_left;
tree_node_t *free_list = NULL;
int nodes_taken = 0;
int nodes_returned = 0;

/////////////////////////////////////////////
//text editor
#ifndef NULL
#define NULL 0
#endif 
/////////////////////////////////////////////

tree_node_t *get_node()
{ 
  tree_node_t *tmp = NULL;
  nodes_taken += 1;
  if( free_list != NULL )
  {  
	 tmp = free_list;
     free_list = free_list -> right;
  }
  else
  {  
	 if( currentblock == NULL || size_left == 0)
     {  currentblock =
                (tree_node_t *) malloc( BLOCKSIZE * sizeof(tree_node_t) );
        size_left = BLOCKSIZE;
     }
     tmp = currentblock++;

	 tmp->left = NULL;
	 tmp->right = NULL;
	 tmp->parent = NULL;
	 tmp->key = 0;
	 tmp->height = N_HEIGHT_START;

     size_left -= 1;
  }
  return( tmp );
}

void return_node(tree_node_t *node)
{  
	if (NULL == node)
	{
		return;
	}
   node->right = free_list;
   free_list = node;
   nodes_returned +=1;
}

tree_node_t *create_tree(void)
{  
   tree_node_t *tmp_node = NULL;
   tmp_node = get_node();
   if (NULL == tmp_node)
   {
	   return NULL;
   }
   tmp_node->left = NULL;
   tmp_node->right = NULL;
   tmp_node->parent = NULL;
   tmp_node->key = 0;
   
   return( tmp_node );
}

object_t *find_iterative(tree_node_t *tree, key_t query_key)
{  
	if (NULL == tree)
	{
		return NULL;
	}
   tree_node_t *tmp_node;
   if( tree->left == NULL )
     return(NULL);
   else
   {  tmp_node = tree;
      while( tmp_node->right != NULL )
      {  
		  if( query_key < tmp_node->key )
               tmp_node = tmp_node->left;
          else
               tmp_node = tmp_node->right;
      }
      if( tmp_node->key == query_key )
         return( (object_t *) tmp_node->left );
      else
         return( NULL );
   }
}

object_t *find_recursive(tree_node_t *tree, key_t query_key)
{  
	if (NULL == tree)
	{
		return NULL;
	}
	if( tree->left == NULL ||
       (tree->right == NULL && tree->key != query_key ) )
      return(NULL);
   else if (tree->right == NULL && tree->key == query_key )
      return( (object_t *) tree->left );
   else
   {  if( query_key < tree->key )
         return( find_recursive(tree->left, query_key) );
      else
         return( find_recursive(tree->right, query_key) );
   }
}
tree_node_t *find_node(tree_node_t *tree, key_t query_key)
{
	if (NULL == tree)
	{
		return NULL;
	}
	tree_node_t *tmp_node;
	if (tree->left == NULL)
		return(NULL);
	else
	{
		tmp_node = tree;
		while (tmp_node->right != NULL)
		{
			if (query_key < tmp_node->key)
				tmp_node = tmp_node->left;
			else
				tmp_node = tmp_node->right;
		}
		if (tmp_node->key == query_key)
			return(tmp_node);
		else
			return(NULL);
	}
}
///////////////////////////////////////////////////////////////////////
/*************************************************
Function: left_rotation
Description:  left rotate a subtree at node "n"
Input: tree_node_t *n
Output:  
Return: void 
Others: 
Author: fshi4
*************************************************/
void left_rotation(tree_node_t *n)
{
	if (NULL == n)
	{
		return;
	}
	tree_node_t *tmp_node = 0;
	key_t tmp_key = -1;
	tmp_node = n->left;
	tmp_key = n->key;

	n->left = n->right;
	n->left->parent = n;
	n->key = n->right->key;
	n->right = n->left->right;
	n->right->parent = n;

	n->left->right = n->left->left;
	n->left->left = tmp_node;
	n->left->key = tmp_key;

	n->left->left->parent = n->left;
	n->left->right->parent = n->left;
}

/*************************************************
Function: right_rotation
Description: right rotate a subtree at node "n"
Input: tree_node_t *n
Output:
Return: void
Others:
Author: klu2
*************************************************/
void right_rotation(tree_node_t *n)
{
	if (NULL == n)
	{
		return;
	}
	tree_node_t *tmp_node = 0;
	key_t tmp_key = -1;
	tmp_node = n->right;
	tmp_key = n->key;

	n->right = n->left;
	n->key = n->left->key;
	n->left = n->right->left;
	n->left->parent = n;
	n->right->parent = n;

	n->right->left = n->right->right;
	n->right->right = tmp_node;
	n->right->key = tmp_key;
	n->right->right->parent = n->right;
	n->right->left->parent = n->right;
}

/*************************************************
Function: rebalance
Description: adjust the tree to make it balanced
Input: tree_node_t *tree
Output:
Return: void
Others:
Author: klu2
*************************************************/
void rebalance(tree_node_t* tree)
{
	if (NULL == tree)
	{
		return;
	}
	if (NULL == tree->right)
	{
		return;
	}
	if (tree->right->height - tree->left->height >= 2)
	{
		left_rotation(tree);
	
	}
	else if (tree->left->height - tree->right->height >= 2)
	{
		right_rotation(tree);
	}
}

/*************************************************
Function: updateheight
Description:  once a node has been deleted or insert, call this function to keep this tree as a AVL tree
Input: tree_node_t *tree	
          bool brecursive = true	   whether use recursive to update all its parent nodes
Output:
Return: void
Others:
Author: fshi4
*************************************************/
void updateheight(tree_node_t* node,bool brecursive = true)
{
	do 
	{
		if (NULL == node)
		{
			return;
		}
		if (NULL == node->right)
		{
			node->height = N_HEIGHT_START; //not from 0 .but it doesnt matter.
		}
		else
		{
			if ((node->left->height - node->right->height >= 2) || (node->right->height - node->left->height >= 2))
			{
				rebalance(node);
				updateheight(node->left, false);
				updateheight(node->right, false);
			}
			node->height = node->left->height > node->right->height ? node->left->height : node->right->height;
			node->height++;
		}
		node = node->parent;
	} while (brecursive);
}

int insert(tree_node_t *tree, key_t new_key, object_t *new_object)
{  
	if (NULL == tree)
	{
		return -1;
	}
   tree_node_t *tmp_node;
   if( tree->left == NULL )
   {  
	  tree->left = (tree_node_t *) new_object;
      tree->key  = new_key;
      tree->right  = NULL;	
	  tree->height = N_HEIGHT_START; //
   }
   else
   {  
	  tmp_node = tree;
	  tree_node_t* node_parent = NULL;
	  int nrotate = 0;
      while( tmp_node->right != NULL )
      {   
		  node_parent = tmp_node;
		  if (new_key < tmp_node->key)
		  {
			  nrotate = tmp_node->right->right == NULL ? 1 : 0;	   //right rotate
			  tmp_node = tmp_node->left;
		  }
		  else
		  {
			  nrotate = tmp_node->left->right == NULL ? -1 : 0;	 //left rotate
			  tmp_node = tmp_node->right;
		  }
      }
      /* found the candidate leaf. Test whether key distinct */
      if( tmp_node->key == new_key )
         return( -1 );
      /* key is distinct, now perform the insert */
      { 
		 tree_node_t *old_leaf, *new_leaf;
         old_leaf = get_node();
         old_leaf->left = tmp_node->left;
         old_leaf->key = tmp_node->key;
		 old_leaf->parent = tmp_node;
         old_leaf->right  = NULL;

         new_leaf = get_node();
         new_leaf->left = (tree_node_t *) new_object;
         new_leaf->key = new_key;
         new_leaf->right  = NULL;
		 new_leaf->parent = tmp_node;

         if( tmp_node->key < new_key )
         {   
			 tmp_node->left  = old_leaf;
             tmp_node->right = new_leaf;
             tmp_node->key = new_key;
         }
         else
         {   tmp_node->left  = new_leaf;
             tmp_node->right = old_leaf;
         }
		 updateheight(tmp_node);
      }
   }
   return( 0 );
}

tree_node_t *_delete(tree_node_t *tree, key_t delete_key)
{ 
	if (NULL == tree)
	{
		return NULL;
	}
   tree_node_t* parent = NULL;
   tree_node_t *tmp_node, *upper_node, *other_node;
   object_t *deleted_object = NULL;
   if (tree->left == NULL)		 //invalid root
   {
	   return(parent);
   }
   else if( tree->right == NULL )
   {  
	  if(  tree->key == delete_key )  //leaf 
      {  
		  deleted_object = (object_t *) tree->left;
          tree->left = NULL;
         return(tree);
      }
	  else
	  {
		  return(NULL);		   //invalid key
	  }
   }
   else
   { 
	   tmp_node = tree;
      while( tmp_node->right != NULL )
      {   
		  upper_node = tmp_node;
          if( delete_key < tmp_node->key )
          {  
			  tmp_node   = upper_node->left;
              other_node = upper_node->right;
          }
          else
          { 
			 tmp_node   = upper_node->right;
             other_node = upper_node->left;
          }
      }
	  if (tmp_node->key != delete_key)
	  {
		  return(NULL);
	  }
      else
      {  
		  if (NULL != other_node->right)
		  {
			  other_node->left->parent = upper_node;
			  other_node->right->parent = upper_node;
		  }
		 upper_node->key   = other_node->key;
         upper_node->left  = other_node->left;
         upper_node->right = other_node->right;
         deleted_object = (object_t *) tmp_node->left;
         return_node( tmp_node );
         return_node( other_node );

         return(upper_node);	 //return last node
      }
   }
}

void remove_tree(tree_node_t *tree)
{  
	if (NULL == tree)
	{
		return ;
	}
   tree_node_t *current_node, *tmp;
   if( tree->left == NULL )
      return_node( tree );
   else
   {  
	  current_node = tree;
      while(current_node->right != NULL )
      {  if( current_node->left->right == NULL )
         {  return_node( current_node->left );
            tmp = current_node->right;
            return_node( current_node );
            current_node = tmp;
         }
         else
         {  tmp = current_node->left;
            current_node->left = tmp->right;
            tmp->right = current_node;
            current_node = tmp;
         }
      }
      return_node( current_node );
   }
}

tree_node_t *interval_find(tree_node_t *tree, key_t a, key_t b)
{  
	if (NULL == tree)
	{
		return NULL;
	}
   tree_node_t *tr_node;
   tree_node_t *node_stack[200]; int stack_p = 0;
   tree_node_t *result_list, *tmp, *tmp2;
   result_list = NULL;
   node_stack[stack_p++] = tree;
   while( stack_p > 0 )
   {  
	  tr_node = node_stack[--stack_p];
      if( tr_node->right == NULL )
      {  
		if( a <= tr_node->key && tr_node->key < b )
         {  
			tmp = get_node();        /* leaf key in interval */
            tmp->key  = tr_node->key; /* copy to output list */
			tmp->left = tr_node->left;
            tmp->right = result_list;
            result_list = tmp;
         }
      } /* not leaf, might have to follow down */
      else if ( b <= tr_node->key ) /* entire interval left */
         node_stack[stack_p++] = tr_node->left;
      else if ( tr_node->key <= a ) /* entire interval right*/
         node_stack[stack_p++] = tr_node->right;
      else   /* node key in interval, follow left and right */
      {  
		 node_stack[stack_p++] = tr_node->left;
         node_stack[stack_p++] = tr_node->right;
      }
   }
   return( result_list );
}

void check_tree( tree_node_t *tr, int depth, int lower, int upper )
{  
	if (NULL == tr)
	{
		return ;
	}
   if( tr->left == NULL )
   {  
	     printf("Tree Empty\n"); return;
   }
   if( tr->key < lower || tr->key >= upper )
         printf("Wrong Key Order \n");
   if( tr->right == NULL )
   { 
	   if( *( (int *) tr->left) == 10*tr->key + 2 )
         printf("%d(%d)  ", tr->key, depth );
      else
         printf("Wrong Object \n");
   }
   else
   {  
	  check_tree(tr->left, depth+1, lower, tr->key );
      check_tree(tr->right, depth+1, tr->key, upper );
   }
}

///////////////////////////////////////////////////////////////////////////////////////////////
/*
extern text_t * create_text();
extern int length_text( text_t *txt);
extern char * get_line( text_t *txt, int index);
extern void append_line( text_t *txt, char * new_line);
extern char * set_line( text_t *txt, int index, char * new_line);
extern void insert_line( text_t *txt, int index, char * new_line);
extern char * delete_line( text_t *txt, int index);
*/
/*
for text editor interfaces
*/
struct text_t 
{
	tree_node_t* _text;
};

/*************************************************
Function: create_text
Description:  create a pointer ,which poite to a root node of a text editor
Input:
Output:
Return: text_t* pointer of text_t
Others:
Author: fshi4
*************************************************/
text_t* create_text()
{
	text_t * p = new   text_t;
	p->_text = (tree_node_t*)create_tree();
	return (text_t*)p;
}
	  
/*************************************************
Function: length_text
Description: calculate the length of the text
Input: text_t *txt
Output:
Return: int length of the text_t
Others:
Author: klu2
*************************************************/
int length_text(text_t *txt)
{
	if (NULL == txt || NULL == txt->_text )
	{
		return -1;
	}
	tree_node_t* ptmp = txt->_text;
	int ilen = 0;
	
	while(NULL != ptmp)
	{
		if (NULL != ptmp->left && NULL == ptmp->right)     //last  right  one
		{
			ilen = ptmp->key;
			break;
		}
		ptmp = ptmp->right;
	}
	return ilen;
}

/*************************************************
Function: get_line
Description:  return the content of a specific line ,
Input:text_t *txt  pointer of a text
         int index	 the index of a line
Output:
Return: char * content of the line 
Others:
Author: fshi4
*************************************************/
char * get_line(text_t *txt, int index)
{
	if (NULL == txt || NULL == txt->_text)
	{
		return NULL;
	}
	object_t*pFind = find_iterative(txt->_text, (key_t)(index));
	return pFind == NULL ? NULL : (char*)(pFind);
}

/*************************************************
Function: append_line
Description: append a new line at the end
Input: text_t *txt pointernof a text
 		char *new_line the content of the line to be append
Output:
Return: void
Others:
Author: klu2
*************************************************/
void append_line(text_t *txt, char * new_line)
{
	if (NULL == txt || NULL == txt->_text)
	{
		return ;
	}
	int ilen = length_text(txt);
    insert(txt->_text, ilen + 1, (object_t*)(new_line));
	return;
}

/*************************************************
Function: set_line
Description:  set the content of a specific line ,
Input:text_t *txt  pointer of a text
         int index	 the index of a line
		 char * new_line new version of content 
Output:
Return: char * old version  content of the line
Others:
Author: fshi4
*************************************************/
char * set_line(text_t *txt, int index, char * new_line)
{
	if (NULL == txt || NULL == txt->_text)
	{
		return NULL;
	}
	char* pPrevious = NULL;
	tree_node_t* pNode = find_node(txt->_text, (key_t)index);
	if (NULL != pNode)
	{
		pPrevious = (char*)pNode->left;		   
		pNode->left = (tree_node_t*)(new_line);
	}
	return pPrevious;
}

/*
insert_line	 at  n
step 1) append new line 
       2) copy	n->n+1,update the key.
	   3) after finished copying, set the content of n as new_line
*/
/*************************************************
Function: insert_line
Description: insert a line at any index
Input: text_t *txt pointernof a text
 		int index the position of new line
 		char *new_line the content of the line to be insert
Output:
Return: void
Others:
Author: klu2
*************************************************/
void insert_line(text_t *txt, int index, char * new_line)
{
	if (NULL == txt || NULL == txt->_text)
	{
		return ;
	}
	int ilen = length_text(txt);
	int nInsert = insert(txt->_text, ilen + 1, (object_t*)(new_line));
	if (nInsert < 0)
	{
		return;
		//failed log
	}
	if (index <= ilen)
	{
		int iOrgIdx = index;

		tree_node_t* pLast = find_node(txt->_text, index);
		if (NULL == pLast)
		{
			return;
		}
		tree_node_t* pLastLf = pLast->left;
		tree_node_t* pTmp = pLastLf;
		while (NULL != pLast)
		{
			index++;
			pLast = find_node(txt->_text, index);
			if (NULL != pLast)
			{
				pTmp = pLast->left;
				pLast->left = pLastLf;
				pLastLf = pTmp;
			}
			else
			{
				break;
			}
		}
		set_line(txt, iOrgIdx, new_line);
	}
	return;
}

/*************************************************
Function: delete_line
Description:  delete  a specific line ,
Input:text_t *txt  pointer of a text
int index	 the index of a line
Output:
Return: char * content of the line
Others:
Author: fshi4
*************************************************/
char * delete_line(text_t *txt, int index)
{
	if (NULL == txt || NULL == txt->_text)
	{
		return NULL;
	}
	tree_node_t* pDel = find_node(txt->_text, index);
	if (NULL == pDel)	  //failed on finding the line "index"
	{
		return NULL;
	}
	object_t* pReturn = (object_t*)pDel->left;
	tree_node_t* pLast = pDel;
	tree_node_t* pNext = pDel;
	while (NULL != pLast)		  //move content 
	{
		index++;
		pNext = find_node(txt->_text, index);
		if (NULL == pNext)
		{
			break;
		}
		pLast->left = pNext->left;
		pLast = pNext;
	}
	tree_node_t * pLastone =  _delete(txt->_text, (key_t)(length_text(txt)));	  //delete node 
	updateheight(pLastone);				  //keep balance

	return (char*)pReturn;
}

///end
/////////////////////////////////////////////////////////////////////////////////////////
/*
int main()
{  
	text_t *searchtree;
	char nextop;
	searchtree = create_text();
	int nlen = length_text(searchtree);
	char* pdel = delete_line(searchtree, 100);
	printf("Made Tree\n");
	printf("In the following, the key n is associated wth the objecct 10n+2\n");
	while ((nextop = getchar()) != 'q')
	{
		
		if (nextop == 'r')
		{
			for (int i = 1; i <= 10000; i++)
			{
				char *sz = (char*)malloc(sizeof(char) * 8);
				sprintf(sz, "line%d", i);
				int j = rand()% 10;
				switch (j)
				{
				case 0:	
						{
							append_line(searchtree, sz);
						    printf("appended_line  at %d  with %s \n", length_text(searchtree) , sz);
						}
					break;
				case 1: 
						{
							insert_line(searchtree, i / (j+ rand() % 10), sz);
							printf("insert_line at  %d  with %s \n", i / j,sz);
						}
					break;
				case 2:
						{
							char* p = get_line(searchtree,i - j);
							printf("get_line at %d with %s \n", i - j, (p == NULL) ? "null":p);
						}
						break;
				case 3:
						{
							int k = length_text(searchtree) - rand() % 10;
							char* p = delete_line(searchtree, k);
							printf("delete_line at %d with %s\n", k, (p == NULL) ? "null" : p);
						}
					break;
				default:
					{
						append_line(searchtree, sz);
						printf("appended_line  at %d  with %s \n", length_text(searchtree) , sz);
					}
					break;
				}
			}
		}
		else if (nextop == 'd')
		{
			for (int i = 0; i < 16; i++)
			{
				char *sz = (char*)malloc(sizeof(char) * 8);
				sprintf(sz, "line%d", i+1);
				append_line(searchtree, sz);
				printf("appended_line  at %d  with %s \n", length_text(searchtree), sz);
			}
			for (int j=16; j >0;j--)
			{
				char* p = delete_line(searchtree,j);
				printf("delete_line at %d with %s\n", j , (p == NULL) ? "null" : p);
			}
		}
	}
	return -1;
}
*/
