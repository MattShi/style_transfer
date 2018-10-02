/*****************************************************************************
Copyright: 2017,NCSU
File name:	   fshi4_klu2.cc
Description:  541 hw1
Author: fangyuan shi(fshi4), kai lu(klu2)
Version: v1.01
Date:13/03/2017
History:
*****************************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX(x, y) (((x) > (y)) ? (x) : (y))
#define MIN(x, y) (((x) < (y)) ? (x) : (y))

const int N_HEIGHT_START = 0;	  // the zero height level 
const int N_MIN_UNBALANCE_HEIGHT = 2;
const int N_LEFT_MIN = -0xffffff;
const int N_RIGHT_MAX = 0xffffff;
const int N_DEBUG_OUTPUT = 0;

typedef int key_t;
typedef int height_t;
typedef int object_t;
typedef int len_t;
typedef int interval_t;

//from sliders
typedef struct tr_mgt_info_t
{
	int leftMin;
	int rightMax;
	int measure;
	int l;
	int r;
}tree_mg_info_t;

typedef struct tr_node_list_t {
	int left;
	int right;
	struct tr_node_list_t* next;
}tree_node_list_t;

typedef struct tr_n_t
{
	key_t      key;
	height_t  height;
	struct tr_n_t  *left;
	struct tr_n_t  *right;
	struct tr_n_t  *parent;	         // point to the parent 

	struct tr_node_list_t *node_list;	 	//for range list 
	tree_mg_info_t mginfo;		 //for measure info
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
	if (free_list != NULL)
	{
		tmp = free_list;
		free_list = free_list->right;
	}
	else
	{
		if (currentblock == NULL || size_left == 0)
		{
			currentblock =
				(tree_node_t *)malloc(BLOCKSIZE * sizeof(tree_node_t));
			size_left = BLOCKSIZE;
		}
		tmp = currentblock++;
		size_left -= 1;
	}
	if (NULL != tmp)
	{
		tmp->left = NULL;
		tmp->right = NULL;
		tmp->parent = NULL;
		tmp->key = 0;
		tmp->height = N_HEIGHT_START;
		//
		tmp->node_list = NULL;
		tmp->mginfo.leftMin = N_LEFT_MIN;
		tmp->mginfo.rightMax = N_RIGHT_MAX;
		tmp->mginfo.measure = 0;
		tmp->mginfo.l = 0;
		tmp->mginfo.r = 0;
	}
	return(tmp);
}

void return_node(tree_node_t *node)
{
	if (NULL == node)
	{
		return;
	}
	node->right = free_list;
	free_list = node;
	nodes_returned += 1;
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

	return(tmp_node);
}

object_t *find_iterative(tree_node_t *tree, key_t query_key)
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
			return((object_t *)tmp_node->left);
		else
			return(NULL);
	}
}

object_t *find_recursive(tree_node_t *tree, key_t query_key)
{
	if (NULL == tree)
	{
		return NULL;
	}
	if (tree->left == NULL ||
		(tree->right == NULL && tree->key != query_key))
		return(NULL);
	else if (tree->right == NULL && tree->key == query_key)
		return((object_t *)tree->left);
	else
	{
		if (query_key < tree->key)
			return(find_recursive(tree->left, query_key));
		else
			return(find_recursive(tree->right, query_key));
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
//measure tree section

/*************************************************
Function: creatList
Description:  create a list node 
Input:int left, int right
Output:
Return:	 tree_node_list_t*
Others:
Author: klu2
*************************************************/
tree_node_list_t* creatList(int left, int right)
{
	tree_node_list_t *newList = (tree_node_list_t*)malloc(sizeof(tree_node_list_t));
	newList->left = left;
	newList->right = right;
	newList->next = NULL;
	return 	newList;
}

