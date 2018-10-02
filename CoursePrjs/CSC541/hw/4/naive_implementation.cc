#include <set>
#include <utility>
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <unordered_map>
#include <set>
#include "API.h"
#define NEGATIVE_INFINITE -100000000
#define POSITIVE_INFINITE 100000000

using namespace std;
const int N_HEIGHT_START = 0;	  // the zero height level
typedef int key_t;
typedef int height_t;
typedef int measure_t;
typedef interval_list_node object_t;

struct interval_list_node{
    int left;
    int right;
};

struct m_tree_t{
    key_t      key;
	height_t  height;
    m_tree_t  *left;
    m_tree_t  *right;
	m_tree_t  *parent;	         // point to the parent

	key_t lefrmin;
	key_t rightmax;

    int count;
    int l;
    int r;

	measure_t measure;

    set<*interval_list_node> intervals;

};

#define BLOCKSIZE 256

m_tree_t *currentblock = NULL;
int    size_left;
m_tree_t *free_list = NULL;
int nodes_taken = 0;
int nodes_returned = 0;
unordered_map<object_t, int> leaves;


///////////////////////////////////////////////implementation of AVL tree
m_tree_t *get_node()
{
  m_tree_t *tmp = NULL;
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
                (m_tree_t *) malloc( BLOCKSIZE * sizeof(m_tree_t) );
        size_left = BLOCKSIZE;
     }
     tmp = currentblock++;

	 tmp->left = NULL;
	 tmp->right = NULL;
	 tmp->parent = NULL;
	 tmp->key = 0;
	 tmp->height = N_HEIGHT_START;
      tmp->measure = 0;
      tmp->lefrmin = NEGATIVE_INFINITE;
      tmp->rightmax = POSITIVE_INFINITE;
      tmp->intervals = NULL;

     size_left -= 1;
  }
  return( tmp );
}

int max(int a, int b){
    if (a > b)
        return a;
    else
        return b;
}

int min(int a, int b){
    if (a < b)
        return a;
    else
        return b;
}

void return_node(m_tree_t *node)
{
	if (NULL == node)
	{
		return;
	}
   node->right = free_list;
   free_list = node;
   nodes_returned +=1;
}



