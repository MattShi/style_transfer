#ifndef __541_PROJ2_API_H__
#define __541_PROJ2_API_H__

class m_tree_t;
m_tree_t * create_m_tree();
void destroy_m_tree(m_tree_t* tree);
void insert_interval(m_tree_t * tree, int a, int b);
void delete_interval(m_tree_t * tree, int a, int b);
int query_length(m_tree_t * tree);

#endif