/*************************************************
Function: delList
Description:  delete node list,free memory 
Input: tree_node_list_t* list
Output:
Return:
Others:
Author: klu2
*************************************************/
void delList(tree_node_list_t* list)
{
	if (NULL == list)
	{
		return;
	}
	tree_node_list_t *pNext = list;
	tree_node_list_t *pTmp = NULL;
	while (NULL != pNext)
	{
		pTmp = pNext->next;
		delete pNext;
		pNext = pTmp;
	}
}

/*************************************************
Function: addIntervalNode
Description:  add interval node to node list
Input: tree_node_t* tmp_node
tree_node_list_t* list interval list
Output:
Return:
Others:
Author: klu2
*************************************************/
void addIntervalNode(tree_node_t* tree, tree_node_list_t *list)
{
	if (NULL == tree)
	{
		return;
	}
	tree_node_list_t *newNode = creatList(list->left, list->right);
	if (tree->left == NULL)
	{
		tree->left = (tree_node_t*)newNode;
	}
	else
	{
		newNode->next = (tree_node_list_t*)(tree->left);   //add to the head pos
		tree->left = (tr_n_t *)newNode;
	}
}

/*************************************************
Function: deIntervalNode
Description:  delete interval node from node list
Input: tree_node_t* tmp_node
 tree_node_list_t* interval interval list
Output:
Return:
Others:
Author: fshi4
*************************************************/
void deIntervalNode(tree_node_t* tmp_node, tree_node_list_t* interval)
{
	if (NULL == tmp_node)
	{
		return;
	}
	if (NULL == interval)
	{
		return;
	}
	tree_node_list_t* tmp = (tree_node_list_t*)tmp_node->left;
	tree_node_list_t* pnext = tmp->next;
	if (tmp != NULL && tmp->left == interval->left 
		&& tmp->right == interval->right)
	{
		tmp_node->left = (tree_node_t*)pnext;
		free(tmp);
		return;
	}

	while (pnext != NULL)
	{
		if ( pnext->right == interval->right 
			&& pnext->left == interval->left)
		{
			tmp->next = pnext->next;
			free(pnext);
			return;
		}
		tmp = tmp->next;
		pnext = pnext->next;
	}
}

/*************************************************
Function: calLeafMeasure
Description:  calculate leaf node measure info
Input: tree_node_t* tree
Output:
Return:
Others:
Author: fshi4
*************************************************/
void calLeafMeasure(tree_node_t* tree)
{
	int left = 0, right = 0;
	if (tree->mginfo.leftMin < tree->mginfo.l) 
	{
		left = tree->mginfo.l;
	}
	else 
	{
		left = tree->mginfo.leftMin;
	}

	if (tree->mginfo.rightMax > tree->mginfo.r) 
	{
		right = tree->mginfo.r;
	}
	else 
	{
		right = tree->mginfo.rightMax;
	}
	tree->mginfo.measure = right - left;
}


/*************************************************
Function: calInternalMeasure
Description:  calculate internal node measure info
Input: tree_node_t* node 
Output:
Return: 
Others:
Author: klu2
*************************************************/
void calInternalMeasure(tree_node_t *n)
{
	if (NULL == n || NULL == n->left || NULL == n->right)
	{
		return;
	}
	if (n->right->mginfo.leftMin < n->mginfo.l && n->left->mginfo.rightMax >= n->mginfo.r)
		n->mginfo.measure = n->mginfo.r - n->mginfo.l;
	if (n->right->mginfo.leftMin >= n->mginfo.l && n->left->mginfo.rightMax >= n->mginfo.r)
		n->mginfo.measure = n->mginfo.r - n->key + n->left->mginfo.measure;
	if (n->right->mginfo.leftMin < n->mginfo.l && n->left->mginfo.rightMax < n->mginfo.r)
		n->mginfo.measure = n->right->mginfo.measure + n->key - n->mginfo.l;
	if (n->right->mginfo.leftMin >= n->mginfo.l && n->left->mginfo.rightMax < n->mginfo.r)
		n->mginfo.measure = n->right->mginfo.measure + n->left->mginfo.measure;
}