object_t *find_iterative(m_tree_t *tree, key_t query_key)
{
	if (NULL == tree)
	{
		return NULL;
	}
   m_tree_t *tmp_node;

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

object_t *find_recursive(m_tree_t *tree, key_t query_key)
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
m_tree_t *find_node(m_tree_t *tree, key_t query_key)
{
	if (NULL == tree)
	{
		return NULL;
	}
	m_tree_t *tmp_node;
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
Input: m_tree_t *n
Output:
Return: void
Others:
Author: fshi4
*************************************************/
void left_rotation(m_tree_t *n)
{
	if (NULL == n)
	{
		return;
	}
	m_tree_t *tmp_node = 0;
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
Input: m_tree_t *n
Output:
Return: void
Others:
Author: klu2
*************************************************/
void right_rotation(m_tree_t *n)
{
	if (NULL == n)
	{
		return;
	}
	m_tree_t *tmp_node = 0;
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
Input: m_tree_t *tree
Output:
Return: void
Others:
Author: klu2
*************************************************/
void rebalance(m_tree_t* tree)
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
Input: m_tree_t *tree
          bool brecursive = true	   whether use recursive to update all its parent nodes
Output:
Return: void
Others:
Author: fshi4
*************************************************/
void updateheight(m_tree_t* node,bool brecursive = true)
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

/*
 * different from naive AVL tree, add the list into interval_list rather than replace it.
 */
int insert(m_tree_t *tree, key_t new_key, object_t *new_object)
{
	if (NULL == tree)
	{
		return -1;
	}
   m_tree_t *tmp_node;
   if( tree->left == NULL )
   {
       interval_list_node* list_tmp = (interval_list_node*) malloc(sizeof(interval_list_node));
       list_tmp->left = new_object->left;
       list_tmp->right = new_object->right;
	   tree->left = (m_tree_t *) new_object;
       tree->key  = new_key;
       tree->right  = NULL;
	   tree->height = N_HEIGHT_START; //
       tree->intervals.insert(list_tmp);
   }
   else
   {
	  tmp_node = tree;
	  m_tree_t* node_parent = NULL;
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
		 m_tree_t *old_leaf, *new_leaf;
         old_leaf = get_node();
         old_leaf->left = tmp_node->left;
         old_leaf->key = tmp_node->key;
		 old_leaf->parent = tmp_node;
         old_leaf->right  = NULL;

         new_leaf = get_node();
         new_leaf->left = (m_tree_t *) new_object;
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

m_tree_t *_delete(m_tree_t *tree, key_t delete_key)
{
	if (NULL == tree)
	{
		return NULL;
	}
   m_tree_t* parent = NULL;
   m_tree_t *tmp_node, *upper_node, *other_node;
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

void remove_tree(m_tree_t *tree)
{
	if (NULL == tree)
	{
		return ;
	}
   m_tree_t *current_node, *tmp;
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

m_tree_t *interval_find(m_tree_t *tree, key_t a, key_t b)
{
	if (NULL == tree)
	{
		return NULL;
	}
   m_tree_t *tr_node;
   m_tree_t *node_stack[200]; int stack_p = 0;
   m_tree_t *result_list, *tmp, *tmp2;
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

void check_tree( m_tree_t *tr, int depth, int lower, int upper )
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
///////////////////////////////////////////////////////////////////////////

void updateCounter(m_tree_t *tree, int key){
    m_tree_t* current = find_node(tree,key);
    if (NULL != current) {
        while (NULL != current->parent) {
            current = current->parent;
            current->rightmax = max(current->left->rightmax, current->right->rightmax);
            current->lefrmin = min(current->left->lefrmin, current->right->lefrmin);

            if (current->right->lefrmin < current->left->key && current->left->rightmax >= current->right->key){
                current->measure = current->right - current->left;
            }

            if (current->right->lefrmin >= current->left->key && current->left->rightmax >= current->right->key){
                current->measure = (current->right->key - current->key) + current->left->measure;
            }

            if (current->right->lefrmin < current->left->key && current->left->rightmax < current->right->key){
                current->measure = current->right->measure + (current->key-current->left->key);
            }

            if (current->right->lefrmin >= current->left->key && current->left->rightmax < current->right->key){
                current->measure = current->right->measure + current->left->measure;
            }
        }
    }
}
m_tree_t *create_m_tree(void)
{
    m_tree_t *tmp_node = NULL;
    tmp_node = _node();
    if (NULL == tmp_node)
    {
        return NULL;
    }

    return( tmp_node );
}

void destroy_m_tree(m_tree_t *tree)
{
    remove_tree(tree);
}


void insert_interval(m_tree_t * tree, int a, int b)
{
    if (a <= b){
        interval_list_node *list = (interval_list_node*) malloc(sizeof(interval_list_node));
        list->left = a;
        list->right = b;
        list->next = NULL;
        insert(tree, a, list);
        insert(tree, b, list);
        free(list);
    }
}


void delete_interval(m_tree_t * tree, int a, int b)
{
    if (a <= b){
        if (NULL != find_node(tree, a)){
            if (1 == leaves[a]){
                _delete(tree, a);
                leaves[a] = 0;
                //printf("a: key: %d, %d\n",a, find_node(tree, a));
            }
        }

        if (NULL != find_node(tree, b)){
            if (1 == leaves[b]){
                _delete(tree, b);
                leaves[b] = 0;
                //printf("b: key: %d, %d\n",b, find_node(tree, b));
            }
        }

    }
}


int query_length(m_tree_t * tree)
{
    if (NULL == tree){
        return 0;
    }
    return tree->measure;
}


int main()
{

	return 0;
}