/*************************************************
Function: calLeftMin
Description:  calculate left min of measure info
Input: tree_node_list_t* node ,range node list
Output:
Return: int left min
Others:
Author: klu2
*************************************************/
int calLeftMin(tree_node_list_t* node)
{
	if (NULL == node)
	{
		return N_LEFT_MIN;
	}
	int min = node->left;
	node = node->next;
	while (node != NULL)
	{
		if (node->left < min)
		{
			min = node->left;
		}
		node = node->next;
	}
	return min;
}


/*************************************************
Function: calRightMax
Description:  calculate right max of measure info
Input: tree_node_list_t* node ,range node list
Output:
Return: int right max
Others:
Author: fshi4
*************************************************/
int calRightMax(tree_node_list_t* node)
{
	if (NULL == node)
	{
		return N_RIGHT_MAX;
	}
	int max = node->right;
	node = node->next;
	while (node != NULL)
	{
		if (node->right > max) 
		{
			max = node->right;
		}
		node = node->next;
	}
	return max;
}

/*************************************************
Function: updateMeasure
Description:  update measure info,recursive	
Input: tree_node_t *tree
Output:
Return: void
Others:
Author: fshi4
*************************************************/
void updateMeasure(tree_node_t * node)
{
	if (NULL == node)
	{
		return;
	}
	calInternalMeasure(node);
	if ((NULL != node->left) && (NULL != node->right) )
	{
		node->mginfo.leftMin = MIN(node->left->mginfo.leftMin, node->right->mginfo.leftMin);
		node->mginfo.rightMax = MAX(node->left->mginfo.rightMax, node->right->mginfo.rightMax);
	}
	updateMeasure(node->parent);
}
//////////////////////////////////////////////////////////////////////


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

	//for measure info
	n->left->mginfo.l = n->mginfo.l;
	n->left->mginfo.r = n->key;
	n->left->mginfo.leftMin = MIN(n->left->left->mginfo.leftMin, n->left->right->mginfo.leftMin);
	n->left->mginfo.rightMax = MAX(n->left->left->mginfo.rightMax, n->left->right->mginfo.rightMax);

	calInternalMeasure(n->left);
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

	//for measure info
	n->right->mginfo.l = n->key;
	n->right->mginfo.r = n->mginfo.r;
	n->right->mginfo.leftMin = MIN(n->right->left->mginfo.leftMin, n->right->right->mginfo.leftMin);
	n->right->mginfo.rightMax = MAX(n->right->left->mginfo.rightMax, n->right->right->mginfo.rightMax);

	calInternalMeasure(n->right);
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
	if (tree->right->height - tree->left->height >= N_MIN_UNBALANCE_HEIGHT)
	{
		left_rotation(tree);
	}
	else if (tree->left->height - tree->right->height >= N_MIN_UNBALANCE_HEIGHT)
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
void updateHeight(tree_node_t* node, bool brecursive = true)
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
			if ((node->left->height - node->right->height >= N_MIN_UNBALANCE_HEIGHT)
				|| (node->right->height - node->left->height >= N_MIN_UNBALANCE_HEIGHT))
			{
				rebalance(node);
				updateHeight(node->left, false);
				updateHeight(node->right, false);
			}
			node->height = node->left->height > node->right->height ? node->left->height : node->right->height;
			node->height++;
		}
		node = node->parent;
	} while (brecursive);
}

void updateMeasureinfo(tree_node_t* node )
{
	bool bf = false;
	while ((NULL != node) && (NULL != node->left) && (NULL != node->right) && !bf)
	{
		int tmp_height, old_height;
		old_height = node->height;
		if (node->left->height - node->right->height == 2)
		{
			if (node->left->left->height - node->right->height == 1)
			{
				right_rotation(node);
				node->right->height = node->right->left->height + 1;
				node->height = node->right->height + 1;
			}
			else
			{
				left_rotation(node->left);
				right_rotation(node);
				tmp_height = node->left->left->height;
				node->left->height =
					tmp_height + 1;
				node->right->height =
					tmp_height + 1;
				node->height = tmp_height + 2;
			}
		}
		else if (node->left->height - node->right->height == -2) 
		{
			if (node->right->right->height - node->left->height == 1) 
			{
				left_rotation(node);
				node->left->height = node->left->right->height + 1;
				node->height = node->left->height + 1;
			}
			else 
			{
				right_rotation(node->right);
				left_rotation(node);
				tmp_height = node->right->right->height;
				node->left->height = tmp_height + 1;
				node->right->height = tmp_height + 1;
				node->height = tmp_height + 2;
			}
		}
		else 
		{
			if (node->left->height > node->right->height)
				node->height = node->left->height + 1;
			else
				node->height = node->right->height + 1;
		}
		if (node->height == old_height)
		{
			bf = true;
		}
		node = node->parent;
	}
}

int insert(tree_node_t *tree, key_t new_key, tree_node_list_t *list)
{
	if (NULL == tree || list == NULL)
	{
		return -1;
	}

	tree_node_t *tmp_node = NULL;
	if (tree->left == NULL)
	{
		tree_node_list_t *newList = creatList(list->left, list->right);

		tree->left = (tree_node_t *)newList;	//as our data
		tree->key = new_key;
		tree->right = NULL;
		tree->height = N_HEIGHT_START; //
																		
		tree->node_list = newList;
		// where out meausre infomation stored
		tree->mginfo.leftMin = list->left;
		tree->mginfo.rightMax = list->right;
		tree->mginfo.l = N_LEFT_MIN;
		tree->mginfo.r = N_RIGHT_MAX;

		calLeafMeasure(tree);
	}
	else
	{
		tmp_node = tree;
		tree_node_t* node_parent = NULL;
		int nrotate = 0;
		while (tmp_node->right != NULL)
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
		if (tmp_node->key == new_key)	  //update left and right  leaf node
		{
			addIntervalNode(tmp_node, list);
			tmp_node->mginfo.leftMin = MIN(tmp_node->mginfo.leftMin, list->left);
			tmp_node->mginfo.rightMax = MAX(tmp_node->mginfo.rightMax, list->right);
			calLeafMeasure(tmp_node);
		}
		else
		{
			tree_node_t *old_leaf, *new_leaf;
			old_leaf = get_node();
			old_leaf->left = tmp_node->left;
			old_leaf->key = tmp_node->key;
			old_leaf->parent = tmp_node;
			old_leaf->right = NULL;
			old_leaf->height = 0;
			old_leaf->mginfo.leftMin = tmp_node->mginfo.leftMin;
			old_leaf->mginfo.rightMax = tmp_node->mginfo.rightMax;

			new_leaf = get_node();
			addIntervalNode(new_leaf, list);
			new_leaf->key = new_key;
			new_leaf->right = NULL;
			new_leaf->parent = tmp_node;
			new_leaf->height = 0;
			new_leaf->mginfo.leftMin = list->left;
			new_leaf->mginfo.rightMax = list->right;

			if (tmp_node->key < new_key)
			{
				tmp_node->left = old_leaf;
				tmp_node->right = new_leaf;
				tmp_node->key = new_key;
				old_leaf->mginfo.l = tmp_node->mginfo.l;
				old_leaf->mginfo.r = new_key;
				new_leaf->mginfo.l = new_key;
				new_leaf->mginfo.r = tmp_node->mginfo.r;
			}
			else
			{
				tmp_node->left = new_leaf;
				tmp_node->right = old_leaf;
				new_leaf->mginfo.l = tmp_node->mginfo.l;
				new_leaf->mginfo.r = tmp_node->key;
				old_leaf->mginfo.l = tmp_node->key;
				old_leaf->mginfo.r = tmp_node->mginfo.r;
			}

			calLeafMeasure(old_leaf);
			calLeafMeasure(new_leaf);

			tmp_node->mginfo.leftMin = MIN(tmp_node->left->mginfo.leftMin, tmp_node->right->mginfo.leftMin);
			tmp_node->mginfo.rightMax = MAX(tmp_node->left->mginfo.rightMax, tmp_node->right->mginfo.rightMax);
		}
		updateMeasure(tmp_node);
		updateHeight(tmp_node);
	}
	return(0);
}

tree_node_t *deleteTree(tree_node_t *tree, key_t delete_key, tree_node_list_t *list)
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
	else if (tree->right == NULL)
	{
		if (tree->key == delete_key)  //leaf 
		{
			deleted_object = (object_t *)tree->left;
			tree->left = NULL;

			tree->mginfo.leftMin = 0;
			tree->mginfo.rightMax = 0;
			tree->mginfo.l = N_LEFT_MIN;
			tree->mginfo.r = N_RIGHT_MAX;
			tree->mginfo.measure = 0;

			if (N_DEBUG_OUTPUT > 0)
			{
				printf("tree length = %d \n", tree->mginfo.measure);
			}
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
		while (tmp_node->right != NULL)
		{
			upper_node = tmp_node;
			if (delete_key < tmp_node->key)
			{
				tmp_node = upper_node->left;
				other_node = upper_node->right;
			}
			else
			{
				tmp_node = upper_node->right;
				other_node = upper_node->left;
			}
		}
		if (tmp_node->key != delete_key)
		{
			return(NULL);
		}
		else
		{
			deIntervalNode(tmp_node, list);
			if (NULL != other_node->right)
			{
				other_node->left->parent = upper_node;
				other_node->right->parent = upper_node;
			}
			if (NULL == tmp_node->left)
			{
				upper_node->key = other_node->key;
				upper_node->left = other_node->left;
				upper_node->right = other_node->right;
				upper_node->mginfo.leftMin = other_node->mginfo.leftMin;
				upper_node->mginfo.rightMax = other_node->mginfo.rightMax;
				upper_node->mginfo.measure = other_node->mginfo.measure;
				upper_node->height = other_node->height;
				if (upper_node->right != NULL) 
				{
					upper_node->right->mginfo.r = upper_node->mginfo.r;
					upper_node->left->mginfo.l = upper_node->mginfo.l;
				}

				//deleted_object = (object_t *)tmp_node->left;
				return_node(tmp_node);
				return_node(other_node);
				calLeafMeasure(upper_node);
				//upper_node = upper_node->parent;
			}
			else
			{
				tmp_node->mginfo.leftMin = calLeftMin((tree_node_list_t*)tmp_node->left);
				tmp_node->mginfo.rightMax = calRightMax((tree_node_list_t*)tmp_node->left);
				calLeafMeasure(tmp_node);
			}
			updateMeasure(upper_node);
			updateHeight(upper_node);

			if (N_DEBUG_OUTPUT > 0)
			{
				printf("tree length = %d \n", tree->mginfo.measure);
			}

			return(upper_node);	 //return last node
		}
	}
}

void remove_tree(tree_node_t *tree)
{
	if (NULL == tree)
	{
		return;
	}
	tree_node_t *current_node, *tmp;
	if (tree->left == NULL)
		return_node(tree);
	else
	{
		current_node = tree;
		while (current_node->right != NULL)
		{
			if (current_node->left->right == NULL)
			{
				return_node(current_node->left);
				tmp = current_node->right;
				return_node(current_node);
				current_node = tmp;
			}
			else
			{
				tmp = current_node->left;
				current_node->left = tmp->right;
				tmp->right = current_node;
				current_node = tmp;
			}
		}
		return_node(current_node);
	}
}

tree_node_t *interval_find(tree_node_t *tree, key_t a, key_t b)
{
	if (NULL == tree)
	{
		return NULL;
	}
	tree_node_t *tr_node;
	tree_node_t *node_stack[200]; 
	int stack_p = 0;
	tree_node_t *result_list, *tmp;
	result_list = NULL;
	node_stack[stack_p++] = tree;
	while (stack_p > 0)
	{
		tr_node = node_stack[--stack_p];
		if (tr_node->right == NULL)
		{
			if (a <= tr_node->key && tr_node->key < b)
			{
				tmp = get_node();        /* leaf key in interval */
				tmp->key = tr_node->key; /* copy to output list */
				tmp->left = tr_node->left;
				tmp->right = result_list;
				result_list = tmp;
			}
		} /* not leaf, might have to follow down */
		else if (b <= tr_node->key) /* entire interval left */
		{
			node_stack[stack_p++] = tr_node->left;
		}
		else if (tr_node->key <= a) /* entire interval right*/
		{
			node_stack[stack_p++] = tr_node->right;
		}
		else   /* node key in interval, follow left and right */
		{
			node_stack[stack_p++] = tr_node->left;
			node_stack[stack_p++] = tr_node->right;
		}
	}
	return(result_list);
}

void check_tree(tree_node_t *tr, int depth, int lower, int upper)
{
	if (NULL == tr)
	{
		return;
	}
	if (tr->left == NULL)
	{
		printf("Tree Empty\n"); return;
	}
	if (tr->key < lower || tr->key >= upper)
		printf("Wrong Key Order \n");
	if (tr->right == NULL)
	{
		if (*((int *)tr->left) == 10 * tr->key + 2)
			printf("%d(%d)  ", tr->key, depth);
		else
			printf("Wrong Object \n");
	}
	else
	{
		check_tree(tr->left, depth + 1, lower, tr->key);
		check_tree(tr->right, depth + 1, tr->key, upper);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////
/*
for text editor interfaces
*/
struct m_tree_t
{
	tree_node_t* _text;
};

/*************************************************
Function: create_m_tree
Description:  create a pointer ,which point to a tree
Input:
Output:
Return: m_tree_t* pointer of m_tree_t
Others:
Author: fshi4
*************************************************/
m_tree_t*  create_m_tree()
{
	return  ((m_tree_t*)create_tree());
}

/*************************************************
Function: insert_interval
Description:  insert a interval with a and b
Input:m_tree_t * tree pointer
int a	   start
int b     end
Output:
Return: void
Others:
Author: fshi4
*************************************************/
void insert_interval(m_tree_t * tree, int a, int b)
{
	if (a > b)
	{
		return;
	}
	tree_node_list_t *list = creatList(a, b);
	insert((tree_node_t*)tree, a, list);
	insert((tree_node_t*)tree, b, list);
	delList(list);
}

/*************************************************
Function: delete_interval
Description:  delete a interval with a and b
Input:m_tree_t * tree pointer
int a	   start
int b     end
Output:
Return: void
Others:
Author: fshi4
*************************************************/
void delete_interval(m_tree_t * tree, int a, int b)
{
	if (a > b)
	{
		return;
	}
	tree_node_list_t *list = creatList(a, b);
	deleteTree((tree_node_t*)tree, a, list);
	deleteTree((tree_node_t*)tree, b, list);
	delList(list);
}

/*************************************************
Function: query_length
Description: query the length of a tree
Input: m_tree_t * tree pointer of a tree
Output:
Return: length of a measure tree
Others:
Author: fshi4
*************************************************/
int  query_length(m_tree_t * tree)
{
	if (NULL == tree )
	{
		return -1;
	}
	return ((tree_node_t*)tree)->mginfo.measure;
}

/*************************************************
Function: destroy_m_tree
Description:  detroy tree and free the memory
Input:m_tree_t *tree	  pointer to a tree
Output:
Return: 
Others:
Author: klu2
*************************************************/
void destroy_m_tree(m_tree_t *tree)
{
	remove_tree((tree_node_t*)tree);
	return;
}
///end
/////////////////////////////////////////////////////////////////////////////////////////
